// backend/utils/sanitize.js — Làm sạch nội dung do admin nhập để chống XSS lưu trữ.
// `clean()` loại bỏ toàn bộ thẻ HTML/script; dùng cho các field text hiển thị trực tiếp.

const sanitizeHtml = require('sanitize-html');

const clean = (value) =>
  typeof value === 'string'
    ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    : value;

module.exports = { clean };
