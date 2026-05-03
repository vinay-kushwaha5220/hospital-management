const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://kushwahavinay5220_db_user:NOubds1WsfP2Gsl1@cluster0.kmnts8s.mongodb.net/hospital_db?retryWrites=true&w=majority&appName=Cluster0';

const listUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to Production MongoDB');

    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isVerified: Boolean,
    }, { timestamps: true });

    const User = mongoose.model('User', userSchema);

    const users = await User.find({}).select('name email role isVerified createdAt');
    
    console.log('\n📋 All Users in Database:');
    console.log('==========================================');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('------------------------------------------');
    });
    console.log(`Total Users: ${users.length}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listUsers();
