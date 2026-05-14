/**
 * Seed script — creates the initial Super Admin account
 * Run: node src/scripts/seedSuperAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const { ROLES } = require('../constants');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ role: ROLES.SUPER_ADMIN });
  if (existing) {
    console.log('Super Admin already exists:', existing.email);
    process.exit(0);
  }

  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'superadmin@company.com',
    password: 'SuperAdmin@123',
    role: ROLES.SUPER_ADMIN,
    isActive: true,
  });

  console.log('Super Admin created successfully!');
  console.log('Email:', superAdmin.email);
  console.log('Password: SuperAdmin@123');
  console.log(`Login URL: ${process.env.CLIENT_URL}/login`);
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
