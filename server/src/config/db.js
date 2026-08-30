const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agentflow', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.warn('MongoDB unavailable, using in-memory store:', err.message);
    return false;
  }
};

module.exports = { connectDB };
