const mongoose = require('mongoose');

const patientSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Patient name is required"],
        trim: true 
    },
    age: { 
        type: Number, 
        required: [true, "Age is required"] 
    },
    gender: { 
        type: String, 
        required: [true, "Gender is required"],
        enum: ['Male', 'Female', 'Other'] 
    },
    phone: { 
        type: String, 
        required: [true, "Contact number is required"],
        unique: true, // This requires the index to be created in MongoDB
        trim: true
    },
    bloodGroup: { 
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Not Specified'],
        default: 'Not Specified'
    },
    address: {
        type: String,
        trim: true
    },
    medicalHistory: [{ 
        condition: String, 
        date: { type: Date, default: Date.now },
        notes: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    }
}, { timestamps: true });

// Prevent model overwrite error during development (Nodemon reloads)
const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

module.exports = Patient;