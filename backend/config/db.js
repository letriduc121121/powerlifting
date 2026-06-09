// backend/config/db.js — MongoDB database connection configuration

const mongoose = require('mongoose');

function connectDB(uri) {
  return mongoose.connect(uri)
    .then(() => {
      console.log('Connected to MongoDB successfully.');
      return mongoose.connection;
    })
    .catch(err => {
      // Không exit ở đây: để server vẫn chạy và /api/health báo được "chưa kết nối".
      console.error('Error connecting to MongoDB:', err.message);
      throw err;
    });
}

module.exports = connectDB;
