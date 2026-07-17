const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  bookingId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  travelDate: {
    type: String,
    required: true
  },
  route: {
    type: String,
    required: true
  },
  finalFare: {
    type: Number,
    required: true
  },
  advancePaid: {
    type: Number,
    required: true
  },
  remainingPaid: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    required: true
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
