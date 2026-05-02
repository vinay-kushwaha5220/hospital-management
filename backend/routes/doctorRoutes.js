const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/').get(protect, getDoctors).post(protect, adminOnly, createDoctor);
router
  .route('/:id')
  .get(protect, getDoctorById)
  .put(protect, adminOnly, updateDoctor)
  .delete(protect, adminOnly, deleteDoctor);

module.exports = router;
