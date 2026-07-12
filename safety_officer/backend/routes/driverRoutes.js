const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Driver = require('../models/Driver');

// @route   GET api/drivers
// @desc    Get all drivers
router.get('/', auth, async (req, res) => {
    try {
        const drivers = await Driver.find().sort({ createdAt: -1 });
        res.json(drivers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/drivers
// @desc    Add new driver
router.post('/', auth, async (req, res) => {
    const { driverId, name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber } = req.body;
    
    // Safety Officer Validation: License cannot be expired when adding
    const expiryDate = new Date(licenseExpiryDate);
    if (expiryDate < new Date()) {
        return res.status(400).json({ msg: 'Cannot add driver with an expired license' });
    }

    try {
        let existingDriver = await Driver.findOne({ licenseNumber });
        if (existingDriver) {
            return res.status(400).json({ msg: 'Driver with this license already exists' });
        }

        const newDriver = new Driver({
            driverId, name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber
        });

        const driver = await newDriver.save();
        res.json(driver);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/drivers/:id
// @desc    Update driver details / score
router.put('/:id', auth, async (req, res) => {
    const { status, safetyScore, licenseExpiryDate, tripsCount } = req.body;
    
    // Build driver object
    const driverFields = {};
    if (status) driverFields.status = status;
    if (safetyScore !== undefined) driverFields.safetyScore = safetyScore;
    if (licenseExpiryDate) driverFields.licenseExpiryDate = licenseExpiryDate;
    if (tripsCount !== undefined) driverFields.tripsCount = tripsCount;

    try {
        let driver = await Driver.findById(req.params.id);
        if (!driver) return res.status(404).json({ msg: 'Driver not found' });

        driver = await Driver.findByIdAndUpdate(
            req.params.id,
            { $set: driverFields },
            { new: true }
        );

        res.json(driver);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/drivers/eligibility
// @desc    Get ineligible drivers (Expired or Suspended)
router.get('/eligibility', auth, async (req, res) => {
    try {
        const drivers = await Driver.find({
            $or: [
                { status: 'Suspended' },
                { licenseExpiryDate: { $lt: new Date() } }
            ]
        });
        res.json(drivers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/drivers/analytics
// @desc    Get counts for dashboard
router.get('/analytics', auth, async (req, res) => {
    try {
        const totalDrivers = await Driver.countDocuments();
        const availableDrivers = await Driver.countDocuments({ status: 'Available' });
        const onTripDrivers = await Driver.countDocuments({ status: 'On Trip' });
        const suspendedDrivers = await Driver.countDocuments({ status: 'Suspended' });
        
        const now = new Date();
        const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const expiredLicenses = await Driver.countDocuments({ licenseExpiryDate: { $lt: now } });
        const expiring7Days = await Driver.countDocuments({ licenseExpiryDate: { $gte: now, $lt: next7Days } });
        const expiring30Days = await Driver.countDocuments({ licenseExpiryDate: { $gte: now, $lt: next30Days } });
        
        res.json({
            status: {
                total: totalDrivers,
                available: availableDrivers,
                onTrip: onTripDrivers,
                suspended: suspendedDrivers
            },
            licenses: {
                expired: expiredLicenses,
                expiring7Days: expiring7Days,
                expiring30Days: expiring30Days
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
