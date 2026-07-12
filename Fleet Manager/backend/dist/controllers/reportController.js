"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportMaintenanceCSV = exports.exportVehiclesCSV = exports.getReportsSummary = void 0;
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const Maintenance_1 = __importDefault(require("../models/Maintenance"));
const getReportsSummary = async (req, res) => {
    try {
        const region = req.query.region;
        const query = {};
        if (req.user && req.user.region !== 'All Regions') {
            query.region = req.user.region;
        }
        else if (region && region !== 'All Regions') {
            query.region = region;
        }
        const vehicles = await Vehicle_1.default.find(query);
        const vehicleIds = vehicles.map(v => v._id);
        const maintenanceLogs = await Maintenance_1.default.find({ vehicle: { $in: vehicleIds } });
        // Financial calculations
        const totalPurchaseCost = vehicles.reduce((sum, v) => sum + v.purchaseCost, 0);
        const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + (log.actualCost || log.estimatedCost || 0), 0);
        // Status metrics
        const statusCounts = {
            Available: vehicles.filter(v => v.status === 'Available').length,
            InTrip: vehicles.filter(v => v.status === 'In Trip').length,
            InShop: vehicles.filter(v => v.status === 'In Shop').length,
            Retired: vehicles.filter(v => v.status === 'Retired').length
        };
        // Maintenance metrics
        const maintStats = {
            totalLogs: maintenanceLogs.length,
            completedLogs: maintenanceLogs.filter(log => log.status === 'Completed').length,
            activeLogs: maintenanceLogs.filter(log => log.status === 'In Progress').length,
            scheduledLogs: maintenanceLogs.filter(log => log.status === 'Scheduled').length,
            cancelledLogs: maintenanceLogs.filter(log => log.status === 'Cancelled').length
        };
        // Region summary
        const regionValuations = {};
        vehicles.forEach(v => {
            regionValuations[v.region] = (regionValuations[v.region] || 0) + v.purchaseCost;
        });
        res.json({
            fleetSummary: {
                totalVehicles: vehicles.length,
                totalValue: totalPurchaseCost,
                statusCounts
            },
            maintenanceSummary: {
                totalCost: totalMaintenanceCost,
                stats: maintStats
            },
            regionValuations
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error compiling report summary', error: error.message });
    }
};
exports.getReportsSummary = getReportsSummary;
// Export Vehicles CSV Content
const exportVehiclesCSV = async (req, res) => {
    try {
        const region = req.query.region;
        const query = {};
        if (req.user && req.user.region !== 'All Regions') {
            query.region = req.user.region;
        }
        else if (region && region !== 'All Regions') {
            query.region = region;
        }
        const vehicles = await Vehicle_1.default.find(query).sort({ registrationNumber: 1 });
        let csvContent = 'Registration Number,Name,Model,Type,Fuel Type,Capacity,Odometer,Purchase Date,Purchase Cost,Insurance Expiry,Region,Status,Health Score\n';
        vehicles.forEach(v => {
            const pDate = new Date(v.purchaseDate).toISOString().split('T')[0];
            const iDate = new Date(v.insuranceExpiry).toISOString().split('T')[0];
            csvContent += `"${v.registrationNumber}","${v.name}","${v.model}","${v.type}","${v.fuelType}",${v.maxCapacity},${v.currentOdometer},"${pDate}",${v.purchaseCost},"${iDate}","${v.region}","${v.status}",${v.healthScore}\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=fleet_report.csv');
        res.status(200).send(csvContent);
    }
    catch (error) {
        res.status(500).json({ message: 'Error exporting CSV', error: error.message });
    }
};
exports.exportVehiclesCSV = exportVehiclesCSV;
// Export Maintenance CSV Content
const exportMaintenanceCSV = async (req, res) => {
    try {
        const vehicles = await Vehicle_1.default.find();
        const vehicleIds = vehicles.map(v => v._id);
        const logs = await Maintenance_1.default.find({ vehicle: { $in: vehicleIds } }).populate('vehicle').sort({ startDate: -1 });
        let csvContent = 'Vehicle Name,Reg Number,Maintenance Type,Priority,Description,Mechanic,Est Cost,Actual Cost,Start Date,Expected Comp,Completion Date,Status\n';
        logs.forEach((log) => {
            const sDate = new Date(log.startDate).toISOString().split('T')[0];
            const eDate = new Date(log.expectedCompletion).toISOString().split('T')[0];
            const cDate = log.completionDate ? new Date(log.completionDate).toISOString().split('T')[0] : 'N/A';
            csvContent += `"${log.vehicle?.name || 'Unknown'}","${log.vehicle?.registrationNumber || 'N/A'}","${log.type}","${log.priority}","${log.description}","${log.mechanic}",${log.estimatedCost},${log.actualCost || 0},"${sDate}","${eDate}","${cDate}","${log.status}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=maintenance_report.csv');
        res.status(200).send(csvContent);
    }
    catch (error) {
        res.status(500).json({ message: 'Error exporting maintenance CSV', error: error.message });
    }
};
exports.exportMaintenanceCSV = exportMaintenanceCSV;
