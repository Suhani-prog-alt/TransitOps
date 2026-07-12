const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// Apply protection
router.use(protect);

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('vehicle')
      .populate('driver')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: trips.length, data: trips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Create a trip (Draft status)
// @route   POST /api/trips
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, revenue } = req.body;

    // 1. Fetch Vehicle & Driver
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // 2. Validate Vehicle status
    if (vehicle.status !== 'Available') {
      return res.status(400).json({ success: false, message: `Vehicle is currently ${vehicle.status} and cannot be assigned` });
    }

    // 3. Validate Driver status
    if (driver.status !== 'Available') {
      return res.status(400).json({ success: false, message: `Driver is currently ${driver.status} and cannot be assigned` });
    }

    // 4. Validate Driver License Expiry
    const today = new Date();
    if (new Date(driver.licenseExpiryDate) < today) {
      return res.status(400).json({ success: false, message: 'Driver license has expired' });
    }

    // 5. Validate Driver status is Suspended
    if (driver.status === 'Suspended') {
      return res.status(400).json({ success: false, message: 'Driver is suspended and cannot be assigned' });
    }

    // 6. Validate cargo weight
    if (cargoWeight > vehicle.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: `Cargo weight (${cargoWeight} kg) exceeds vehicle maximum capacity (${vehicle.maxCapacity} kg)`
      });
    }

    // Create Trip in Draft status
    const trip = await Trip.create({
      source,
      destination,
      vehicle: vehicleId,
      driver: driverId,
      cargoWeight,
      plannedDistance,
      revenue: revenue || plannedDistance * 20, // default revenue estimate
      status: 'Draft'
    });

    res.status(201).json({ success: true, data: trip });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Dispatch a trip
// @route   POST /api/trips/:id/dispatch
// @access  Private
router.post('/:id/dispatch', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.status !== 'Draft') {
      return res.status(400).json({ success: false, message: `Cannot dispatch a trip with status: ${trip.status}` });
    }

    // Double check availability of vehicle and driver
    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    if (vehicle.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Assigned vehicle is no longer Available' });
    }
    if (driver.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Assigned driver is no longer Available' });
    }

    // Update statuses
    trip.status = 'Dispatched';
    trip.dispatchedAt = Date.now();
    await trip.save();

    vehicle.status = 'On Trip';
    await vehicle.save();

    driver.status = 'On Trip';
    await driver.save();

    res.json({ success: true, data: trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Complete a trip
// @route   POST /api/trips/:id/complete
// @access  Private
router.post('/:id/complete', async (req, res) => {
  try {
    const { finalOdometer, fuelConsumed, fuelCost } = req.body;

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ success: false, message: `Cannot complete a trip with status: ${trip.status}` });
    }

    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    // Validate odometer reading
    if (finalOdometer && finalOdometer <= vehicle.odometer) {
      return res.status(400).json({
        success: false,
        message: `Final odometer reading (${finalOdometer} km) must be greater than starting odometer (${vehicle.odometer} km)`
      });
    }

    // Update trip details
    trip.status = 'Completed';
    trip.completedAt = Date.now();
    trip.finalOdometer = finalOdometer || (vehicle.odometer + trip.plannedDistance);
    trip.fuelConsumed = fuelConsumed || 0;
    await trip.save();

    // Revert Vehicle & Driver statuses to Available
    const distanceTraveled = trip.finalOdometer - vehicle.odometer;
    vehicle.status = 'Available';
    vehicle.odometer = trip.finalOdometer;
    await vehicle.save();

    driver.status = 'Available';
    await driver.save();

    // Create Fuel Log and Fuel Expense if fuel consumed
    if (fuelConsumed > 0) {
      const calculatedFuelCost = fuelCost || (fuelConsumed * 100); // default to 100 per liter if not provided
      
      // Save Fuel Log
      await FuelLog.create({
        vehicle: vehicle._id,
        trip: trip._id,
        liters: fuelConsumed,
        cost: calculatedFuelCost,
        date: Date.now()
      });

      // Save Fuel Expense
      await Expense.create({
        vehicle: vehicle._id,
        trip: trip._id,
        type: 'Fuel',
        cost: calculatedFuelCost,
        date: Date.now(),
        description: `Fuel for Trip: ${trip.source} to ${trip.destination}`
      });
    }

    res.json({ success: true, data: trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Cancel a trip
// @route   POST /api/trips/:id/cancel
// @access  Private
router.post('/:id/cancel', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.status === 'Completed' || trip.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: `Cannot cancel a trip that is already ${trip.status}` });
    }

    const wasDispatched = trip.status === 'Dispatched';

    trip.status = 'Cancelled';
    trip.cancelledAt = Date.now();
    await trip.save();

    // Restore vehicle and driver status if dispatched
    if (wasDispatched) {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
      await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' });
    }

    res.json({ success: true, data: trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
