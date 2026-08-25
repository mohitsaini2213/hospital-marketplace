const Facility = require('../models/Facility');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { logActivity } = require('../utils/activityLogger');
const { sendEmail, templates } = require('../utils/email');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const dayFromDate = (date) => {
  const [year, month, day] = String(date).split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return DAYS[d.getUTCDay()];
};

const minutes = (value) => {
  const [h, m] = String(value).split(':').map(Number);
  return h * 60 + m;
};

const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`));

const buildSlots = (start, end, duration) => {
  const slots = [];
  let cursor = minutes(start);
  const finish = minutes(end);
  while (cursor + duration <= finish) {
    const h = String(Math.floor(cursor / 60)).padStart(2, '0');
    const m = String(cursor % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    cursor += duration;
  }
  return slots;
};

const findDoctorForFacility = async (facilityId, doctorId) => {
  const doctor = await Doctor.findOne({ _id: doctorId, facility: facilityId, isActive: true });
  if (!doctor) throw new ApiError(404, 'Doctor not found or unavailable.');
  return doctor;
};

// GET /api/facilities/:facilityId/doctors
const listPublicDoctors = asyncHandler(async (req, res) => {
  const facility = await Facility.findOne({ _id: req.params.facilityId, status: 'APPROVED' }).select('_id name city');
  if (!facility) throw new ApiError(404, 'Facility not found.');

  const doctors = await Doctor.find({ facility: facility._id, isActive: true }).sort({ name: 1 });
  res.json({ success: true, data: doctors });
});

// GET /api/facilities/:facilityId/appointments/slots?doctorId=...&date=YYYY-MM-DD
const availableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date || !isValidDate(date)) throw new ApiError(400, 'Doctor and a valid date are required.');

  const facility = await Facility.findOne({ _id: req.params.facilityId, status: 'APPROVED' }).select('_id');
  if (!facility) throw new ApiError(404, 'Facility not found.');

  const doctor = await findDoctorForFacility(facility._id, doctorId);
  const schedule = doctor.availability.find((entry) => entry.day === dayFromDate(date));
  if (!schedule || !schedule.enabled) return res.json({ success: true, data: [] });

  const appointments = await Appointment.find({
    doctor: doctor._id,
    date,
    status: { $in: ['PENDING', 'CONFIRMED'] },
  }).select('time');

  const booked = new Set(appointments.map((a) => a.time));
  const slots = buildSlots(schedule.start, schedule.end, doctor.slotDuration).filter((slot) => !booked.has(slot));

  // Do not offer past times when the selected date is today in India.
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  if (date === today) {
    const now = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
    const nowMinutes = minutes(now);
    return res.json({ success: true, data: slots.filter((slot) => minutes(slot) > nowMinutes) });
  }

  res.json({ success: true, data: slots });
});

// POST /api/facilities/:facilityId/appointments
const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, patientName, patientMobile, patientEmail, date, time, reason } = req.body;
  if (!patientName?.trim() || !patientMobile?.trim() || !doctorId || !date || !time) {
    throw new ApiError(400, 'Doctor, patient name, mobile, date and time are required.');
  }
  if (!isValidDate(date) || !/^\d{2}:\d{2}$/.test(time)) throw new ApiError(400, 'Invalid appointment date or time.');

  const facility = await Facility.findOne({ _id: req.params.facilityId, status: 'APPROVED' });
  if (!facility) throw new ApiError(404, 'Facility not found.');

  const doctor = await findDoctorForFacility(facility._id, doctorId);
  const schedule = doctor.availability.find((entry) => entry.day === dayFromDate(date));
  if (!schedule || !schedule.enabled) throw new ApiError(409, 'Doctor is not available on this day.');

  const allowedSlots = buildSlots(schedule.start, schedule.end, doctor.slotDuration);
  if (!allowedSlots.includes(time)) throw new ApiError(409, 'Please choose an available time slot.');

  const existing = await Appointment.findOne({
    doctor: doctor._id,
    date,
    time,
    status: { $in: ['PENDING', 'CONFIRMED'] },
  });
  if (existing) throw new ApiError(409, 'This appointment slot has just been booked. Please choose another slot.');

  const appointment = await Appointment.create({
    facility: facility._id,
    doctor: doctor._id,
    patientName,
    patientMobile,
    patientEmail,
    date,
    time,
    reason,
    status: 'PENDING',
  });

  await appointment.populate([
    { path: 'facility', select: 'name city mobile1 email' },
    { path: 'doctor', select: 'name specialization qualification consultationFee' },
  ]);

  await Notification.create({
    recipientType: 'FACILITY',
    recipient: facility._id,
    title: 'New Appointment',
    message: `${patientName} requested an appointment with Dr. ${doctor.name} for ${date} at ${time}.`,
    type: 'NEW_APPOINTMENT',
    relatedFacility: facility._id,
  });

  await Notification.create({
    recipientType: 'ADMIN',
    title: 'New Appointment',
    message: `${patientName} requested an appointment at ${facility.name} with Dr. ${doctor.name} for ${date} at ${time}.`,
    type: 'NEW_APPOINTMENT',
    relatedFacility: facility._id,
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`facility_${facility._id}`).emit('new_appointment', {
      appointmentId: appointment._id,
      bookingRef: appointment.bookingRef,
      patientName,
      doctorName: doctor.name,
      date,
      time,
      status: appointment.status,
    });
  }

  if (patientEmail) {
    const tpl = templates.appointmentBooked({
      patientName,
      facilityName: facility.name,
      doctorName: doctor.name,
      date,
      time,
      bookingRef: appointment.bookingRef,
    });
    sendEmail({ to: patientEmail, ...tpl });
  }

  await logActivity({
    actorType: 'SYSTEM',
    actorName: 'Hospital Marketplace',
    action: 'CREATE_APPOINTMENT',
    targetType: 'Appointment',
    target: appointment._id,
    req,
    metadata: { facility: facility._id, doctor: doctor._id, bookingRef: appointment.bookingRef },
  });

  res.status(201).json({
    success: true,
    message: 'Appointment request submitted successfully.',
    data: appointment,
  });
});

// GET /api/facilities/me/appointments
const listFacilityAppointments = asyncHandler(async (req, res) => {
  const { status, date, page = 1, limit = 20 } = req.query;
  const filter = { facility: req.facility._id };
  if (status) filter.status = status;
  if (date) filter.date = date;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [items, total] = await Promise.all([
    Appointment.find(filter)
      .populate('doctor', 'name specialization qualification consultationFee')
      .sort({ date: 1, time: 1, createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Appointment.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
});

// PATCH /api/facilities/me/appointments/:id/status
const updateFacilityAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  if (!Appointment.STATUS.includes(status)) throw new ApiError(400, 'Invalid appointment status.');

  const appointment = await Appointment.findOne({ _id: req.params.id, facility: req.facility._id }).populate('doctor', 'name specialization');
  if (!appointment) throw new ApiError(404, 'Appointment not found.');

  if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(appointment.status) && status !== appointment.status) {
    throw new ApiError(409, 'This appointment is already closed.');
  }

  appointment.status = status;
  if (notes !== undefined) appointment.notes = notes;
  await appointment.save();

  await Notification.create({
    recipientType: 'FACILITY',
    recipient: req.facility._id,
    title: 'Appointment Updated',
    message: `${appointment.bookingRef} is now ${status}.`,
    type: 'APPOINTMENT_STATUS_CHANGED',
    relatedFacility: req.facility._id,
  });

  if (appointment.patientEmail) {
    const tpl = templates.appointmentStatusChanged({
      patientName: appointment.patientName,
      facilityName: req.facility.name,
      doctorName: appointment.doctor.name,
      date: appointment.date,
      time: appointment.time,
      bookingRef: appointment.bookingRef,
      status,
    });
    sendEmail({ to: appointment.patientEmail, ...tpl });
  }

  await logActivity({
    actorType: 'FACILITY',
    actor: req.facility._id,
    actorName: req.facility.name,
    action: 'UPDATE_APPOINTMENT_STATUS',
    targetType: 'Appointment',
    target: appointment._id,
    req,
    metadata: { status },
  });

  res.json({ success: true, message: `Appointment marked ${status.toLowerCase()}.`, data: appointment });
});

// GET /api/facilities/me/doctors
const listFacilityDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ facility: req.facility._id }).sort({ isActive: -1, name: 1 });
  res.json({ success: true, data: doctors });
});

// POST /api/facilities/me/doctors
const createDoctor = asyncHandler(async (req, res) => {
  const { name, specialization, qualification, consultationFee, slotDuration, availability } = req.body;
  if (!name?.trim() || !specialization?.trim()) throw new ApiError(400, 'Doctor name and specialization are required.');

  const doctor = await Doctor.create({
    facility: req.facility._id,
    name,
    specialization,
    qualification,
    consultationFee: Number(consultationFee) || 0,
    slotDuration: Number(slotDuration) || 30,
    availability,
  });

  res.status(201).json({ success: true, message: 'Doctor added successfully.', data: doctor });
});

// PUT /api/facilities/me/doctors/:id
const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ _id: req.params.id, facility: req.facility._id });
  if (!doctor) throw new ApiError(404, 'Doctor not found.');

  const allowed = ['name', 'specialization', 'qualification', 'consultationFee', 'slotDuration', 'availability', 'isActive'];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) doctor[key] = req.body[key];
  });
  await doctor.save();

  res.json({ success: true, message: 'Doctor updated successfully.', data: doctor });
});

// DELETE /api/facilities/me/doctors/:id
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ _id: req.params.id, facility: req.facility._id });
  if (!doctor) throw new ApiError(404, 'Doctor not found.');

  doctor.isActive = false;
  await doctor.save();
  res.json({ success: true, message: 'Doctor deactivated successfully.', data: doctor });
});

module.exports = {
  listPublicDoctors,
  availableSlots,
  createAppointment,
  listFacilityAppointments,
  updateFacilityAppointmentStatus,
  listFacilityDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
