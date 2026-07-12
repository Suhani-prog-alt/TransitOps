const mongoose = require('mongoose');

const MaintenanceLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  serviceType: {
    type: String,
    required: [true, 'Please specify the service type (e.g., Oil Change, Brake Inspection)']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Please specify the scheduled date']
  },
  cost: {
    type: Number,
    required: [true, 'Please specify the maintenance cost'],
    default: 0
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Active', 'Completed'],
    default: 'Scheduled'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MaintenanceLog', MaintenanceLogSchema);
