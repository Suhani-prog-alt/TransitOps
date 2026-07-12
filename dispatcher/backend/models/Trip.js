const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  source: {
    type: String,
    required: [true, 'Please add a source location']
  },
  destination: {
    type: String,
    required: [true, 'Please add a destination location']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  cargoWeight: {
    type: Number,
    required: [true, 'Please add cargo weight in kg']
  },
  plannedDistance: {
    type: Number,
    required: [true, 'Please add planned distance in km']
  },
  revenue: {
    type: Number,
    required: [true, 'Please add estimated/actual revenue'],
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  dispatchedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  finalOdometer: {
    type: Number
  },
  fuelConsumed: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Trip', TripSchema);
