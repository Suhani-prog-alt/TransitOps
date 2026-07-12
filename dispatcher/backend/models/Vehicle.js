const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Please add a registration number'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Please add a vehicle name/model']
  },
  type: {
    type: String,
    required: [true, 'Please specify the vehicle type (e.g. Van, Truck, Sedan)']
  },
  maxCapacity: {
    type: Number,
    required: [true, 'Please specify maximum load capacity in kg']
  },
  odometer: {
    type: Number,
    required: [true, 'Please specify current odometer reading in km'],
    default: 0
  },
  acquisitionCost: {
    type: Number,
    required: [true, 'Please specify acquisition cost']
  },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
