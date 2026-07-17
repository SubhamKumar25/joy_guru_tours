const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Security Middlewares
// Disable CSP in Helmet to prevent CDNs (Iconify, Tailwind, Leaflet) from being blocked
app.use(helmet({
  contentSecurityPolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic API Routing Placeholder
// We will mount routes here
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Serve static frontend from the parent root directory
app.use(express.static(path.join(__dirname, '..')));

// Catch-all route to serve the homepage for unknown paths (SPA behavior / fallback)
app.get('*', (req, res, next) => {
  // If request is looking for API route, send 404 instead of serving index.html
  if (req.originalUrl.startsWith('/api')) {
    res.status(404);
    return next(new Error(`API Route not found: ${req.originalUrl}`));
  }
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Central Error Middleware
app.use(errorHandler);

module.exports = app;
