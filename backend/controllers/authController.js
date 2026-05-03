const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { sendOTPEmail } = require('../utils/sendEmail');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register — send OTP to email
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = password;
      existingUser.role = role || 'patient';
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
    } else {
      await User.create({
        name,
        email,
        password,
        role: role || 'patient',
        isVerified: false,
        otp,
        otpExpiry,
      });
    }

    // Send OTP email
    try {
      await sendOTPEmail(email, name, otp);
      console.log(`OTP sent to ${email}`);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }

    res.status(200).json({
      message: `OTP sent to ${email}. Please verify to complete registration.`,
      email,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP — activate account
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified. Please login.' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Auto-create patient profile if role is patient
    let patientId = null;
    if (user.role === 'patient') {
      const existing = await Patient.findOne({ userId: user._id });
      if (!existing) {
        const newPatient = await Patient.create({
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: '',
          age: 0,
          gender: 'Other',
        });
        patientId = newPatient._id;
      } else {
        patientId = existing._id;
      }
    }

    // Auto-create doctor profile if role is admin (doctor)
    let doctorId = null;
    if (user.role === 'admin') {
      const Doctor = require('../models/Doctor');
      const existing = await Doctor.findOne({ userId: user._id });
      if (!existing) {
        const newDoctor = await Doctor.create({
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: '',
          specialization: 'General',
        });
        doctorId = newDoctor._id;
      } else {
        doctorId = existing._id;
      }
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      patientId,
      doctorId,
      token: generateToken(user._id),
      message: 'Email verified successfully! Welcome.',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, user.name, otp);

    res.status(200).json({ message: `New OTP sent to ${email}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Email not verified. Please check your email for OTP.',
        needsVerification: true,
        email: user.email,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Attach patientId if role is patient
    let patientId = null;
    if (user.role === 'patient') {
      const patientProfile = await Patient.findOne({ userId: user._id });
      patientId = patientProfile?._id || null;
    }

    // Attach doctorId if role is admin (doctor)
    let doctorId = null;
    if (user.role === 'admin') {
      const Doctor = require('../models/Doctor');
      const doctorProfile = await Doctor.findOne({ userId: user._id });
      doctorId = doctorProfile?._id || null;
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      patientId,
      doctorId,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password — send OTP to email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email, isVerified: true });

    if (!user) {
      // Don't reveal if email exists or not — security best practice
      return res.status(200).json({
        message: 'If this email is registered, you will receive an OTP shortly.',
        email,
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTPEmail(email, user.name, otp, true); // true = reset password email
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }

    res.status(200).json({
      message: 'If this email is registered, you will receive an OTP shortly.',
      email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password — verify OTP and set new password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully! Please login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, verifyOTP, resendOTP, login, forgotPassword, resetPassword, getMe };
