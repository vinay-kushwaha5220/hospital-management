const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const [totalDoctors, totalPatients, totalAppointments, recentAppointments, statusCounts] =
      await Promise.all([
        Doctor.countDocuments({ isActive: true }),
        Patient.countDocuments(),
        Appointment.countDocuments(),
        Appointment.find()
          .populate('patient', 'name')
          .populate('doctor', 'name specialization')
          .sort({ createdAt: -1 })
          .limit(5),
        Appointment.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
      ]);

    // Format status counts
    const statusMap = { Pending: 0, Confirmed: 0, Cancelled: 0 };
    statusCounts.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    res.json({
      totalDoctors,
      totalPatients,
      totalAppointments,
      statusCounts: statusMap,
      recentAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
