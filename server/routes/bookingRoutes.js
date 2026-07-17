const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

router.post('/', createBooking); // Accessible for guest / logged-in users
router.get('/', protect, adminOnly, getBookings);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBooking);
router.delete('/:id', protect, adminOnly, deleteBooking);

module.exports = router;
