const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      // Attach patientId if patient role
      if (req.user.role === 'patient') {
        const Patient = require('../models/Patient');
        const patientProfile = await Patient.findOne({ userId: req.user._id });
        req.user.patientId = patientProfile?._id || null;
      }
      
      // Attach doctorId if admin role (doctor)
      if (req.user.role === 'admin') {
        const Doctor = require('../models/Doctor');
        const doctorProfile = await Doctor.findOne({ userId: req.user._id });
        req.user.doctorId = doctorProfile?._id || null;
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin only access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

module.exports = { protect, adminOnly };
