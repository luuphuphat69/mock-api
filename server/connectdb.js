const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables explicitly from server/.env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log('✅ Connected to MongoDB!');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
  }
};

module.exports = connectDB;
