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
        unique: true, // Ek phone number se ek hi patient register hoga
        trim: true
    },
    bloodGroup: { 
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        default: 'Not Specified'
    },
    address: String,
    medicalHistory: [{ 
        condition: String, 
        date: { type: Date, default: Date.now },
        notes: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Jis staff ya doctor ne register kiya
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);