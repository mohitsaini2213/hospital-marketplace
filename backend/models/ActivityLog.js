const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actorType: { type: String, enum: ['ADMIN', 'FACILITY', 'SYSTEM'], required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, refPath: 'actorType' },
    actorName: { type: String },
    action: { type: String, required: true }, // e.g. 'LOGIN', 'APPROVE_FACILITY'
    targetType: { type: String }, // e.g. 'Facility'
    target: { type: mongoose.Schema.Types.ObjectId },
    ipAddress: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
