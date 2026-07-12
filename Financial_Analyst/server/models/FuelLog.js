import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema({
  fuelId: {
    type: String,
    required: true,
    unique: true
  },
  vehicleName: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true
  },
  tripId: {
    type: String,
    required: true
  },
  driver: {
    type: String,
    required: true
  },
  fuelQuantity: {
    type: Number,
    required: true
  },
  fuelCost: {
    type: Number,
    required: true
  },
  fuelDate: {
    type: Date,
    required: true
  },
  distanceCovered: {
    type: Number,
    required: true
  },
  fuelEfficiency: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Approved', 'Pending Review', 'Rejected'],
    default: 'Pending Review'
  }
}, {
  timestamps: true
});

const FuelLog = mongoose.model('FuelLog', fuelLogSchema);
export default FuelLog;
