const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://kushwahavinay5220_db_user:NOubds1WsfP2Gsl1@cluster0.kmnts8s.mongodb.net/hospital_db?retryWrites=true&w=majority&appName=Cluster0';

const testLogin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to Production MongoDB\n');

    // Import the actual User model
    const User = require('../models/User');

    // Find admin
    const admin = await User.findOne({ email: 'admin@hospital.com' });
    
    if (!admin) {
      console.log('❌ Admin not found!');
      process.exit(1);
    }

    console.log('📋 Admin Details:');
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Verified:', admin.isVerified);
    console.log('Password hash:', admin.password.substring(0, 30) + '...\n');

    // Test password using model method
    console.log('🔐 Testing Password...');
    const isMatch = await admin.matchPassword('admin123456');
    console.log('Result:', isMatch ? '✅ Password Correct' : '❌ Password Wrong');

    // Test password using bcrypt directly
    const isMatchDirect = await bcrypt.compare('admin123456', admin.password);
    console.log('Direct bcrypt test:', isMatchDirect ? '✅ Correct' : '❌ Wrong');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

testLogin();
