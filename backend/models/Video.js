// backend/models/Video.js — Video guides metadata Schema

const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true, maxlength: 300 },
  url: { type: String, maxlength: 1000 },
  localBlob: { type: String },
  thumbnail: { type: String }, // Custom thumbnail image (base64 or URL)
  tags: { type: Array, default: [] },
  pinned: { type: Boolean, default: false },
  views: { type: Number, default: 0 }
});

module.exports = mongoose.model('Video', VideoSchema);
