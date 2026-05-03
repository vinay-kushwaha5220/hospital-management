const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Initialize DB connection
connectDB();

// CORS - Allow all origins for Vercel
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Hospital Management API is running' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Hospital Management API - /api endpoint' });
});

// Test admin endpoint
app.get('/api/test-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    const dbName = require('mongoose').connection.db.databaseName;
    const admin = await User.findOne({ email: 'admin@hospital.com' });
    const allUsers = await User.countDocuments();
    
    if (!admin) {
      return res.json({ 
        found: false, 
        message: 'Admin not found in database',
        database: dbName,
        totalUsers: allUsers,
      });
    }
    res.json({
      found: true,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isVerified: admin.isVerified,
      database: dbName,
      totalUsers: allUsers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
