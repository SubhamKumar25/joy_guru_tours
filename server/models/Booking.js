const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  customerName: {
    type: String,
    required: [true, 'Please add customer name']
  },
  customerPhone: {
    type: String,
    required: [true, 'Please add customer phone number']
  },
  customerEmail: {
    type: String,
    default: ''
  },
  pickup: {
    type: String,
    required: [true, 'Please add pickup location']
  },
  destination: {
    type: String,
    required: [true, 'Please add destination location']
  },
  travelDate: {
    type: String,
    required: [true, 'Please add travel date']
  },
  travelTime: {
    type: String,
    required: [true, 'Please add travel time']
  },
  passengerCount: {
    type: Number,
    required: [true, 'Please add passenger count'],
    default: 1
  },
  specialRequest: {
    type: String,
    default: ''
  },
  vehicleName: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    required: true
  },
  driverName: {
    type: String,
    default: ''
  },
  driverPhone: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: [
      'Requested',
      'Fare Proposed',
      'Advance Required',
      'Advance Paid',
      'Confirmed',
      'Trip Scheduled',
      'Trip Started',
      'Trip Completed',
      'Remaining Payment Required',
      'Payment Completed',
      'Invoice Available',
      'Completed',
      'Cancelled'
    ],
    default: 'Requested'
  },
  baseFare: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  finalFare: {
    type: Number,
    default: 0
  },
  advanceRequired: {
    type: Number,
    default: 0
  },
  advancePaid: {
    type: Number,
    default: 0
  },
  balanceDue: {
    type: Number,
    default: 0
  },
  adminNotes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
