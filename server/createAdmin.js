import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const email = 'admin@admin.com';
const existing = await User.findOne({ email });

if (existing) {
  // Ensure the existing account has Admin role
  existing.role = 'Admin';
  existing.userCategory = 'Admin';
  await existing.save();
  console.log('Admin account already exists — role enforced to Admin.');
} else {
  const passwordHash = await bcrypt.hash('2026', 10);
  await User.create({
    name: 'Admin',
    email,
    passwordHash,
    role: 'Admin',
    authProvider: 'Local',
    userCategory: 'Admin',
  });
  console.log('Admin created: admin@admin.com / 2026');
}

await mongoose.disconnect();
