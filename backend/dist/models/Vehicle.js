"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vehicle = void 0;
const mongoose_1 = require("mongoose");
const vehicleSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.Vehicle = (0, mongoose_1.model)('Vehicle', vehicleSchema);
exports.default = exports.Vehicle;
