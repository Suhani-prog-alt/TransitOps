const express = require('express');
const router = express.Router();
const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// Apply protection
router.use(protect);

// @desc    Get all maintenance logs
// @route   GET /api/maintenance
// @access  Private
router.get('/', async (req, res) => {
  try {
    const logs = await MaintenanceLog.find().populate('vehicle').sort({ createdAt: -1 });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Create a maintenance log (starts maintenance, vehicle -> In Shop)
// @route   POST /api/maintenance
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { vehicleId, serviceType, scheduledDate, cost, notes, status } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Creating maintenance automatically switches vehicle status to 'In Shop'
    const log = await MaintenanceLog.create({
      vehicle: vehicleId,
      serviceType,
      scheduledDate,
      cost: cost || 0,
      notes,
      status: status || 'Active' // defaults to Active if starting immediately
    });

    if (log.status === 'Active') {
      vehicle.status = 'In Shop';
      await vehicle.save();
    }

    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Close maintenance log (finishes maintenance, vehicle -> Available)
// @route   POST /api/maintenance/:id/close
// @access  Private
router.post('/:id/close', async (req, res) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    if (log.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Maintenance record is already completed' });
    }

    // Update log
    log.status = 'Completed';
    await log.save();

    // Revert vehicle to Available if not retired
    const vehicle = await Vehicle.findById(log.vehicle);
    if (vehicle && vehicle.status !== 'Retired') {
      vehicle.status = 'Available';
      await vehicle.save();
    }

    // Log Maintenance Expense
    if (log.cost > 0) {
      await Expense.create({
        vehicle: log.vehicle,
        type: 'Maintenance',
        cost: log.cost,
        date: Date.now(),
        description: `Maintenance: ${log.serviceType}`
      });
    }

    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
