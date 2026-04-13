const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const Patient = require('../models/Patient');

/**
 * @desc    User Story 9: Get all appointments for billing dashboard
 * @route   GET /staff/billing
 */
exports.getBillingDashboard = async (req, res) => {
    try {
        // Fetch appointments that need billing
        const appointments = await Appointment.find()
            .populate('patient', 'name email phone')
            .populate('doctor', 'name')
            .sort({ createdAt: -1 });

        // Fetch last 10 bills for the history table
        const recentBills = await Billing.find()
            .populate('patient', 'name')
            .limit(10)
            .sort({ createdAt: -1 });

        res.render('staff/billing', { 
            user: req.user, 
            appointments,
            recentBills,
            title: 'Billing Management'
        });
    } catch (error) {
        console.error("Billing Dashboard Error:", error.message);
        res.status(500).render('error', { message: "Could not load billing data" });
    }
};

/**
 * @desc    User Story 9: Create a new bill with auto-calculations
 * @route   POST /api/staff/billing/create
 */
exports.createBill = async (req, res) => {
    try {
        const { appointmentId, patientId, services, costs } = req.body;

        // Basic Validation: Ensure services and costs are present
        if (!services || !costs || !appointmentId) {
            return res.status(400).render('error', { message: "All billing fields are required." });
        }

        // Converting string inputs to arrays if they aren't already (safety check)
        const servicesArray = Array.isArray(services) ? services : [services];
        const costsArray = Array.isArray(costs) ? costs : [costs];

        // Map items for the Billing Model
        const items = servicesArray.map((name, index) => ({
            serviceName: name,
            cost: parseFloat(costsArray[index]) || 0
        }));

        // Create the bill (Model logic will handle tax/totals)
        const newBill = await Billing.create({
            appointment: appointmentId,
            patient: patientId,
            items,
            generatedBy: req.user._id,
            status: 'Paid' 
        });

        // User Story 6: Update appointment status
        await Appointment.findByIdAndUpdate(appointmentId, { 
            paymentStatus: 'Paid',
            status: 'Completed' 
        });

        res.redirect('/staff/billing');
    } catch (error) {
        console.error("Bill Creation Error:", error.message);
        res.status(400).render('error', { message: "Failed to generate bill: " + error.message });
    }
};

/**
 * @desc    User Story 7: Register New Patient
 * @route   POST /api/staff/patients/register
 */
exports.registerPatient = async (req, res) => {
    try {
        const { name, age, gender, phone, bloodGroup } = req.body;

        // Check if patient already exists by phone
        const existingPatient = await Patient.findOne({ phone });
        if (existingPatient) {
            return res.status(400).json({ success: false, message: "Patient already registered with this phone number" });
        }

        const patient = await Patient.create({
            name,
            age,
            gender,
            phone,
            bloodGroup,
            createdBy: req.user._id
        });

        res.status(201).json({ 
            success: true, 
            message: "Patient registered successfully!", 
            patientId: patient._id 
        });
    } catch (error) {
        console.error("Patient Registration Error:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};