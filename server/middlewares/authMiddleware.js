const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_joyguru_key_2026');

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        return next(new Error('User profile not found, authorization denied'));
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      return next(new Error('Not authorized, token validation failed'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, missing bearer token in request header'));
  }
};

module.exports = { protect };
