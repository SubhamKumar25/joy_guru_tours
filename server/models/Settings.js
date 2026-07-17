const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'Joy Guru Tours & Travels'
  },
  supportPhone: {
    type: String,
    default: '+91 94350 12345'
  },
  supportWhatsapp: {
    type: String,
    default: '+91 94350 12345'
  },
  supportEmail: {
    type: String,
    default: 'info@joygurutravels.com'
  },
  officeAddress: {
    type: String,
    default: 'Club Road, Silchar, Assam - 788001'
  },
  refundPolicy: {
    type: String,
    default: 'No refund within 24 hours of scheduled travel date.'
  },
  promoCouponCode: {
    type: String,
    default: 'JOYGURU10'
  },
  minAdvancePercent: {
    type: Number,
    default: 25 // 25% minimum advance payment required
  },
  googleClientId: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
