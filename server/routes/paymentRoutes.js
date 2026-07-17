const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getInvoices,
  downloadInvoicePDF,
  handleRazorpayWebhook,
  getPaymentHistory,
  refundPayment
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

router.post('/razorpay-order', protect, createRazorpayOrder);
router.post('/razorpay-verify', protect, verifyRazorpayPayment);
router.post('/webhook', handleRazorpayWebhook); // Public webhook receiver
router.get('/invoices', protect, getInvoices);
router.get('/invoices/:bookingId/download', protect, downloadInvoicePDF);
router.get('/', protect, getPaymentHistory);
router.post('/:paymentId/refund', protect, adminOnly, refundPayment);

module.exports = router;
