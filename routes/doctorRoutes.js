const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    getDoctorDashboard, 
    addPrescription,
    updateStatus,
    getPatientsList,
    getPharmacy,
    addMedicine // New controller function
} = require('../controllers/doctorController');

// 🔐 MIDDLEWARE - Only Doctors allowed
router.use(protect);
router.use(authorize('doctor'));

// --- Main Navigation Routes ---
router.get('/dashboard', getDoctorDashboard);
router.get('/patients', getPatientsList);
router.get('/pharmacy', getPharmacy);

// --- Pharmacy Logic ---
// Process new medicine addition
router.post('/pharmacy/add', addMedicine); 

// --- Schedules ---
router.get('/schedules', getDoctorDashboard); 

// --- Prescription Views & Logic ---
router.get('/prescription/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate('patient');
        if (!appointment) return res.status(404).send("Appointment Not Found");
        
        res.render('doctor/prescription', { 
            user: req.user, 
            appointment, 
            title: 'Write Prescription', 
            layout: false 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.post('/prescribe', addPrescription);

// --- Status Update Logic ---
router.patch('/status/:id', updateStatus); 

module.exports = router;