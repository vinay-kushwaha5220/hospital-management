const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/').get(protect, getPatients).post(protect, createPatient);
router
  .route('/:id')
  .get(protect, getPatientById)
  .put(protect, updatePatient)
  .delete(protect, adminOnly, deletePatient);

module.exports = router;
