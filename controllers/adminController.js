const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Admin Stats Logic
exports.getAdminStats = async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const totalAppointments = await Appointment.countDocuments();
        res.render('admin/dashboard', { 
            user: req.user,
            stats: { totalPatients, totalDoctors, totalAppointments }
        });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
};

// Manage Doctors Logic
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('-password');
        res.render('admin/manage-doctors', { user: req.user, doctors });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
};

// Delete User Logic
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "User removed successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
    
};