const app = require('../server/app');
const connectDB = require('../server/config/db');

// Trigger DB connection immediately (serverless warm-up)
connectDB();

module.exports = app;
