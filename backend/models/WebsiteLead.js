const mongoose = require('mongoose');

const LEAD_STATUS = ['New', 'Contacted', 'In Discussion', 'Converted', 'Closed'];

const websiteLeadSchema = new mongoose.Schema(
  {
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true, unique: true },
    facilityName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true },
    mobile1: { type: String, required: true },
    facilityType: { type: String, required: true },
    city: { type: String },
    status: { type: String, enum: LEAD_STATUS, default: 'New' },
    notes: { type: String },
  },
  { timestamps: true }
);

websiteLeadSchema.statics.LEAD_STATUS = LEAD_STATUS;

module.exports = mongoose.model('WebsiteLead', websiteLeadSchema);
