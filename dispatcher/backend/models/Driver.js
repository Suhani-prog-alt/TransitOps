const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a driver name']
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please add a license number'],
    unique: true,
    trim: true
  },
  licenseCategory: {
    type: String,
    required: [true, 'Please specify the license category (e.g. Class A, Commercial)']
  },
  licenseExpiryDate: {
    type: Date,
    required: [true, 'Please add the license expiry date']
  },
  contactNumber: {
    type: String,
    required: [true, 'Please add a contact number']
  },
  safetyScore: {
    type: Number,
    min: 0,
    max: 100,
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
