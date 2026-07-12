const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const MaintenanceLog = require('../models/MaintenanceLog');
const { protect } = require('../middleware/auth');

router.use(protect);

// @desc    Get dashboard KPIs and chart data
// @route   GET /api/dashboard
// @access  Private
router.get('/', async (req, res) => {
  try {
    // 1. Get counts
    const totalVehicles = await Vehicle.countDocuments({ status: { $ne: 'Retired' } });
    const activeVehicles = await Vehicle.countDocuments({ status: 'On Trip' });
    const availableVehicles = await Vehicle.countDocuments({ status: 'Available' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'In Shop' });

    const activeTrips = await Trip.countDocuments({ status: 'Dispatched' });
    const pendingTrips = await Trip.countDocuments({ status: 'Draft' });
    const completedTrips = await Trip.countDocuments({ status: 'Completed' });
    const cancelledTrips = await Trip.countDocuments({ status: 'Cancelled' });

    const driversOnDuty = await Driver.countDocuments({ status: { $in: ['Available', 'On Trip'] } });

    // 2. Compute Fleet Utilization (%)
    const fleetUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

    // 3. Compute Operational Cost Breakdown
    const expenses = await Expense.find();
    let fuelCost = 0;
    let maintenanceCost = 0;
    let otherCost = 0;

    expenses.forEach(exp => {
      if (exp.type === 'Fuel') fuelCost += exp.cost;
      else if (exp.type === 'Maintenance') maintenanceCost += exp.cost;
      else otherCost += exp.cost;
    });

    const totalOperationalCost = fuelCost + maintenanceCost + otherCost;

    // 4. Compute Fuel Efficiency (Distance / Fuel)
    // Query completed trips with fuelConsumed > 0
    const completedTripsData = await Trip.find({ status: 'Completed' });
    let totalDistance = 0;
    let totalFuel = 0;

    completedTripsData.forEach(t => {
      totalDistance += t.plannedDistance;
      totalFuel += t.fuelConsumed || 0;
    });

    const averageFuelEfficiency = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : '0.00';

    // 5. Compute Vehicle ROI for top vehicles
    // ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
    const vehicles = await Vehicle.find({ status: { $ne: 'Retired' } });
    const vehiclesRoi = [];

    for (let v of vehicles) {
      // Find trips for this vehicle
      const vTrips = await Trip.find({ vehicle: v._id, status: 'Completed' });
      const revenue = vTrips.reduce((acc, t) => acc + (t.revenue || 0), 0);

      // Find expenses for this vehicle
      const vExpenses = await Expense.find({ vehicle: v._id });
      const mCost = vExpenses.filter(e => e.type === 'Maintenance').reduce((acc, e) => acc + e.cost, 0);
      const fCost = vExpenses.filter(e => e.type === 'Fuel').reduce((acc, e) => acc + e.cost, 0);
      const totalCosts = mCost + fCost;

      const roiVal = v.acquisitionCost > 0 
        ? ((revenue - totalCosts) / v.acquisitionCost) * 100 
        : 0;

      vehiclesRoi.push({
        id: v._id,
        registrationNumber: v.registrationNumber,
        name: v.name,
        roi: parseFloat(roiVal.toFixed(1))
      });
    }

    // Sort by ROI descending and take top 5
    vehiclesRoi.sort((a, b) => b.roi - a.roi);
    const topVehiclesByRoi = vehiclesRoi.slice(0, 5);

    // 6. Return response
    res.json({
      success: true,
      kpis: {
        activeVehicles,
        availableVehicles,
        maintenanceVehicles,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        fleetUtilization
      },
      tripsOverview: {
        total: activeTrips + pendingTrips + completedTrips + cancelledTrips,
        completed: completedTrips,
        active: activeTrips,
        pending: pendingTrips,
        cancelled: cancelledTrips
      },
      costs: {
        totalOperationalCost,
        fuelCost,
        maintenanceCost,
        otherCost
      },
      fuelEfficiency: {
        average: parseFloat(averageFuelEfficiency)
      },
      topVehiclesByRoi
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
