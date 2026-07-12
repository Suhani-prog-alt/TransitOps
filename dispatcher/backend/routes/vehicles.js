const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const { protect } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.type) filters.type = req.query.type;

    const vehicles = await Vehicle.find(filters).sort({ createdAt: -1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { registrationNumber, name, type, maxCapacity, odometer, acquisitionCost, status } = req.body;

    // Check uniqueness of registration number
    const duplicate = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Registration number must be unique' });
    }

    const vehicle = await Vehicle.create({
      registrationNumber,
      name,
      type,
      maxCapacity,
      odometer: odometer || 0,
      acquisitionCost,
      status: status || 'Available'
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Check registration number uniqueness if it is changing
    if (req.body.registrationNumber && req.body.registrationNumber.toUpperCase() !== vehicle.registrationNumber) {
      const duplicate = await Vehicle.findOne({ registrationNumber: req.body.registrationNumber.toUpperCase() });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Registration number must be unique' });
      }
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: vehicle });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    await vehicle.deleteOne();
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
