"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activity = void 0;
const mongoose_1 = require("mongoose");
const activitySchema = new mongoose_1.Schema({
    vehicle: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vehicle' },
    type: {
        type: String,
        enum: ['Vehicle Added', 'Maintenance Started', 'Vehicle Retired', 'Maintenance Completed', 'Status Update', 'System Alert'],
        required: true
    },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });
exports.Activity = (0, mongoose_1.model)('Activity', activitySchema);
exports.default = exports.Activity;
