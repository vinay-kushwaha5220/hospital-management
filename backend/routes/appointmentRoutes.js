const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctorStats,
} = require('../controllers/appointmentController');
const { protect, adminOnly, doctorOnly } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAppointments).post(protect, createAppointment);
router.get('/doctor/stats', protect, doctorOnly, getDoctorStats);
router
  .route('/:id')
  .get(protect, getAppointmentById)
  .put(protect, updateAppointment)
  .delete(protect, adminOnly, deleteAppointment);

module.exports = router;
