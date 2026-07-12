const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const { protect } = require('../middleware/auth');

router.use(protect);

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('vehicle')
      .populate('trip')
      .sort({ date: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Record new expense
// @route   POST /api/expenses
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { vehicleId, tripId, type, cost, date, description, liters } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const expense = await Expense.create({
      vehicle: vehicleId,
      trip: tripId || undefined,
      type,
      cost,
      date: date || Date.now(),
      description
    });

    // If type is Fuel, also log a FuelLog
    if (type === 'Fuel' && liters) {
      await FuelLog.create({
        vehicle: vehicleId,
        trip: tripId || undefined,
        liters,
        cost,
        date: date || Date.now()
      });
    }

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
