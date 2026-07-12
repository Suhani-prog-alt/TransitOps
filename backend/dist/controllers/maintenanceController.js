"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMaintenance = exports.updateMaintenance = exports.createMaintenance = exports.getMaintenances = void 0;
const Maintenance_1 = __importDefault(require("../models/Maintenance"));
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const Activity_1 = __importDefault(require("../models/Activity"));
const vehicleController_1 = require("./vehicleController");
const getMaintenances = async (req, res) => {
    try {
        const { status, priority, vehicleId, page = '1', limit = '10' } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (priority)
            query.priority = priority;
        if (vehicleId)
            query.vehicle = vehicleId;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const total = await Maintenance_1.default.countDocuments(query);
        const logs = await Maintenance_1.default.find(query)
            .populate('vehicle')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        res.json({
            logs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching maintenance records', error: error.message });
    }
};
exports.getMaintenances = getMaintenances;
const createMaintenance = async (req, res) => {
    try {
        const { vehicle: vehicleId, type, priority, description, mechanic, estimatedCost, startDate, expectedCompletion, status = 'Scheduled' } = req.body;
        const vehicle = await Vehicle_1.default.findById(vehicleId);
        if (!vehicle) {
            res.status(404).json({ message: 'Vehicle not found' });
            return;
        }
        if (vehicle.status === 'Retired') {
            res.status(400).json({ message: 'Cannot schedule maintenance for retired vehicles' });
            return;
        }
        const log = new Maintenance_1.default({
            vehicle: vehicleId,
            type,
            priority,
            description,
            mechanic,
            estimatedCost,
            startDate: startDate || new Date(),
            expectedCompletion,
            status
        });
        await log.save();
        // Business Rule: If scheduled/started as In Progress, vehicle automatically becomes In Shop
        if (status === 'In Progress' || status === 'Scheduled') {
            vehicle.status = 'In Shop';
            await vehicle.save();
        }
        await (0, vehicleController_1.updateVehicleHealth)(vehicleId);
        // Record activity
        const activity = new Activity_1.default({
            vehicle: vehicle._id,
            type: 'Maintenance Started',
            description: `Maintenance (${type}) scheduled for ${vehicle.name}. Status set to In Shop.`
        });
        await activity.save();
        res.status(201).json(log);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating maintenance service', error: error.message });
    }
};
exports.createMaintenance = createMaintenance;
const updateMaintenance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, actualCost, completionDate, ...updateData } = req.body;
        const log = await Maintenance_1.default.findById(id);
        if (!log) {
            res.status(404).json({ message: 'Maintenance record not found' });
            return;
        }
        const oldStatus = log.status;
        // Apply updates
        if (status)
            log.status = status;
        if (actualCost !== undefined)
            log.actualCost = actualCost;
        if (completionDate)
            log.completionDate = completionDate;
        Object.assign(log, updateData);
        await log.save();
        const vehicle = await Vehicle_1.default.findById(log.vehicle);
        if (vehicle) {
            // Business Rule: Active maintenance automatically changes vehicle status to In Shop
            if (status === 'In Progress') {
                vehicle.status = 'In Shop';
                await vehicle.save();
                const activity = new Activity_1.default({
                    vehicle: vehicle._id,
                    type: 'Maintenance Started',
                    description: `Maintenance service started for ${vehicle.name}. Vehicle status updated to In Shop.`
                });
                await activity.save();
            }
            // Business Rule: Completed maintenance automatically restores Available status (unless retired)
            if (status === 'Completed') {
                if (vehicle.status !== 'Retired') {
                    vehicle.status = 'Available';
                    await vehicle.save();
                }
                log.completionDate = log.completionDate || new Date();
                await log.save();
                const activity = new Activity_1.default({
                    vehicle: vehicle._id,
                    type: 'Maintenance Completed',
                    description: `Maintenance service completed for ${vehicle.name}. Vehicle status updated to Available.`
                });
                await activity.save();
            }
            await (0, vehicleController_1.updateVehicleHealth)(vehicle._id.toString());
        }
        res.json(log);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating maintenance log', error: error.message });
    }
};
exports.updateMaintenance = updateMaintenance;
const deleteMaintenance = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await Maintenance_1.default.findByIdAndDelete(id);
        if (!log) {
            res.status(404).json({ message: 'Maintenance record not found' });
            return;
        }
        // Trigger update of vehicle health since log is removed
        await (0, vehicleController_1.updateVehicleHealth)(log.vehicle.toString());
        res.json({ message: 'Maintenance log deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting maintenance record', error: error.message });
    }
};
exports.deleteMaintenance = deleteMaintenance;
