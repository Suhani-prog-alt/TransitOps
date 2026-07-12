const mongoose = require('mongoose');

const FuelLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  liters: {
    type: Number,
    required: [true, 'Please specify liters added']
  },
  cost: {
    type: Number,
    required: [true, 'Please specify cost of fuel']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FuelLog', FuelLogSchema);
