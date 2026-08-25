const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL:DEV] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Hospital Marketplace <no-reply@hospitalmarketplace.in>',
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error('[EMAIL] send failed:', err.message);
  }
};

const templates = {
  registrationReceived: (name) => ({
    subject: 'Registration Received - Hospital Marketplace',
    html: `<p>Hi ${name},</p><p>Thank you for registering your facility on Hospital Marketplace. Your listing is currently <b>under verification</b>. We will notify you once it is reviewed.</p>`,
  }),
  registrationApproved: (name) => ({
    subject: 'Your Listing Has Been Approved - Hospital Marketplace',
    html: `<p>Hi ${name},</p><p>Great news! Your facility listing has been <b>approved</b> and is now live on Hospital Marketplace.</p>`,
  }),
  registrationRejected: (name, reason) => ({
    subject: 'Update on Your Hospital Marketplace Listing',
    html: `<p>Hi ${name},</p><p>Unfortunately your listing could not be approved at this time.</p><p><b>Reason:</b> ${reason}</p><p>You may update your listing and resubmit.</p>`,
  }),
  appointmentBooked: ({ patientName, facilityName, doctorName, date, time, bookingRef }) => ({
    subject: `Appointment Request ${bookingRef} - Hospital Marketplace`,
    html: `<p>Hi ${patientName},</p><p>Your appointment request has been received.</p><p><b>Facility:</b> ${facilityName}<br/><b>Doctor:</b> Dr. ${doctorName}<br/><b>Date:</b> ${date}<br/><b>Time:</b> ${time}<br/><b>Booking ID:</b> ${bookingRef}</p><p>The facility will confirm the appointment shortly.</p>`,
  }),
  appointmentStatusChanged: ({ patientName, facilityName, doctorName, date, time, bookingRef, status }) => ({
    subject: `Appointment ${status} - ${bookingRef}`,
    html: `<p>Hi ${patientName},</p><p>Your appointment at <b>${facilityName}</b> with Dr. ${doctorName} on <b>${date}</b> at <b>${time}</b> is now <b>${status}</b>.</p><p><b>Booking ID:</b> ${bookingRef}</p>`,
  }),
  passwordReset: (link) => ({
    subject: 'Password Reset Request - Hospital Marketplace',
    html: `<p>You requested a password reset. Click the link below to set a new password. This link expires in 30 minutes.</p><p><a href="${link}">${link}</a></p><p>If you did not request this, you can ignore this email.</p>`,
  }),
};

module.exports = { sendEmail, templates };
