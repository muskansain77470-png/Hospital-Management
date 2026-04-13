const Appointment = require('../models/Appointment');

// @desc    Get all appointments
exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ createdAt: -1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new appointment
exports.createAppointment = async (req, res) => {
    try {
        const { patient, doctor, date, time } = req.body;

        if (!patient || !doctor || !date || !time) {
            return res.status(400).json({ success: false, message: "Please fill all fields" });
        }

        const newAppointment = await Appointment.create({
            patient,
            doctor,
            date,
            time,
            reason: 'Routine Checkup',
            status: 'Pending' // Default status set kar diya hai
        });

        res.status(201).json({ success: true, data: newAppointment });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 🚀 FIXED: Update existing appointment (Now handles status too)
exports.updateAppointment = async (req, res) => {
    try {
        // req.body se status ko bhi destructure kiya taaki frontend se update ho sake
        const { patient, doctor, date, time, status } = req.body;
        
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        // update object mein status add kar diya gaya hai
        appointment = await Appointment.findByIdAndUpdate(
            req.params.id, 
            { patient, doctor, date, time, status }, 
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete appointment (Optional but good to have)
exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }
        await appointment.deleteOne();
        res.status(200).json({ success: true, message: "Appointment removed" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};