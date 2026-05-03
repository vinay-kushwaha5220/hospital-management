const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Find and update admin
    const admin = await User.findOne({ email: 'admin@hospital.com' });
    
    if (!admin) {
      console.log('❌ Admin not found! Run createAdmin.js first.');
      process.exit(1);
    }

    // Update admin details
    admin.name = 'Hospital Admin';
    admin.password = 'admin123456'; // Will be hashed by pre-save hook
    admin.role = 'admin';
    admin.isVerified = true;
    await admin.save();

    console.log('✅ Admin updated successfully!');
    console.log('==========================================');
    console.log('Email: admin@hospital.com');
    console.log('Password: admin123456');
    console.log('Role: admin');
    console.log('==========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

updateAdmin();
