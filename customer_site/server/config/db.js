const mongoose = require('mongoose');

// Disable Mongoose command buffering so queries fail fast when DB is disconnected
mongoose.set('bufferCommands', false);

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const isVercel = Boolean(process.env.VERCEL);
  let mongoUri = process.env.MONGO_URI;

  // On Vercel, if no external remote MONGO_URI is set or if MONGO_URI points to localhost/127.0.0.1,
  // skip trying to connect to local MongoDB to prevent serverless function invocation crashes.
  if (isVercel && (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost') || mongoUri.includes('<db_username>'))) {
    console.warn('⚠️ Serverless Vercel environment: Local MongoDB URI detected without remote cluster. Operating with in-memory catalog.');
    return;
  }

  if (!mongoUri || mongoUri.includes('<db_username>')) {
    mongoUri = 'mongodb://127.0.0.1:27017/dress_shop';
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: isVercel ? 2000 : 5000,
      connectTimeoutMS: isVercel ? 2000 : 5000,
      bufferCommands: false
    });
    isConnected = true;
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB connection warning (${error.message}). Operating with fallback memory catalog.`);
  }
};

module.exports = connectDB;
