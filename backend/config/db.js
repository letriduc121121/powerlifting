// backend/config/db.js — MongoDB database connection configuration

const mongoose = require('mongoose');

function connectDB(uri) {
  return mongoose.connect(uri)
    .then(() => {
      console.log('Connected to MongoDB successfully.');
    })
    .catch(err => {
      console.error('Error connecting to MongoDB:', err.message);
      process.exit(1);
    });
}

module.exports = connectDB;
