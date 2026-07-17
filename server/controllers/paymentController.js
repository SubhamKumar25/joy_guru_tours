const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { createOrder, verifyPayment } = require('../services/razorpayService');
const { generateInvoicePDF } = require('../services/pdfService');
const { sendNotificationEmail } = require('../services/mailService');
const crypto = require('crypto');

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
    const bookingObj = await Booking.findOne({ id: req.params.bookingId });
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

    // Setup headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${bookingObj.id}.pdf`);

    // Stream invoice PDF
    generateInvoicePDF(bookingObj, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Razorpay Webhook notification
// @route   POST /api/payments/webhook
// @access  Public
const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (secret && signature) {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        res.status(400);
        return next(new Error('Invalid webhook signature'));
      }
    }

    const event = req.body.event;
    console.log(`[RAZORPAY WEBHOOK] Event received: ${event}`);

    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const amount = paymentEntity.amount / 100;

      let booking = null;
      if (paymentEntity.notes && paymentEntity.notes.bookingId) {
        booking = await Booking.findOne({ id: paymentEntity.notes.bookingId });
      }

      if (!booking && orderId) {
        const parts = orderId.split('_');
        if (parts.length > 1) {
          booking = await Booking.findOne({ id: parts[1] });
        }
      }

      if (booking) {
        const existingPayment = await Payment.findOne({ transactionId: paymentId });
        if (!existingPayment) {
          const payment = await Payment.create({
            bookingId: booking.id,
            amount,
            paymentMethod: 'razorpay',
            paymentStatus: 'Completed',
            transactionId: paymentId,
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
          console.log(`[RAZORPAY WEBHOOK] Booking ${booking.id} updated successfully via webhook.`);
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Payment History
// @route   GET /api/payments
// @access  Private
const getPaymentHistory = async (req, res, next) => {
  try {
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

    const payments = await Payment.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refund Razorpay Payment (Skeleton / DB Update)
// @route   POST /api/payments/:paymentId/refund
// @access  Private/Admin
const refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ transactionId: req.params.paymentId });
    if (!payment) {
      res.status(404);
      return next(new Error('Payment transaction record not found'));
    }

    if (payment.paymentStatus === 'Refunded') {
      res.status(400);
      return next(new Error('This payment transaction has already been refunded'));
    }

    // Live Razorpay refund call if keys configured
    const isRazorpayConfigured = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_dummy';
    let gatewayRefundId = 'ref_mock_' + Math.floor(Math.random() * 900000);

    if (isRazorpayConfigured) {
      try {
        const { getRazorpayInstance } = require('../services/razorpayService');
        const rzp = getRazorpayInstance();
        if (rzp) {
          const rzpRefund = await rzp.payments.refund(payment.transactionId, {
            amount: payment.amount * 100 // convert back to paise
          });
          gatewayRefundId = rzpRefund.id;
        }
      } catch (err) {
        console.error('Razorpay API refund failure, falling back to db log:', err);
      }
    }

    // Update payment state
    payment.paymentStatus = 'Refunded';
    payment.gatewayResponse = Object.assign({}, payment.gatewayResponse, { refundId: gatewayRefundId, refundedAt: new Date().toISOString() });
    await payment.save();

    // Update booking values if linked
    const booking = await Booking.findOne({ id: payment.bookingId });
    if (booking) {
      booking.advancePaid = Math.max(0, booking.advancePaid - payment.amount);
      booking.balanceDue = booking.finalFare - booking.advancePaid;
      booking.status = 'Cancelled'; // Mark cancelled on refund as standard travel policy
      await booking.save();
    }

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getInvoices,
  downloadInvoicePDF,
  handleRazorpayWebhook,
  getPaymentHistory,
  refundPayment
};
