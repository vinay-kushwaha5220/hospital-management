const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Production MongoDB URI
const MONGODB_URI = 'mongodb+srv://kushwahavinay5220_db_user:NOubds1WsfP2Gsl1@cluster0.kmnts8s.mongodb.net/hospital_db?retryWrites=true&w=majority&appName=Cluster0';

const setupAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to Production MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isVerified: Boolean,
      otp: String,
      otpExpiry: Date,
    }, { timestamps: true }));

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@hospital.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists, updating...');
      
      // Update admin
      existingAdmin.name = 'Hospital Admin';
      existingAdmin.password = await bcrypt.hash('admin123456', 10);
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      existingAdmin.otp = undefined;
      existingAdmin.otpExpiry = undefined;
      await existingAdmin.save();
      
      console.log('✅ Admin updated successfully!');
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      
      await User.create({
        name: 'Hospital Admin',
        email: 'admin@hospital.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
      });
      
      console.log('✅ Admin created successfully!');
    }

    console.log('==========================================');
    console.log('Email: admin@hospital.com');
    console.log('Password: admin123456');
    console.log('Role: admin');
    console.log('==========================================');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setupAdmin();
