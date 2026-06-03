// backend/models/Video.js — Video guides metadata Schema

const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  url: { type: String },
  localBlob: { type: String },
  thumbnail: { type: String }, // Custom thumbnail image (base64 or URL)
  tags: { type: Array, default: [] },
  views: { type: Number, default: 0 }
});

module.exports = mongoose.model('Video', VideoSchema);
