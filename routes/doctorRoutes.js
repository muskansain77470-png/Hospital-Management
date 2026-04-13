const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment'); // Appointment model ki zaroorat padegi
const { 
    getDoctorDashboard, 
    getDoctorAppointments, 
    addPrescription,
    updateStatus 
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * 🔐 MIDDLEWARE
 * Sabhi doctor routes protected hain. Sirf 'doctor' role access kar sakta hai.
 */
router.use(protect);
router.use(authorize('doctor'));

// --- DASHBOARD & VIEW ROUTES ---

/**
 * @route   GET /doctor/dashboard
 * @desc    Renders doctor.ejs dashboard
 */
router.get('/dashboard', getDoctorDashboard);

/**
 * @route   GET /doctor/appointments
 * @desc    List of all appointments for the doctor
 */
router.get('/appointments', getDoctorAppointments);

/**
 * @route   GET /doctor/prescription/:id
 * @desc    Renders the Prescription Form for a specific appointment
 */
router.get('/prescription/:id', async (req, res) => {
    try {
        // Dashboard se jab doctor click karega, toh humein appointment aur patient details chahiye
        const appointment = await Appointment.findById(req.params.id).populate('patient');
        
        if (!appointment) {
            return res.status(404).render('error', { message: "Appointment not found" });
        }

        res.render('doctor/prescription', { 
            user: req.user, 
            appointment,
            title: 'Write Prescription'
        });
    } catch (err) {
        res.status(500).render('error', { message: "Internal Server Error" });
    }
});


// --- ACTION / API ROUTES ---

/**
 * @route   PUT /doctor/appointments/:id/status
 * @desc    Mark appointment as Completed/Cancelled
 */
router.put('/appointments/:id/status', updateStatus);

/**
 * @route   POST /doctor/prescription
 * @desc    Save the prescription data to DB
 */
router.post('/prescription', addPrescription);

module.exports = router;