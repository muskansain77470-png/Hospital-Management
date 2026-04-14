const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Prescription = require('../models/Prescription');

// @desc    Dashboard: Show patient's overview, appointments, and prescription count
// @route   GET /patients/dashboard
exports.getPatientDashboard = async (req, res) => {
    try {
        // 1. Fetch upcoming appointments for this specific patient
        const appointments = await Appointment.find({ patient: req.user._id })
            .populate('doctor', 'name')
            .sort({ date: 1, time: 1 })
            .limit(5);

        // 2. Fetch prescriptions to show count on dashboard stats
        const prescriptions = await Prescription.find({ patient: req.user._id });

        // 3. Render the view with BOTH variables
        res.render('patients/dashboard', { 
            user: req.user, 
            appointments: appointments || [],
            prescriptions: prescriptions || [], // FIX: Added this to resolve the ReferenceError
            title: 'Patient Dashboard',
            roleName: 'Patient'
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).render('error', { message: "Could not load dashboard data" });
    }
};

// @desc    User Story 4: Show booking page with list of doctors
exports.getBookingPage = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('name email');
        
        res.render('patients/book', { 
            user: req.user, 
            doctors,
            title: 'Book Appointment',
            error: req.query.error || null 
        });
    } catch (error) {
        res.status(500).render('error', { message: "Could not load doctors" });
    }
};

// @desc    User Story 4: Process the appointment booking
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, reason } = req.body;

        if (!doctorId || !date || !time) {
            return res.redirect('/patients/book?error=Please fill all required fields');
        }

        const existingAppointment = await Appointment.findOne({ 
            doctor: doctorId, 
            date, 
            time,
            status: { $ne: 'Cancelled' } 
        });

        if (existingAppointment) {
            return res.redirect('/patients/book?error=This time slot is already booked.');
        }

        await Appointment.create({
            patient: req.user._id, 
            doctor: doctorId,
            date,
            time,
            reason,
            status: 'Pending'
        });

        res.redirect('/dashboard'); 
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(400).render('error', { message: error.message });
    }
};

// @desc    User Story 5: View patient's own medical records & history
exports.getMedicalHistory = async (req, res) => {
    try {
        const history = await Appointment.find({ patient: req.user._id })
            .populate('doctor', 'name')
            .sort({ date: -1 });

        const prescriptions = await Prescription.find({ patient: req.user._id })
            .populate('doctor', 'name')
            .sort({ createdAt: -1 });

        res.render('patients/history', { 
            user: req.user, 
            history,
            prescriptions,
            title: 'My Medical Records'
        });
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).render('error', { message: error.message });
    }
};