const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientType: { type: String, enum: ['ADMIN', 'FACILITY'], required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, refPath: 'recipientType', index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'NEW_REGISTRATION',
        'WEBSITE_LEAD',
        'FACILITY_UPDATED',
        'VERIFICATION_REQUEST',
        'REGISTRATION_APPROVED',
        'REGISTRATION_REJECTED',
        'LISTING_SUSPENDED',
        'ACCOUNT_UPDATE',
        'NEW_APPOINTMENT',
        'APPOINTMENT_STATUS_CHANGED',
      ],
      required: true,
    },
    relatedFacility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientType: 1, recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
