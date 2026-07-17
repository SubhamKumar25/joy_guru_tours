const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/joygurutravels';
    console.log('Connecting to MongoDB database...');
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Database connection error: ${err.message}`);
    // Try connecting to fallback local database if Atlas URI failed
    if (process.env.MONGO_URI && process.env.MONGO_URI !== 'mongodb://127.0.0.1:27017/joygurutravels') {
      try {
        console.log('Attempting connection to local MongoDB fallback...');
        const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/joygurutravels', {
          serverSelectionTimeoutMS: 3000
        });
        console.log(`Local MongoDB Connected: ${fallbackConn.connection.host}`);
      } catch (fallbackErr) {
        console.error(`Local fallback failed: ${fallbackErr.message}`);
        console.warn('Database is offline. Running in caching fallback mode.');
      }
    } else {
      console.warn('Database is offline. Running in caching fallback mode.');
    }
  }
};

module.exports = connectDB;
