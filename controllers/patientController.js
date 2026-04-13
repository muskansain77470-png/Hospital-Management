const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Patient = require('../models/Patient');

// @desc    User Story 4: Show booking page with list of doctors
exports.getBookingPage = async (req, res) => {
    try {
        // Fetch only doctors
        const doctors = await User.find({ role: 'doctor' }).select('name email');
        res.render('patients/book', { 
            user: req.user, 
            doctors,
            title: 'Book Appointment'
        });
    } catch (error) {
        res.status(500).render('error', { message: "Could not load doctors" });
    }
};

// @desc    User Story 4: Process the appointment booking
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, reason } = req.body;

        // Validation: Check if slot is already booked (Acceptance Criteria)
        const existingAppointment = await Appointment.findOne({ 
            doctor: doctorId, 
            date, 
            time,
            status: { $ne: 'Cancelled' } 
        });

        if (existingAppointment) {
            return res.status(400).json({ 
                success: false, 
                message: "This time slot is already booked. Please choose another time." 
            });
        }

        // Create Appointment
        await Appointment.create({
            patient: req.user._id, // Linked to logged-in user
            doctor: doctorId,
            date,
            time,
            reason,
            status: 'Pending'
        });

        // Story 4: Booking confirmation redirect
        res.redirect('/dashboard'); 
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    User Story 5: View patient's own medical records & history
exports.getMedicalHistory = async (req, res) => {
    try {
        // Acceptance Criteria: Show visits and past prescriptions
        const history = await Appointment.find({ patient: req.user._id })
            .populate('doctor', 'name')
            .sort({ date: -1 });

        // Fetch detailed profile from Patient model if it exists
        const patientProfile = await Patient.findOne({ phone: req.user.phone });

        res.render('patients/history', { 
            user: req.user, 
            history,
            profile: patientProfile || {},
            title: 'My Medical Records'
        });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
};