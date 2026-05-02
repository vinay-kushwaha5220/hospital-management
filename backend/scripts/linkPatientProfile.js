/**
 * Link existing patient-role users to patient profiles
 * Run: node scripts/linkPatientProfile.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  const patientUsers = await User.find({ role: 'patient', isVerified: true });
  console.log(`Found ${patientUsers.length} patient users`);

  for (const user of patientUsers) {
    const existing = await Patient.findOne({ userId: user._id });
    if (existing) {
      console.log(`✅ Already linked: ${user.name}`);
      continue;
    }

    // Try to find by email or name
    let profile = await Patient.findOne({ email: user.email });
    if (!profile) {
      profile = await Patient.findOne({ name: user.name });
    }

    if (profile) {
      profile.userId = user._id;
      profile.email = user.email;
      await profile.save();
      console.log(`🔗 Linked existing profile: ${user.name}`);
    } else {
      // Create new profile
      await Patient.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: '',
        age: 0,
        gender: 'Other',
      });
      console.log(`➕ Created new profile: ${user.name}`);
    }
  }

  console.log('Done!');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
