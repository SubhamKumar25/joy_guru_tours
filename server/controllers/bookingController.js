const mongoose = require('mongoose');
const Booking = require('../models/Booking');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Create new booking request
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      pickup,
      destination,
      travelDate,
      travelTime,
      passengerCount,
      specialRequest,
      vehicleName,
      vehicleType,
      userId
    } = req.body;

    if (!customerName || !customerPhone || !pickup || !destination || !travelDate || !travelTime || !vehicleName || !vehicleType) {
      res.status(400);
      return next(new Error('Please fill in all required travel request fields'));
    }

    const uniqueId = `JG-${1000 + Math.floor(Math.random() * 9000)}`;

    if (!isDbConnected()) {
      // Mock creation in offline mode
      return res.status(201).json({
        success: true,
        data: {
          id: uniqueId,
          userId: userId || null,
          customerName,
          customerPhone,
          customerEmail: customerEmail || '',
          pickup,
          destination,
          travelDate,
          travelTime,
          passengerCount: parseInt(passengerCount) || 1,
          specialRequest: specialRequest || '',
          vehicleName,
          vehicleType,
          status: 'Requested',
          baseFare: 0,
          discount: 0,
          finalFare: 0,
          advanceRequired: 0,
          advancePaid: 0,
          balanceDue: 0,
          createdAt: new Date().toISOString()
        }
      });
    }

    const count = await Booking.countDocuments();
    const dbUniqueId = `JG-${1000 + count + 1}`;

    const booking = await Booking.create({
      id: dbUniqueId,
      userId: userId || null,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      pickup,
      destination,
      travelDate,
      travelTime,
      passengerCount: parseInt(passengerCount) || 1,
      specialRequest: specialRequest || '',
      vehicleName,
      vehicleType,
      status: 'Requested',
      baseFare: 0,
      discount: 0,
      finalFare: 0,
      advanceRequired: 0,
      advancePaid: 0,
      balanceDue: 0
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin View)
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        data: []
      });
    }

    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's own bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        data: []
      });
    }

    const query = {
      $or: [
        { userId: req.user._id },
        { customerEmail: req.user.email },
        { customerPhone: req.user.phone }
      ]
    };
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        data: {
          id: req.params.id,
          customerName: ' राहुल शर्मा (Mock)',
          pickup: 'Silchar',
          destination: 'Guwahati',
          travelDate: '2026-07-20',
          travelTime: '10:00 AM',
          status: 'Requested'
        }
      });
    }

    const booking = await Booking.findOne({ id: req.params.id });
    if (!booking) {
      res.status(404);
      return next(new Error('Booking details not found'));
    }

    const isOwner = req.user.role === 'admin' || 
                    (booking.userId && booking.userId.toString() === req.user._id.toString()) ||
                    booking.customerEmail === req.user.email ||
                    booking.customerPhone === req.user.phone;

    if (!isOwner) {
      res.status(403);
      return next(new Error('Access denied, unauthorized booking reference'));
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking details
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        data: Object.assign({ id: req.params.id }, req.body)
      });
    }

    const booking = await Booking.findOne({ id: req.params.id });
    if (!booking) {
      res.status(404);
      return next(new Error('Booking record not found'));
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = (booking.userId && booking.userId.toString() === req.user._id.toString()) ||
                    booking.customerEmail === req.user.email ||
                    booking.customerPhone === req.user.phone;

    if (!isAdmin && !isOwner) {
      res.status(403);
      return next(new Error('Unauthorized, you cannot update this booking request'));
    }

    if (isAdmin) {
      booking.customerName = req.body.customerName !== undefined ? req.body.customerName : booking.customerName;
      booking.customerPhone = req.body.customerPhone !== undefined ? req.body.customerPhone : booking.customerPhone;
      booking.travelDate = req.body.travelDate !== undefined ? req.body.travelDate : booking.travelDate;
      booking.travelTime = req.body.travelTime !== undefined ? req.body.travelTime : booking.travelTime;
      booking.driverName = req.body.driverName !== undefined ? req.body.driverName : booking.driverName;
      booking.driverPhone = req.body.driverPhone !== undefined ? req.body.driverPhone : booking.driverPhone;
      booking.status = req.body.status !== undefined ? req.body.status : booking.status;
      booking.adminNotes = req.body.adminNotes !== undefined ? req.body.adminNotes : booking.adminNotes;

      if (req.body.finalFare !== undefined) {
        booking.finalFare = parseFloat(req.body.finalFare);
        booking.balanceDue = booking.finalFare - booking.advancePaid;
      }
      if (req.body.advanceRequired !== undefined) {
        booking.advanceRequired = parseFloat(req.body.advanceRequired);
      }
      if (req.body.advancePaid !== undefined) {
        booking.advancePaid = parseFloat(req.body.advancePaid);
        booking.balanceDue = booking.finalFare - booking.advancePaid;
      }
    } else {
      if (req.body.status === 'Cancelled') {
        booking.status = 'Cancelled';
      } else {
        res.status(403);
        return next(new Error('Unauthorized request operation'));
      }
    }

    const updatedBooking = await booking.save();
    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
const deleteBooking = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        message: 'Booking record successfully deleted'
      });
    }

    const booking = await Booking.findOneAndDelete({ id: req.params.id });
    if (!booking) {
      res.status(404);
      return next(new Error('Booking record not found'));
    }

    res.json({
      success: true,
      message: 'Booking record successfully deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking
};
