const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getCustomers,
  uploadAvatar,
  forgotPassword,
  resetPassword,
  googleLogin
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/customers', protect, adminOnly, getCustomers);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
