const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const { protect } = require('../middleware/auth');

// Apply protection
router.use(protect);

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;

    const drivers = await Driver.find(filters).sort({ createdAt: -1 });
    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Create a driver
// @route   POST /api/drivers
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status } = req.body;

    // Check duplicate license
    const duplicate = await Driver.findOne({ licenseNumber: licenseNumber.trim() });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'License number must be unique' });
    }

    const driver = await Driver.create({
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore: safetyScore || 100,
      status: status || 'Available'
    });

    res.status(201).json({ success: true, data: driver });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Update a driver
// @route   PUT /api/drivers/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Check license unique if changing
    if (req.body.licenseNumber && req.body.licenseNumber.trim() !== driver.licenseNumber) {
      const duplicate = await Driver.findOne({ licenseNumber: req.body.licenseNumber.trim() });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'License number must be unique' });
      }
    }

    driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: driver });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Delete a driver
// @route   DELETE /api/drivers/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    await driver.deleteOne();
    res.json({ success: true, message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
