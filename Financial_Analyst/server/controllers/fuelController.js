import FuelLog from '../models/FuelLog.js';

// @desc    Get all fuel logs with filters, search, pagination, and sorting
// @route   GET /api/fuel
// @access  Private
export const getFuelLogs = async (req, res) => {
  try {
    const {
      search,
      vehicleName,
      status,
      startDate,
      endDate,
      sortField = 'fuelDate',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // Global Search
    if (search) {
      query.$or = [
        { fuelId: { $regex: search, $options: 'i' } },
        { vehicleName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { driver: { $regex: search, $options: 'i' } },
        { tripId: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (vehicleName) {
      query.vehicleName = vehicleName;
    }
    if (status) {
      query.status = status;
    }

    // Date Range Filter
    if (startDate || endDate) {
      query.fuelDate = {};
      if (startDate) query.fuelDate.$gte = new Date(startDate);
      if (endDate) query.fuelDate.$lte = new Date(endDate);
    }

    // Pagination & Sorting
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const order = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: order };

    const total = await FuelLog.countDocuments(query);
    const logs = await FuelLog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      logs,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      totalLogs: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fuel log by ID
// @route   GET /api/fuel/:id
// @access  Private
export const getFuelLogById = async (req, res) => {
  try {
    const log = await FuelLog.findById(req.params.id);
    if (log) {
      res.json(log);
    } else {
      res.status(404).json({ message: 'Fuel log not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a fuel log
// @route   POST /api/fuel
// @access  Private
export const createFuelLog = async (req, res) => {
  try {
    const {
      vehicleName,
      registrationNumber,
      tripId,
      driver,
      fuelQuantity,
      fuelCost,
      fuelDate,
      distanceCovered,
      status
    } = req.body;

    // Auto-generate fuel ID
    const count = await FuelLog.countDocuments();
    const fuelId = `FL-${String(count + 1).padStart(4, '0')}`;

    // Calculate fuel efficiency (Distance / Quantity)
    const fuelEfficiency = fuelQuantity > 0 ? (distanceCovered / fuelQuantity).toFixed(2) : 0;

    const log = new FuelLog({
      fuelId,
      vehicleName,
      registrationNumber,
      tripId,
      driver,
      fuelQuantity: parseFloat(fuelQuantity),
      fuelCost: parseFloat(fuelCost),
      fuelDate: new Date(fuelDate),
      distanceCovered: parseFloat(distanceCovered),
      fuelEfficiency: parseFloat(fuelEfficiency),
      status: status || 'Pending Review'
    });

    const createdLog = await log.save();
    res.status(201).json(createdLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a fuel log
// @route   PUT /api/fuel/:id
// @access  Private
export const updateFuelLog = async (req, res) => {
  try {
    const {
      vehicleName,
      registrationNumber,
      tripId,
      driver,
      fuelQuantity,
      fuelCost,
      fuelDate,
      distanceCovered,
      status
    } = req.body;

    const log = await FuelLog.findById(req.params.id);

    if (log) {
      log.vehicleName = vehicleName || log.vehicleName;
      log.registrationNumber = registrationNumber || log.registrationNumber;
      log.tripId = tripId || log.tripId;
      log.driver = driver || log.driver;
      log.fuelQuantity = fuelQuantity !== undefined ? parseFloat(fuelQuantity) : log.fuelQuantity;
      log.fuelCost = fuelCost !== undefined ? parseFloat(fuelCost) : log.fuelCost;
      log.fuelDate = fuelDate ? new Date(fuelDate) : log.fuelDate;
      log.distanceCovered = distanceCovered !== undefined ? parseFloat(distanceCovered) : log.distanceCovered;
      log.status = status || log.status;

      // Re-calculate efficiency
      if (log.fuelQuantity > 0) {
        log.fuelEfficiency = parseFloat((log.distanceCovered / log.fuelQuantity).toFixed(2));
      }

      const updatedLog = await log.save();
      res.json(updatedLog);
    } else {
      res.status(404).json({ message: 'Fuel log not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a fuel log
// @route   DELETE /api/fuel/:id
// @access  Private
export const deleteFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.findById(req.params.id);
    if (log) {
      await FuelLog.deleteOne({ _id: req.params.id });
      res.json({ message: 'Fuel log removed' });
    } else {
      res.status(404).json({ message: 'Fuel log not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
