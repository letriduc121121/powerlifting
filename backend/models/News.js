// backend/models/News.js — News articles and events Schema

const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true, trim: true, maxlength: 300 },
  cat: { type: String, default: 'TIN TỨC', maxlength: 100 },
  desc: { type: String, maxlength: 1000 },
  fullContent: { type: String, maxlength: 50000 },
  date: { type: String, maxlength: 50 },
  featured: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false },
  image: { type: String },
  views: { type: Number, default: 0 }
});

module.exports = mongoose.model('News', NewsSchema);
