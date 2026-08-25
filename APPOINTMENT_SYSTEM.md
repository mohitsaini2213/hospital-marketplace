# Hospital Appointment System

Hospital Marketplace now includes an appointment MVP built on the existing React/Vite + Express/MongoDB architecture.

## Included

- Public "Book Appointment" flow from facility details.
- Doctor profiles per facility.
- Weekly doctor availability and configurable slot duration.
- Automatic available-slot generation.
- Double-booking protection for pending/confirmed appointments.
- Patient name, Indian mobile, optional email and visit reason.
- Booking reference ID.
- Facility dashboard:
  - Doctors
  - Appointments
  - Confirm / Decline
  - Complete / Cancel
- Admin dashboard:
  - Platform-wide appointment monitoring
  - Appointment status updates
- Email notifications using the existing SMTP configuration.
- Real-time facility notification using the existing Socket.IO setup.

## MongoDB

No manual migration is required. MongoDB/Mongoose will create the new collections when the first records are written:

- `doctors`
- `appointments`

Existing facilities remain unchanged. They simply need one or more active doctors before online appointment booking becomes available.

## Production deployment

### Render backend

1. Push the code to the GitHub repository connected to Render.
2. Render will redeploy the backend.
3. No new environment variable is required for the appointment MVP.
4. Existing SMTP variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`) are used for appointment emails if configured.

### Vercel frontend

1. Push the frontend changes to GitHub.
2. Vercel will redeploy automatically if Git integration is enabled.
3. Existing `VITE_API_URL` remains unchanged.

## Recommended next phase

For a larger production marketplace, add:

- Patient accounts and appointment history.
- Reschedule flow.
- Doctor leave/holiday management.
- Facility-wide blackout dates.
- SMS/WhatsApp confirmations.
- Reminder notifications (24 hours / 1 hour before).
- Payment/Razorpay for paid consultations.
- Teleconsultation/video appointments.
- Calendar export.
- Patient cancellation policy.
- Appointment analytics.
