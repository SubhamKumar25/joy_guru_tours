const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_joyguru_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      res.status(400);
      return next(new Error('Please fill in all registration fields'));
    }

    if (!isDbConnected()) {
      // Mock success for offline mode
      return res.status(201).json({
        success: true,
        _id: 'mock_user_id',
        name,
        email,
        phone,
        role: 'customer',
        token: generateToken('mock_user_id')
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      return next(new Error('A user account with this email already exists'));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'customer'
    });

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user details provided'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user / admin
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Please enter both email and password'));
    }

    if (!isDbConnected()) {
      // Offline mode simulator
      const isMockAdmin = email.toLowerCase().includes('admin') || email === 'admin@joyguru.com';
      return res.json({
        success: true,
        _id: isMockAdmin ? 'mock_admin_id' : 'mock_customer_id',
        name: isMockAdmin ? 'Joy Guru Administrator (Offline)' : email.split('@')[0],
        email: email,
        phone: '+91 94350 12345',
        role: isMockAdmin ? 'admin' : 'customer',
        token: generateToken(isMockAdmin ? 'mock_admin_id' : 'mock_customer_id')
      });
    }

    // Auto-create/seed default administrator account if it doesn't exist yet
    if (email === 'admin@joyguru.com') {
      let admin = await User.findOne({ email: 'admin@joyguru.com' }).select('+password');
      if (!admin) {
        admin = await User.create({
          name: 'Joy Guru Administrator',
          email: 'admin@joyguru.com',
          password: 'password123',
          phone: '+91 94350 12345',
          role: 'admin'
        });
        admin = await User.findOne({ email: 'admin@joyguru.com' }).select('+password');
      }

      if (admin && (await admin.matchPassword(password))) {
        return res.json({
          success: true,
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          token: generateToken(admin._id)
        });
      } else {
        res.status(401);
        return next(new Error('Invalid administrator password'));
      }
    }

    // Regular User query
    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401);
      return next(new Error('Invalid email or password credentials'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        data: req.body
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User account not found'));
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.avatarUrl !== undefined) user.avatarUrl = req.body.avatarUrl;
    if (req.body.favoritePlaces) {
      user.favoritePlaces = {
        home: req.body.favoritePlaces.home || user.favoritePlaces.home,
        work: req.body.favoritePlaces.work || user.favoritePlaces.work,
        preferredCorridor: req.body.favoritePlaces.preferredCorridor || user.favoritePlaces.preferredCorridor
      };
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        favoritePlaces: updatedUser.favoritePlaces
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers
// @route   GET /api/auth/customers
// @access  Private/Admin
const getCustomers = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        data: []
      });
    }
    const customers = await User.find({ role: 'customer' });
    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

const cloudinary = require('../config/cloudinary');

// @desc    Upload profile avatar image to Cloudinary
// @route   POST /api/auth/upload-avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('Please upload an image file'));
    }

    const isCloudinaryConfigured = process.env.CLOUDINARY_API_KEY && 
                                   process.env.CLOUDINARY_API_KEY !== 'dummy_key' && 
                                   process.env.CLOUDINARY_API_KEY !== 'mock_key';

    if (!isCloudinaryConfigured) {
      console.log('[CLOUDINARY STUB] Returning high-quality mock unsplash avatar due to unconfigured keys.');
      return res.json({
        success: true,
        url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'joyguru_avatars' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream upload error:', error);
          res.status(500);
          return next(error);
        }
        res.json({
          success: true,
          url: result.secure_url
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getCustomers,
  uploadAvatar
};
