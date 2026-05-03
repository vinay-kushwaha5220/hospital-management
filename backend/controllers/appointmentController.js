const Appointment = require('../models/Appointment');

// @desc    Get all appointments (with filters + role-based)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { date, doctor, status, patient } = req.query;
    const filter = {};

    if (date) filter.date = date;
    if (doctor) filter.doctor = doctor;
    if (status) filter.status = status;
    if (patient) filter.patient = patient;

    // If user is a doctor (admin role), show only their appointments
    if (req.user.role === 'admin' && req.user.doctorId) {
      filter.doctor = req.user.doctorId;
    }

    // If user is a patient, show only their appointments
    if (req.user.role === 'patient' && req.user.patientId) {
      filter.patient = req.user.patientId;
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

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
