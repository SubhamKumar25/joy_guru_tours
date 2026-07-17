const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, getCustomers } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.get('/customers', protect, adminOnly, getCustomers);

module.exports = router;
