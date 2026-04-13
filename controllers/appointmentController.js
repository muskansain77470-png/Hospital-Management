const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Patient = require('../models/Patient');

// @desc    Show booking page with list of doctors
exports.getBookingPage = async (req, res) => {
    try {
        // Fetch only users with role 'doctor'
        const doctors = await User.find({ role: 'doctor' }).select('name email');
        
        // Render from appointments folder
        res.render('appointments/book', { 
            user: req.user, 
            doctors,
            title: 'Book Appointment'
        });
    } catch (error) {
        res.status(500).render('error', { message: "Could not load doctors" });
    }
};

// @desc    Process the appointment request (Patient Side)
// FIXED: Date and Time removed from request body validation
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, reason } = req.body;

        // FIXED: Hum validation (existingAppointment) remove kar rahe hain 
        // kyunki ab patient slot select nahi kar raha, sirf request bhej raha hai.

        // Create Appointment Request
        await Appointment.create({
            patient: req.user._id,
            doctor: doctorId,
            // Date aur Time blank rahenge jab tak Doctor update na kare
            reason,
            status: 'Pending'
        });

        // Success ke baad patient dashboard par redirect
        res.redirect('/dashboard'); 
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all appointments for the logged-in patient
exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user._id })
            .populate('doctor', 'name')
            .sort({ createdAt: -1 }); // Newest requests first

        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Appointment (Used by Doctor/Staff to assign Date & Time)
exports.updateAppointment = async (req, res) => {
    try {
        // Doctor yahan se req.body mein { date, time, status: 'Confirmed' } bhejega
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};