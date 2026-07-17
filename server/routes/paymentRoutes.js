const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getInvoices,
  downloadInvoicePDF
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/razorpay-order', protect, createRazorpayOrder);
router.post('/razorpay-verify', protect, verifyRazorpayPayment);
router.get('/invoices', protect, getInvoices);
router.get('/invoices/:bookingId/download', protect, downloadInvoicePDF);

module.exports = router;
