import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';

// Simulated Vehicle Details for Acquisition Cost & Revenue
const VEHICLES_METADATA = {
  'Truck-01': { acquisitionCost: 120000, type: 'Heavy Duty', region: 'North', tripsCount: 42, baselineRevenue: 28000 },
  'Truck-02': { acquisitionCost: 115000, type: 'Heavy Duty', region: 'East', tripsCount: 38, baselineRevenue: 26000 },
  'Truck-03': { acquisitionCost: 95000, type: 'Medium Duty', region: 'West', tripsCount: 50, baselineRevenue: 24000 },
  'Truck-04': { acquisitionCost: 130000, type: 'Heavy Duty', region: 'South', tripsCount: 45, baselineRevenue: 31000 },
  'Truck-05': { acquisitionCost: 85000, type: 'Medium Duty', region: 'North', tripsCount: 55, baselineRevenue: 22000 },
  'Truck-06': { acquisitionCost: 60000, type: 'Light Duty', region: 'South', tripsCount: 60, baselineRevenue: 18000 },
  'Truck-07': { acquisitionCost: 140000, type: 'Heavy Duty', region: 'West', tripsCount: 30, baselineRevenue: 29000 },
  'Truck-08': { acquisitionCost: 55000, type: 'Light Duty', region: 'East', tripsCount: 72, baselineRevenue: 25000 },
  'Truck-09': { acquisitionCost: 110000, type: 'Heavy Duty', region: 'North', tripsCount: 35, baselineRevenue: 23000 },
  'Truck-10': { acquisitionCost: 90000, type: 'Medium Duty', region: 'South', tripsCount: 48, baselineRevenue: 21500 },
};

// Default metadata for fallback
const getVehicleMetadata = (name) => {
  return VEHICLES_METADATA[name] || { acquisitionCost: 100000, type: 'Medium Duty', region: 'General', tripsCount: 40, baselineRevenue: 25000 };
};

