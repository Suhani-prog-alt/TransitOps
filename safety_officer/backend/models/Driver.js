const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    driverId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    licenseCategory: {
        type: String,
        required: true
    },
    licenseExpiryDate: {
        type: Date,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    tripsCount: {
        type: Number,
        default: 0
    },
    safetyScore: {
        type: Number,
        default: 100
    },
    status: {
        type: String,
        enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
        default: 'Available'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Driver', DriverSchema);
