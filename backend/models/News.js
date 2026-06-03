// backend/models/News.js — News articles and events Schema

const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  cat: { type: String, default: 'TIN TỨC' },
  desc: { type: String },
  fullContent: { type: String },
  date: { type: String },
  featured: { type: Boolean, default: false },
  image: { type: String },
  views: { type: Number, default: 0 }
});

module.exports = mongoose.model('News', NewsSchema);
