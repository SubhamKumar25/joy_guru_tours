const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please add vehicle name']
  },
  type: {
    type: String,
    enum: ['suv', 'sedan', 'hatchback'],
    required: [true, 'Please add vehicle type']
  },
  number: {
    type: String,
    required: [true, 'Please add licence plate number'],
    unique: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please add seat capacity']
  },
  price: {
    type: Number,
    required: [true, 'Please add base rate per day']
  },
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Maintenance'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
