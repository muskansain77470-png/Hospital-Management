const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
// Assuming you have a Patient model, import it here:
const Patient = require('../models/Patient'); 

// 1. Dashboard Logic
exports.getDoctorDashboard = async (req, res) => {
    try {
        const query = { doctor: req.user._id };
        
        const [activePatients, pendingCount, appointments] = await Promise.all([
            Appointment.distinct('patient', query),
            Appointment.countDocuments({ ...query, status: 'Pending' }),
            Appointment.find(query)
                .populate('patient', 'name email gender age')
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        res.render('doctor/dashboard', { 
            user: req.user,
            stats: {
                activePatients: activePatients.length || 0,
                pending: pendingCount || 0,
                total: appointments.length || 0
            },
            recentAppointments: appointments || [],
            title: 'Doctor Dashboard',
            layout: false 
        });
    } catch (error) {
        console.error("Doctor Dashboard Error:", error);
        res.status(500).render('error', { message: "Dashboard load nahi ho saka: " + error.message });
    }
};

// 2. Get All Patients List
exports.getPatientsList = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.user._id })
            .populate('patient', 'name email phone gender age')
            .sort({ createdAt: -1 });
        
        const uniquePatients = [];
        const patientIds = new Set();
        
        appointments.forEach(app => {
            if (app.patient && !patientIds.has(app.patient._id.toString())) {
                patientIds.add(app.patient._id.toString());
                uniquePatients.push(app.patient);
            }
        });

        res.render('patients/patient', { 
            user: req.user, 
            patients: uniquePatients,
            title: 'My Patients',
            layout: false
        });
    } catch (error) {
        console.error("Patients List Error:", error);
        res.status(500).send("Patients list fetch karne mein error: " + error.message);
    }
};

// --- NEW: Add Patient Logic ---
exports.addPatient = async (req, res) => {
    try {
        const { name, phone, age } = req.body;
        
        if (!name || !phone) {
            return res.status(400).json({ success: false, message: "Name and Phone are required." });
        }

        await Patient.create({ name, phone, age });
        
        res.status(201).json({ success: true, message: "Patient saved successfully!" });
    } catch (error) {
        console.error("Add Patient Error:", error);
        res.status(500).json({ success: false, message: "Failed to save patient." });
    }
};

// 3. Pharmacy Management View
exports.getPharmacy = async (req, res) => {
    try {
        const medicines = await Medicine.find().sort({ name: 1 }); 

        res.render('doctor/pharmacy', { 
            user: req.user, 
            medicines: medicines, 
            title: 'Pharmacy Management', 
            layout: false 
        });
    } catch (error) {
        console.error("Pharmacy fetch error:", error);
        res.status(500).send("Pharmacy data load nahi ho saka.");
    }
};

// 4. Add Medicine Logic
exports.addMedicine = async (req, res) => {
    try {
        const { name, category, stockLevel } = req.body;

        if (!name || !stockLevel) {
            return res.status(400).send("Medicine Name and Stock are required.");
        }

        await Medicine.create({
            name,
            category,
            stockLevel: parseInt(stockLevel)
        });

        res.redirect('/doctor/pharmacy'); 
    } catch (error) {
        console.error("Add Medicine Error:", error);
        res.status(500).send("Medicine add karne mein error: " + error.message);
    }
};

// 5. Update Appointment Status
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointmentId = req.params.id;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment nahi mila." });
        }

        if (appointment.status !== status) {
            appointment.status = status || 'Completed';
            await appointment.save();

            await Notification.create({
                patient: appointment.patient,
                message: `Status Update: Your appointment is now ${status.toUpperCase()}.`,
                type: status === 'Cancelled' ? 'error' : 'success'
            });
        }

        res.status(200).json({ success: true, message: "Status updated successfully", data: appointment });
    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// 6. Add Prescription & Close Appointment
exports.addPrescription = async (req, res) => {
    try {
        const { appointmentId, patientId, medicines, instructions, diagnosis } = req.body;

        if (!appointmentId || !patientId || !diagnosis) {
            return res.status(400).json({ success: false, message: "Diagnosis and IDs are required." });
        }
        
        const prescription = await Prescription.create({
            appointment: appointmentId,
            doctor: req.user._id,
            patient: patientId,
            medicines, 
            instructions, 
            diagnosis
        });

        await Appointment.findByIdAndUpdate(appointmentId, { 
            status: 'Completed', 
            prescription: prescription._id 
        });

        await Notification.create({
            patient: patientId,
            message: `New Medical Record: Dr. ${req.user.name} has issued a new prescription for you.`,
            type: 'info'
        });

        res.status(200).json({ success: true, message: "Prescription saved and patient notified!" });
    } catch (error) {
        console.error("Prescription Error:", error);
        res.status(400).json({ success: false, message: "Failed to save prescription: " + error.message });
    }
};