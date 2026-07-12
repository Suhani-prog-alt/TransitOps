"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alert = void 0;
const mongoose_1 = require("mongoose");
const alertSchema = new mongoose_1.Schema({
    vehicle: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type: {
        type: String,
        enum: ['Maintenance Due', 'Insurance Expiry', 'Idle Vehicle', 'Mileage Limit', 'High Cost', 'Long Downtime'],
        required: true
    },
    message: { type: String, required: true },
    severity: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'warning'
    },
    isResolved: { type: Boolean, default: false }
}, { timestamps: true });
exports.Alert = (0, mongoose_1.model)('Alert', alertSchema);
exports.default = exports.Alert;
