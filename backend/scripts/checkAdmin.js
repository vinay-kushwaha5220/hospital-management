const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://kushwahavinay5220_db_user:NOubds1WsfP2Gsl1@cluster0.kmnts8s.mongodb.net/hospital_db?retryWrites=true&w=majority&appName=Cluster0';

const checkAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to Production MongoDB');

    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isVerified: Boolean,
      otp: String,
      otpExpiry: Date,
    }, { timestamps: true });

    const User = mongoose.model('User', userSchema);

    // Find admin
    const admin = await User.findOne({ email: 'admin@hospital.com' });
    
    if (!admin) {
      console.log('❌ Admin not found!');
    } else {
      console.log('✅ Admin found:');
      console.log('Name:', admin.name);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Verified:', admin.isVerified);
      console.log('Password hash:', admin.password.substring(0, 20) + '...');
      
      // Test password
      const isMatch = await bcrypt.compare('admin123456', admin.password);
      console.log('Password test:', isMatch ? '✅ Correct' : '❌ Wrong');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAdmin();
