const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@hospital.com' });
    
    if (existingAdmin) {
      console.log('❌ Admin already exists!');
      console.log('Email: admin@hospital.com');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Hospital Admin',
      email: 'admin@hospital.com',
      password: 'admin123456',
      role: 'admin',
      isVerified: true, // Skip OTP verification for admin
    });

    console.log('✅ Admin created successfully!');
    console.log('==========================================');
    console.log('Email: admin@hospital.com');
    console.log('Password: admin123456');
    console.log('==========================================');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
