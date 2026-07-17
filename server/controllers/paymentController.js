const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { createOrder, verifyPayment } = require('../services/razorpayService');
const { generateInvoicePDF } = require('../services/pdfService');
const { sendNotificationEmail } = require('../services/mailService');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Create Razorpay checkout order ID
// @route   POST /api/payments/razorpay-order
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      res.status(400);
      return next(new Error('Please provide bookingId and payment amount'));
    }

    if (!isDbConnected()) {
      return res.status(201).json({
        success: true,
        data: {
          success: true,
          orderId: `order_${bookingId}_${Date.now().toString().slice(-4)}`,
          amount: parseFloat(amount),
          currency: 'INR',
          isMock: true
        }
      });
    }

    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) {
      res.status(404);
      return next(new Error('Booking reference not found'));
    }

    const orderData = await createOrder(bookingId, amount);

    res.status(201).json({
      success: true,
      data: orderData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay gateway payment and update statuses
// @route   POST /api/payments/razorpay-verify
// @access  Private
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      bookingId,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!bookingId || !amount || !razorpay_payment_id) {
      res.status(400);
      return next(new Error('Missing payment verification parameters'));
    }

    if (!isDbConnected()) {
      // Mock payment verification success
      return res.json({
        success: true,
        message: 'Payment verified and booking state updated successfully (Offline Mode)',
        data: {
          payment: { bookingId, amount: parseFloat(amount), paymentStatus: 'Completed', transactionId: razorpay_payment_id },
          invoice: { invoiceNumber: `INV-2026-${Math.floor(Math.random() * 9000)}`, bookingId, customerName: 'Rahul Sharma', travelDate: '2026-07-20', finalFare: parseFloat(amount) }
        }
      });
    }

    // Verify signature
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      res.status(400);
      return next(new Error('Invalid payment signature, transaction verification failed'));
    }

    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) {
      res.status(404);
      return next(new Error('Booking reference not found'));
    }

    // Capture payment in Database
    const payment = await Payment.create({
      bookingId,
      amount: parseFloat(amount),
      paymentMethod: razorpay_order_id.startsWith('order_JG') ? 'upi' : 'razorpay',
      paymentStatus: 'Completed',
      transactionId: razorpay_payment_id,
      gatewayResponse: req.body
    });

    if (booking.status === 'Fare Proposed' || booking.status === 'Advance Required' || booking.status === 'Requested') {
      booking.advancePaid = payment.amount;
      booking.balanceDue = booking.finalFare - booking.advancePaid;
      booking.status = 'Advance Paid';
    } else {
      booking.advancePaid += payment.amount;
      booking.balanceDue = booking.finalFare - booking.advancePaid;
      if (booking.balanceDue <= 0) {
        booking.status = 'Completed';
      }
    }

    await booking.save();

    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-2026-${1000 + count + 1}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      bookingId: booking.id,
      customerName: booking.customerName,
      travelDate: booking.travelDate,
      route: `${booking.pickup.split(',')[0]} ⇄ ${booking.destination.split(',')[0]}`,
      finalFare: booking.finalFare,
      advancePaid: booking.advancePaid,
      remainingPaid: booking.finalFare - booking.balanceDue - booking.advancePaid,
      paymentStatus: booking.status === 'Completed' ? 'PAID' : 'PARTIALLY PAID'
    });

    // Send transaction email confirmation
    if (booking.customerEmail) {
      const subject = `Payment Confirmed - Booking ID: ${booking.id}`;
      const text = `Dear ${booking.customerName}, your payment of INR ${amount} was successfully verified. Current Booking Status: ${booking.status}. Thank you!`;
      const html = `<p>Dear <strong>${booking.customerName}</strong>,</p>
                    <p>Your payment of <strong>INR ${amount}</strong> was successfully verified for Booking Ref: <strong>${booking.id}</strong>.</p>
                    <p>Current Booking Status: <strong>${booking.status}</strong></p>
                    <p>Thank you for choosing Joy Guru Tours & Travels!</p>`;
      
      await sendNotificationEmail(booking.customerEmail, subject, text, html);
    }

    res.json({
      success: true,
      message: 'Payment verified and booking state updated successfully',
      data: {
        payment,
        invoice,
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Invoices List
// @route   GET /api/payments/invoices
// @access  Private
const getInvoices = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        data: [
          { invoiceNumber: 'INV-2026-1001', bookingId: 'JG-2025-4829', customerName: 'Rahul Sharma', travelDate: '2025-10-15', route: 'Silchar ⇄ Shillong', finalFare: 5999, advancePaid: 1500, remainingPaid: 0, paymentStatus: 'PAID' }
        ]
      });
    }

    let query = {};

    if (req.user.role === 'customer') {
      const userBookings = await Booking.find({
        $or: [
          { userId: req.user._id },
          { customerEmail: req.user.email },
          { customerPhone: req.user.phone }
        ]
      });
      const bookingIds = userBookings.map(b => b.id);
      query = { bookingId: { $in: bookingIds } };
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download dynamic PDF stream of the invoice
// @route   GET /api/payments/invoices/:bookingId/download
// @access  Private
const downloadInvoicePDF = async (req, res, next) => {
  try {
    let bookingObj = null;

    if (!isDbConnected()) {
      // Mock booking object for PDF compilation
      bookingObj = {
        id: req.params.bookingId,
        customerName: 'Rahul Sharma (Offline Test)',
        customerPhone: '+91 94350 12345',
        customerEmail: 'rahul@example.com',
        vehicleName: 'Toyota Innova Crysta',
        vehicleType: 'suv',
        pickup: 'Silchar Airport (IXS), Assam',
        destination: 'Shillong, Meghalaya',
        travelDate: '2026-07-20',
        travelTime: '10:00 AM',
        finalFare: 6000,
        advancePaid: 1500,
        balanceDue: 4500,
        status: 'Advance Paid'
      };
    } else {
      bookingObj = await Booking.findOne({ id: req.params.bookingId });
      if (!bookingObj) {
        res.status(404);
        return next(new Error('Booking details not found'));
      }

      const isOwner = req.user.role === 'admin' || 
                      (bookingObj.userId && bookingObj.userId.toString() === req.user._id.toString()) ||
                      bookingObj.customerEmail === req.user.email ||
                      bookingObj.customerPhone === req.user.phone;

      if (!isOwner) {
        res.status(403);
        return next(new Error('Not authorized to access this invoice receipt'));
      }
    }

    // Setup headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${bookingObj.id}.pdf`);

    // Stream invoice PDF
    generateInvoicePDF(bookingObj, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getInvoices,
  downloadInvoicePDF
};
