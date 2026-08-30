const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    let uri = MONGO_URI;

    if (!uri) {
      console.log('⚡ No MONGO_URI provided. Initializing in-memory MongoDB Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      uri = mongoMemoryServer.getUri();
      console.log('✅ In-Memory MongoDB Server running at:', uri);
    } else {
      console.log('⚡ Attempting to connect to MongoDB URI...');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ External MongoDB connection failed (${error.message}). Falling back to In-Memory MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log('✅ In-Memory MongoDB Server started successfully:', uri);
      return conn;
    } catch (memErr) {
      console.error('❌ In-Memory MongoDB failed to start:', memErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
