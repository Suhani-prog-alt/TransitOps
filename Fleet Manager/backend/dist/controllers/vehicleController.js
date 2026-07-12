"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkOperations = exports.retireVehicle = exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehicleById = exports.getVehicles = exports.updateVehicleHealth = void 0;
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const Maintenance_1 = __importDefault(require("../models/Maintenance"));
const Activity_1 = __importDefault(require("../models/Activity"));
const Alert_1 = __importDefault(require("../models/Alert"));
// Helper to calculate health score dynamically
const updateVehicleHealth = async (vehicleId) => {
    const vehicle = await Vehicle_1.default.findById(vehicleId);
    if (!vehicle)
        return 100;
    let score = 100;
    // 1. Mileage deduction (-1 point per 15,000 km)
    score -= Math.floor(vehicle.currentOdometer / 15000);
    // 2. Age deduction (-0.5 points per month of age)
    const ageInMonths = (Date.now() - new Date(vehicle.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30.4);
    score -= Math.floor(ageInMonths * 0.4);
    // 3. Maintenance logs deduction
    const logs = await Maintenance_1.default.find({ vehicle: vehicleId });
    logs.forEach(log => {
        if (log.status === 'In Progress' || log.status === 'Scheduled') {
            if (log.priority === 'Critical')
                score -= 15;
            else if (log.priority === 'High')
                score -= 10;
            else if (log.priority === 'Medium')
                score -= 5;
        }
        else if (log.status === 'Completed') {
            // Small permanent deduction for critical repairs reflecting wear and tear
            if (log.priority === 'Critical')
                score -= 4;
            if (log.priority === 'High')
                score -= 2;
        }
    });
    // Ensure bounds
    const finalScore = Math.max(15, Math.min(100, score));
    vehicle.healthScore = finalScore;
    await vehicle.save();
    return finalScore;
};
exports.updateVehicleHealth = updateVehicleHealth;
// CRUD: Get list of vehicles with query parameters
const getVehicles = async (req, res) => {
    try {
        const { search, region, status, sortBy, sortOrder = 'asc', page = '1', limit = '10' } = req.query;
        const query = {};
        // Apply Region restrictions from User Profile (unless user has 'All Regions')
        if (req.user && req.user.region !== 'All Regions') {
            query.region = req.user.region;
        }
        else if (region && region !== 'All Regions') {
            query.region = region;
        }
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { registrationNumber: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } }
            ];
        }
        // Build Sorting
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }
        else {
            sort.createdAt = -1; // Default
        }
        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const total = await Vehicle_1.default.countDocuments(query);
        const vehicles = await Vehicle_1.default.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum);
        res.json({
            vehicles,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
    }
};
exports.getVehicles = getVehicles;
// CRUD: Get single vehicle details with complete statistics
const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle_1.default.findById(id);
        if (!vehicle) {
            res.status(404).json({ message: 'Vehicle not found' });
            return;
        }
        // Fetch Maintenance logs
        const maintenanceLogs = await Maintenance_1.default.find({ vehicle: id }).sort({ startDate: -1 });
        // Generate realistic Trip History (mocked dynamically for hackathon fidelity)
        const tripHistory = [
            { id: 'TRP-1045', source: 'Delhi', destination: 'Jaipur', driver: 'Alex', status: 'Completed', date: '2026-07-10', distance: 268 },
            { id: 'TRP-1038', source: 'Jaipur', destination: 'Delhi', driver: 'Alex', status: 'Completed', date: '2026-07-08', distance: 270 },
            { id: 'TRP-1022', source: 'Delhi', destination: 'Chandigarh', driver: 'Rohan', status: 'Completed', date: '2026-07-02', distance: 244 }
        ];
        if (vehicle.status === 'In Trip') {
            tripHistory.unshift({
                id: 'TRP-1052',
                source: 'Delhi',
                destination: 'Mumbai',
                driver: 'Karthik',
                status: 'Active',
                date: '2026-07-12',
                distance: 1415
            });
        }
        // Generate realistic Fuel History
        const fuelHistory = [
            { date: '2026-07-10', odometer: vehicle.currentOdometer, quantity: 45, cost: 4050, fuelStation: 'HP Petrol Pump' },
            { date: '2026-07-03', odometer: Math.max(0, vehicle.currentOdometer - 600), quantity: 42, cost: 3780, fuelStation: 'Indian Oil' },
            { date: '2026-06-25', odometer: Math.max(0, vehicle.currentOdometer - 1250), quantity: 48, cost: 4320, fuelStation: 'Bharat Petroleum' }
        ];
        // ROI and financial math
        const purchaseCost = vehicle.purchaseCost;
        const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + (log.actualCost || log.estimatedCost || 0), 0);
        const estimatedFuelCost = fuelHistory.reduce((sum, fill) => sum + fill.cost, 0) + (vehicle.currentOdometer * 6.5); // 6.5 INR/KM approx
        // Revenue generation: Heavy trucks earn more, light vans earn less. Est. 35 INR/KM for Heavy, 20 INR/KM for others
        const earningPerKm = vehicle.type.toLowerCase().includes('heavy') ? 40 : 25;
        const totalRevenue = vehicle.currentOdometer * earningPerKm;
        const totalExpenses = purchaseCost + totalMaintenanceCost + estimatedFuelCost;
        const roiPercentage = purchaseCost > 0 ? ((totalRevenue - totalExpenses) / purchaseCost) * 100 : 0;
        const expenseSummary = {
            purchaseCost,
            maintenanceCost: totalMaintenanceCost,
            fuelCost: Math.round(estimatedFuelCost),
            totalExpenses: Math.round(totalExpenses),
            totalRevenue: Math.round(totalRevenue),
            roi: parseFloat(roiPercentage.toFixed(1))
        };
        res.json({
            vehicle,
            maintenanceLogs,
            tripHistory,
            fuelHistory,
            expenseSummary
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching vehicle details', error: error.message });
    }
};
exports.getVehicleById = getVehicleById;
// CRUD: Create Vehicle
const createVehicle = async (req, res) => {
    try {
        const { registrationNumber, name, model, type, fuelType, maxCapacity, currentOdometer, purchaseDate, purchaseCost, insuranceExpiry, region, imageUrl } = req.body;
        const existing = await Vehicle_1.default.findOne({ registrationNumber: registrationNumber.toUpperCase() });
        if (existing) {
            res.status(400).json({ message: `Vehicle with registration number ${registrationNumber} already exists` });
            return;
        }
        const vehicle = new Vehicle_1.default({
            registrationNumber,
            name,
            model,
            type,
            fuelType,
            maxCapacity,
            currentOdometer,
            purchaseDate,
            purchaseCost,
            insuranceExpiry,
            region,
            imageUrl: imageUrl || ''
        });
        await vehicle.save();
        await (0, exports.updateVehicleHealth)(vehicle._id.toString());
        // Record activity
        const activity = new Activity_1.default({
            vehicle: vehicle._id,
            type: 'Vehicle Added',
            description: `Vehicle ${vehicle.name} (${vehicle.registrationNumber}) added to fleet in ${vehicle.region} region.`
        });
        await activity.save();
        res.status(201).json(vehicle);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating vehicle', error: error.message });
    }
};
exports.createVehicle = createVehicle;
// CRUD: Update Vehicle
const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { registrationNumber, ...updateData } = req.body;
        // Guard unique registration number if they try to edit it
        if (registrationNumber) {
            const existing = await Vehicle_1.default.findOne({
                registrationNumber: registrationNumber.toUpperCase(),
                _id: { $ne: id }
            });
            if (existing) {
                res.status(400).json({ message: `Vehicle with registration number ${registrationNumber} already exists` });
                return;
            }
            updateData.registrationNumber = registrationNumber.toUpperCase();
        }
        const vehicle = await Vehicle_1.default.findByIdAndUpdate(id, updateData, { new: true });
        if (!vehicle) {
            res.status(404).json({ message: 'Vehicle not found' });
            return;
        }
        await (0, exports.updateVehicleHealth)(id);
        // Record activity
        const activity = new Activity_1.default({
            vehicle: vehicle._id,
            type: 'Status Update',
            description: `Vehicle details updated for ${vehicle.name}.`
        });
        await activity.save();
        res.json(vehicle);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating vehicle', error: error.message });
    }
};
exports.updateVehicle = updateVehicle;
// CRUD: Delete Vehicle
const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle_1.default.findByIdAndDelete(id);
        if (!vehicle) {
            res.status(404).json({ message: 'Vehicle not found' });
            return;
        }
        // Clean up associated maintenance logs & alerts
        await Maintenance_1.default.deleteMany({ vehicle: id });
        await Alert_1.default.deleteMany({ vehicle: id });
        // Record activity
        const activity = new Activity_1.default({
            type: 'Status Update',
            description: `Vehicle ${vehicle.name} (${vehicle.registrationNumber}) deleted from system.`
        });
        await activity.save();
        res.json({ message: 'Vehicle and associated maintenance data deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
    }
};
exports.deleteVehicle = deleteVehicle;
// Business Action: Retire Vehicle
const retireVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle_1.default.findById(id);
        if (!vehicle) {
            res.status(404).json({ message: 'Vehicle not found' });
            return;
        }
        vehicle.status = 'Retired';
        await vehicle.save();
        // Record activity
        const activity = new Activity_1.default({
            vehicle: vehicle._id,
            type: 'Vehicle Retired',
            description: `Vehicle ${vehicle.name} (${vehicle.registrationNumber}) retired from fleet.`
        });
        await activity.save();
        res.json(vehicle);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retiring vehicle', error: error.message });
    }
};
exports.retireVehicle = retireVehicle;
// Bulk Actions Controller
const bulkOperations = async (req, res) => {
    try {
        const { action, vehicleIds, data } = req.body;
        if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
            res.status(400).json({ message: 'No vehicle IDs provided for bulk action' });
            return;
        }
        if (action === 'delete') {
            await Vehicle_1.default.deleteMany({ _id: { $in: vehicleIds } });
            await Maintenance_1.default.deleteMany({ vehicle: { $in: vehicleIds } });
            await Alert_1.default.deleteMany({ vehicle: { $in: vehicleIds } });
            const activity = new Activity_1.default({
                type: 'Status Update',
                description: `Bulk deleted ${vehicleIds.length} vehicles from registry.`
            });
            await activity.save();
            res.json({ message: `Successfully deleted ${vehicleIds.length} vehicles` });
            return;
        }
        if (action === 'maintenance') {
            // Schedule maintenance for all selected vehicles
            const { type, priority, description, mechanic, estimatedCost, expectedCompletion } = data;
            const maintenancePromises = vehicleIds.map(async (vId) => {
                const maint = new Maintenance_1.default({
                    vehicle: vId,
                    type,
                    priority,
                    description,
                    mechanic,
                    estimatedCost,
                    expectedCompletion,
                    startDate: new Date(),
                    status: 'Scheduled'
                });
                await maint.save();
                // Update vehicle status to shop if priority high or critical immediately
                if (priority === 'High' || priority === 'Critical') {
                    await Vehicle_1.default.findByIdAndUpdate(vId, { status: 'In Shop' });
                }
                await (0, exports.updateVehicleHealth)(vId);
            });
            await Promise.all(maintenancePromises);
            const activity = new Activity_1.default({
                type: 'Maintenance Started',
                description: `Bulk scheduled ${type} maintenance for ${vehicleIds.length} vehicles.`
            });
            await activity.save();
            res.json({ message: `Successfully scheduled maintenance for ${vehicleIds.length} vehicles` });
            return;
        }
        res.status(400).json({ message: 'Invalid bulk action specified' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error performing bulk operation', error: error.message });
    }
};
exports.bulkOperations = bulkOperations;