// @desc    Get dashboard metrics (KPI Cards and aggregates)
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardMetrics = async (req, res) => {
  try {
    const { vehicleName, startDate, endDate, region } = req.query;

    // Build filter objects
    let fuelFilter = {};
    let expenseFilter = {};

    if (vehicleName) {
      fuelFilter.vehicleName = vehicleName;
      expenseFilter.vehicleName = vehicleName;
    }

    if (startDate || endDate) {
      fuelFilter.fuelDate = {};
      expenseFilter.date = {};
      if (startDate) {
        fuelFilter.fuelDate.$gte = new Date(startDate);
        expenseFilter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        fuelFilter.fuelDate.$lte = new Date(endDate);
        expenseFilter.date.$lte = new Date(endDate);
      }
    }

    // Filter by Region (lookup matching vehicles)
    if (region) {
      const vehiclesInRegion = Object.keys(VEHICLES_METADATA).filter(
        (key) => VEHICLES_METADATA[key].region.toLowerCase() === region.toLowerCase()
      );
      fuelFilter.vehicleName = { $in: vehiclesInRegion };
      expenseFilter.vehicleName = { $in: vehiclesInRegion };
    }

    // 1. Total Fuel Cost
    const totalFuelCostResult = await FuelLog.aggregate([
      { $match: fuelFilter },
      { $group: { _id: null, total: { $sum: '$fuelCost' } } }
    ]);
    const totalFuelCost = totalFuelCostResult[0]?.total || 0;

    // 2. Total Maintenance Cost
    const totalMaintenanceResult = await Expense.aggregate([
      { $match: { ...expenseFilter, category: 'Maintenance' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalMaintenanceCost = totalMaintenanceResult[0]?.total || 0;

    // 3. Other Expenses (Repair, Insurance, Toll, Miscellaneous)
    const otherExpensesResult = await Expense.aggregate([
      { $match: { ...expenseFilter, category: { $in: ['Repair', 'Insurance', 'Toll', 'Miscellaneous'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const otherExpenses = otherExpensesResult[0]?.total || 0;

    // 4. Total Operational Cost = Fuel + Maintenance + Other
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost + otherExpenses;

    // 5. Simulated Revenue based on active vehicles
    // Let's find all unique vehicles in current range
    const activeFuelVehicles = await FuelLog.distinct('vehicleName', fuelFilter);
    const activeExpenseVehicles = await Expense.distinct('vehicleName', expenseFilter);
    const uniqueActiveVehicles = Array.from(new Set([...activeFuelVehicles, ...activeExpenseVehicles]));
    
    let totalRevenue = 0;
    let totalAcquisitionCost = 0;
    let totalTrips = 0;

    uniqueActiveVehicles.forEach((v) => {
      const meta = getVehicleMetadata(v);
      totalRevenue += meta.baselineRevenue;
      totalAcquisitionCost += meta.acquisitionCost;
      totalTrips += meta.tripsCount;
    });

    // Fallbacks if no data
    if (uniqueActiveVehicles.length === 0) {
      // Return baseline defaults
      totalRevenue = 250000;
      totalAcquisitionCost = 1000000;
      totalTrips = 400;
    }

    // 6. Net Profit
    const netProfit = totalRevenue - totalOperationalCost;

    // 7. Fleet ROI = (Revenue - (Fuel + Maintenance)) / Acquisition Cost
    const fleetROI = totalAcquisitionCost > 0 
      ? parseFloat(((totalRevenue - (totalFuelCost + totalMaintenanceCost)) / totalAcquisitionCost * 100).toFixed(2))
      : 0;

    // 8. Profit Margin = (Net Profit / Revenue) * 100
    const profitMargin = totalRevenue > 0 
      ? parseFloat((netProfit / totalRevenue * 100).toFixed(2))
      : 0;

    // 9. Averages
    const vehicleCount = uniqueActiveVehicles.length || 10;
    const averageCostPerVehicle = totalOperationalCost / vehicleCount;
    const averageCostPerTrip = totalOperationalCost / (totalTrips || 1);

    // Fuel and Expense sparkline arrays (last 10 entries)
    const fuelSparklineData = await FuelLog.find(fuelFilter).sort({ fuelDate: -1 }).limit(10).select('fuelCost');
    const expenseSparklineData = await Expense.find(expenseFilter).sort({ date: -1 }).limit(10).select('amount');

    res.json({
      kpi: {
        totalFuelCost,
        totalMaintenanceCost,
        otherExpenses,
        totalOperationalCost,
        revenueGenerated: totalRevenue,
        netProfit,
        fleetROI,
        profitMargin,
        averageCostPerVehicle,
        averageCostPerTrip,
        vehiclesCount: vehicleCount,
        tripsCount: totalTrips
      },
      sparklines: {
        fuel: fuelSparklineData.map(l => l.fuelCost).reverse(),
        expenses: expenseSparklineData.map(e => e.amount).reverse()
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get charts and trends
// @route   GET /api/analytics/charts
// @access  Private
export const getChartData = async (req, res) => {
  try {
    const { vehicleName } = req.query;
    let fuelFilter = {};
    let expenseFilter = {};

    if (vehicleName) {
      fuelFilter.vehicleName = vehicleName;
      expenseFilter.vehicleName = vehicleName;
    }

    // 1. Monthly Operational Cost (Line Chart)
    const monthlyOperational = await FuelLog.aggregate([
      { $match: fuelFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$fuelDate' } },
          fuelTotal: { $sum: '$fuelCost' }
        }
      }
    ]);

    const monthlyExpenses = await Expense.aggregate([
      { $match: expenseFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          expenseTotal: { $sum: '$amount' }
        }
      }
    ]);

    // Merge fuel and expenses by Month
    const monthsMap = {};
    monthlyOperational.forEach(item => {
      monthsMap[item._id] = { month: item._id, fuel: item.fuelTotal, expenses: 0, operationalCost: item.fuelTotal };
    });
    monthlyExpenses.forEach(item => {
      if (!monthsMap[item._id]) {
        monthsMap[item._id] = { month: item._id, fuel: 0, expenses: item.expenseTotal, operationalCost: item.expenseTotal };
      } else {
        monthsMap[item._id].expenses = item.expenseTotal;
        monthsMap[item._id].operationalCost += item.expenseTotal;
      }
    });

    const monthlyTrends = Object.values(monthsMap).sort((a, b) => a.month.localeCompare(b.month));

    // 2. Revenue vs Expenses (Bar Chart) & Profit Trend (Area Chart)
    // We mock monthly revenues based on vehicles active in that month
    const revenueVsExpenses = monthlyTrends.map(item => {
      // Simulate revenue roughly proportional to operational cost with some variance
      const simulatedRevenue = Math.round(item.operationalCost * 1.45 + 15000);
      const profit = simulatedRevenue - item.operationalCost;
      return {
        month: item.month,
        revenue: simulatedRevenue,
        expenses: Math.round(item.operationalCost),
        profit: Math.round(profit)
      };
    });

    // 3. Expense Category Distribution (Pie / Donut Chart)
    const categoryDistribution = await Expense.aggregate([
      { $match: expenseFilter },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);

    // Also include fuel cost in expense distribution
    const totalFuelCostResult = await FuelLog.aggregate([
      { $match: fuelFilter },
      { $group: { _id: null, total: { $sum: '$fuelCost' } } }
    ]);
    const totalFuelCost = totalFuelCostResult[0]?.total || 0;
    categoryDistribution.push({ name: 'Fuel', value: totalFuelCost });

    // 4. Vehicle Wise Profitability (Horizontal Bar Chart: Top 10 Profitable Vehicles)
    // Group fuel and expense by vehicle
    const vehicleFuel = await FuelLog.aggregate([
      { $group: { _id: '$vehicleName', fuel: { $sum: '$fuelCost' } } }
    ]);
    const vehicleExpenses = await Expense.aggregate([
      { $group: { _id: '$vehicleName', expenses: { $sum: '$amount' } } }
    ]);

    const vehicleCostMap = {};
    vehicleFuel.forEach(v => {
      vehicleCostMap[v._id] = { vehicle: v._id, fuel: v.fuel, expenses: 0, totalCost: v.fuel };
    });
    vehicleExpenses.forEach(v => {
      if (!vehicleCostMap[v._id]) {
        vehicleCostMap[v._id] = { vehicle: v._id, fuel: 0, expenses: v.expenses, totalCost: v.expenses };
      } else {
        vehicleCostMap[v._id].expenses = v.expenses;
        vehicleCostMap[v._id].totalCost += v.expenses;
      }
    });

    const vehicleProfitability = Object.values(vehicleCostMap).map(v => {
      const meta = getVehicleMetadata(v.vehicle);
      const revenue = meta.baselineRevenue;
      const profit = revenue - v.totalCost;
      const margin = revenue > 0 ? parseFloat((profit / revenue * 100).toFixed(1)) : 0;
      const roi = meta.acquisitionCost > 0 
        ? parseFloat(((revenue - (v.fuel + v.expenses)) / meta.acquisitionCost * 100).toFixed(1)) 
        : 0;

      return {
        vehicleName: v.vehicle,
        revenue,
        operationalCost: Math.round(v.totalCost),
        profit: Math.round(profit),
        profitMargin: margin,
        roi,
        acquisitionCost: meta.acquisitionCost
      };
    }).sort((a, b) => b.profit - a.profit);

    res.json({
      monthlyTrends,
      revenueVsExpenses,
      categoryDistribution,
      vehicleProfitability: vehicleProfitability.slice(0, 10), // Top 10
      allVehiclesProfitability: vehicleProfitability
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
