const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  let mongoUri = process.env.MONGO_URI;
  if (!mongoUri || mongoUri.includes('<db_username>')) {
    mongoUri = 'mongodb://127.0.0.1:27017/dress_shop';
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB connection warning (${error.message}). Operating with fallback memory catalog.`);
  }
};

module.exports = connectDB;
