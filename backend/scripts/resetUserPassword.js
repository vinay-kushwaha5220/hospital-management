/**
 * Reset a user's password directly in DB
 * Usage: node scripts/resetUserPassword.js <email> <newpassword>
 * Example: node scripts/resetUserPassword.js admin@hospital.com admin123
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const [email, newPassword] = process.argv.slice(2);

if (!email || !newPassword) {
  console.error('Usage: node scripts/resetUserPassword.js <email> <newpassword>');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`No user found: ${email}`);
    process.exit(1);
  }

  user.password = newPassword;
  user.isVerified = true;
  await user.save();

  console.log(`✅ Password reset for: ${user.name} (${user.email})`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
