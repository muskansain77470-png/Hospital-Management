const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // Kis patient ko notification dikhana hai
    patient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true // Indexing se fetch speed badh jayegi
    },
    // Kya message dikhana hai
    message: { 
        type: String, 
        required: true 
    },
    // Type: success (green), info (blue), warning (yellow/red)
    type: { 
        type: String, 
        enum: ['success', 'info', 'warning'], // Sirf yehi options allowed hain
        default: 'success' 
    },
    // Popup ek baar dikhne ke baad true ho jayega
    isRead: { 
        type: Boolean, 
        default: false,
        index: true 
    },
    // Kab create hui (Auto-expire logic ke liye useful hai)
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Compound index for faster dashboard loading
notificationSchema.index({ patient: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;