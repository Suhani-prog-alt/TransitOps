import { Schema, model } from 'mongoose';

export interface IVehicle {
  registrationNumber: string;
  name: string;
  model: string;
  type: string;
  fuelType: string;
  maxCapacity: number;
  currentOdometer: number;
  purchaseDate: Date;
  purchaseCost: number;
  insuranceExpiry: Date;
  region: string;
  imageUrl?: string;
  status: 'Available' | 'In Trip' | 'In Shop' | 'Retired';
  healthScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    registrationNumber: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    model: { type: String, required: true },
    type: { type: String, required: true }, // e.g. Heavy Truck, Medium Truck, Light Van, Electric Bus
    fuelType: { type: String, required: true }, // e.g. Diesel, Petrol, Electric, Hybrid
    maxCapacity: { type: Number, required: true }, // kg or passengers
    currentOdometer: { type: Number, required: true, default: 0 },
    purchaseDate: { type: Date, required: true },
    purchaseCost: { type: Number, required: true },
    insuranceExpiry: { type: Date, required: true },
    region: { type: String, required: true }, // e.g. North, South, East, West
    imageUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Available', 'In Trip', 'In Shop', 'Retired'],
      default: 'Available'
    },
    healthScore: { type: Number, default: 100, min: 0, max: 100 }
  },
  { timestamps: true }
);

export const Vehicle = model<IVehicle>('Vehicle', vehicleSchema);
export default Vehicle;
