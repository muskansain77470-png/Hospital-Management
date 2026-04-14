const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, "Prescription must be linked to an appointment"]
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Ensure your Doctor/User model is named 'User'
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    diagnosis: {
        type: String,
        required: [true, "Diagnosis is required for the medical record"],
        trim: true
    },
    // Updated medicines array to match your EJS frontend
    medicines: [{
        name: { 
            type: String, 
            required: [true, "Medicine name is required"] 
        },
        dosage: { 
            type: String, 
            required: [true, "Dosage (e.g. 500mg) is required"] 
        },
        // Changed frequency to optional or removed 'required' to prevent save errors 
        // until you add it to your HTML form.
        frequency: { 
            type: String, 
            default: "As directed" 
        },
        duration: { 
            type: String, 
            required: [true, "Duration (e.g. 5 days) is required"] 
        }
    }],
    instructions: {
        type: String,
        default: "Take medicines after meals unless specified otherwise."
    },
    notes: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Completed'],
        default: 'Active'
    }
}, { 
    timestamps: true 
});

// Indexing for faster lookups (Useful for patient history)
prescriptionSchema.index({ appointment: 1 });
prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ doctor: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);