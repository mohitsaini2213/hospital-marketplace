const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    reviewerName: { type: String, required: true, trim: true },
    reviewerEmail: { type: String, trim: true, lowercase: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, maxlength: 1000, trim: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'SPAM'], default: 'PENDING' },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

reviewSchema.index({ facility: 1, status: 1 });

module.exports = mongoose.model('Review', reviewSchema);
