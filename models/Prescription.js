const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, "Prescription must be linked to an appointment"]
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the logged-in patient
        required: true
    },
    // User Story 2: Medicines, dosage, and instructions
    diagnosis: {
        type: String,
        required: [true, "Diagnosis is required for the medical record"],
        trim: true
    },
    medicines: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g., "500mg"
        frequency: { type: String, required: true }, // e.g., "1-0-1" or "Twice a day"
        duration: { type: String, required: true }  // e.g., "5 days"
    }],
    instructions: {
        type: String, // e.g., "Take after meals"
        default: "Follow dosage as mentioned."
    },
    notes: {
        type: String,
        trim: true
    }
}, { 
    timestamps: true // User Story 2: Accessible anytime with recorded date
});

module.exports = mongoose.model('Prescription', prescriptionSchema);