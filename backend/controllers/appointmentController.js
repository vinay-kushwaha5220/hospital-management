const Appointment = require('../models/Appointment');

// @desc    Get all appointments (with filters + role-based)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { date, doctor, status, patient } = req.query;
    const filter = {};

    if (date) filter.date = date;
    if (status) filter.status = status;

    // Role-based filtering
    if (req.user.role === 'doctor' && req.user.doctorId) {
      // Doctor sees only their appointments
      filter.doctor = req.user.doctorId;
    } else if (req.user.role === 'patient' && req.user.patientId) {
      // Patient sees only their appointments
      filter.patient = req.user.patientId;
    } else if (req.user.role === 'admin') {
      // Admin sees all appointments (can filter by doctor/patient)
      if (doctor) filter.doctor = doctor;
      if (patient) filter.patient = patient;
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name phone age gender symptoms')
      .populate('doctor', 'name specialization phone')
      .sort({ date: -1, time: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name phone age gender')
      .populate('doctor', 'name specialization phone');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Book appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, time, notes, symptoms } = req.body;
    const appointment = await Appointment.create({ patient, doctor, date, time, notes, symptoms });

    const populated = await appointment.populate([
      { path: 'patient', select: 'name phone age gender symptoms' },
      { path: 'doctor', select: 'name specialization phone' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'name phone')
      .populate('doctor', 'name specialization');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private/Admin
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor statistics (total patients treated, today's appointments)
// @route   GET /api/appointments/doctor/stats
// @access  Private/Doctor
const getDoctorStats = async (req, res) => {
  try {
    if (!req.user.doctorId) {
      return res.status(400).json({ message: 'Doctor profile not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Total patients treated (confirmed appointments)
    const totalPatients = await Appointment.countDocuments({
      doctor: req.user.doctorId,
      status: 'Confirmed',
    });

    // Today's appointments
    const todayAppointments = await Appointment.find({
      doctor: req.user.doctorId,
      date: today,
    })
      .populate('patient', 'name phone age gender symptoms')
      .sort({ time: 1 });

    // Pending appointments
    const pendingCount = await Appointment.countDocuments({
      doctor: req.user.doctorId,
      status: 'Pending',
    });

    res.json({
      totalPatients,
      todayAppointments,
      pendingCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctorStats,
};
