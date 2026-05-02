/**
 * Run this script to manually verify a user by email
 * Usage: node scripts/verifyUser.js <email>
 * Example: node scripts/verifyUser.js admin@hospital.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/verifyUser.js <email>');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  const user = await User.findOneAndUpdate(
    { email },
    { isVerified: true, otp: undefined, otpExpiry: undefined },
    { new: true }
  );

  if (!user) {
    console.error(`No user found with email: ${email}`);
  } else {
    console.log(`✅ User verified: ${user.name} (${user.email}) — Role: ${user.role}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
