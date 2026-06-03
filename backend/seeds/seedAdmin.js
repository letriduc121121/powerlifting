// backend/seeds/seedAdmin.js

const bcrypt = require('bcryptjs');
const Admin  = require('../models/Admin');

module.exports = async function seedAdmin() {
  try {
    const exists = await Admin.findOne({ username: 'admin' });
    if (!exists) {
      const hashed = await bcrypt.hash('123456', 10);
      await Admin.create({ username: 'admin', password: hashed });
      console.log('Default admin seeded (admin / 123456).');
    }
  } catch (err) {
    console.error('seedAdmin error:', err.message);
  }
};
