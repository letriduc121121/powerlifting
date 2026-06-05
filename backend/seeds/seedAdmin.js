// backend/seeds/seedAdmin.js

const bcrypt = require('bcryptjs');
const Admin  = require('../models/Admin');

const USERNAME = 'admin';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Powerlifting20040509@';

module.exports = async function seedAdmin() {
  try {
    const hashed = await bcrypt.hash(PASSWORD, 10);
    const admin = await Admin.findOne({ username: USERNAME });

    if (!admin) {
      await Admin.create({ username: USERNAME, password: hashed });
      console.log('Default admin seeded.');
    } else if (!(await bcrypt.compare(PASSWORD, admin.password))) {
      // Đồng bộ mật khẩu với cấu hình hiện tại khi nó thay đổi.
      admin.password = hashed;
      await admin.save();
      console.log('Admin password updated.');
    }
  } catch (err) {
    console.error('seedAdmin error:', err.message);
  }
};
