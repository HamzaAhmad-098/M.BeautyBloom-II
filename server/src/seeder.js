import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import connectDB from './config/db.js';

dotenv.config();

// Wrap the seeding logic in an async function
const createAdmin = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@cosmetics.com' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit();
    }

    // Create new admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@cosmetics.com',
      password: 'Admin123', // will auto-hash in pre-save
      isAdmin: true,
      isVerified: true,
      phone: '+923001234567',
      addresses: [
        {
          name: 'Admin Office',
          address: 'DHA Phase 5',
          city: 'Karachi',
          state: 'Sindh',
          postalCode: '75500',
          country: 'Pakistan',
          phone: '+923001234567',
          isDefault: true,
        },
      ],
    });

    console.log('Admin created:', admin.email);
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

// Run the seeder
createAdmin();
