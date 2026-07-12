"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Maintenance = void 0;
const mongoose_1 = require("mongoose");
const maintenanceSchema = new mongoose_1.Schema({
    vehicle: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type: { type: String, required: true }, // e.g. Brake Inspection, Oil Change, Tire Replacement, General Service, Engine Check
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        required: true
    },
    description: { type: String, required: true },
    mechanic: { type: String, required: true },
    estimatedCost: { type: Number, required: true, default: 0 },
    actualCost: { type: Number, default: 0 },
    startDate: { type: Date, required: true, default: Date.now },
    expectedCompletion: { type: Date, required: true },
    completionDate: { type: Date },
    status: {
        type: String,
        enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    }
}, { timestamps: true });
exports.Maintenance = (0, mongoose_1.model)('Maintenance', maintenanceSchema);
exports.default = exports.Maintenance;
