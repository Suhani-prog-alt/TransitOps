import { Request, Response } from 'express';
import Vehicle from '../models/Vehicle';
import Maintenance from '../models/Maintenance';
import { AuthRequest } from '../middleware/auth';

export const getReportsSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const region = req.query.region as string;
    const query: any = {};

    if (req.user && req.user.region !== 'All Regions') {
      query.region = req.user.region;
    } else if (region && region !== 'All Regions') {
      query.region = region;
    }

    const vehicles = await Vehicle.find(query);
    const vehicleIds = vehicles.map(v => v._id);
    const maintenanceLogs = await Maintenance.find({ vehicle: { $in: vehicleIds } });

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
    const regionValuations: any = {};
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
  } catch (error) {
    res.status(500).json({ message: 'Error compiling report summary', error: (error as Error).message });
  }
};

// Export Vehicles CSV Content
export const exportVehiclesCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const region = req.query.region as string;
    const query: any = {};

    if (req.user && req.user.region !== 'All Regions') {
      query.region = req.user.region;
    } else if (region && region !== 'All Regions') {
      query.region = region;
    }

    const vehicles = await Vehicle.find(query).sort({ registrationNumber: 1 });

    let csvContent = 'Registration Number,Name,Model,Type,Fuel Type,Capacity,Odometer,Purchase Date,Purchase Cost,Insurance Expiry,Region,Status,Health Score\n';

    vehicles.forEach(v => {
      const pDate = new Date(v.purchaseDate).toISOString().split('T')[0];
      const iDate = new Date(v.insuranceExpiry).toISOString().split('T')[0];
      csvContent += `"${v.registrationNumber}","${v.name}","${v.model}","${v.type}","${v.fuelType}",${v.maxCapacity},${v.currentOdometer},"${pDate}",${v.purchaseCost},"${iDate}","${v.region}","${v.status}",${v.healthScore}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=fleet_report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting CSV', error: (error as Error).message });
  }
};

// Export Maintenance CSV Content
export const exportMaintenanceCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vehicles = await Vehicle.find();
    const vehicleIds = vehicles.map(v => v._id);

    const logs = await Maintenance.find({ vehicle: { $in: vehicleIds } }).populate('vehicle').sort({ startDate: -1 });

    let csvContent = 'Vehicle Name,Reg Number,Maintenance Type,Priority,Description,Mechanic,Est Cost,Actual Cost,Start Date,Expected Comp,Completion Date,Status\n';

    logs.forEach((log: any) => {
      const sDate = new Date(log.startDate).toISOString().split('T')[0];
      const eDate = new Date(log.expectedCompletion).toISOString().split('T')[0];
      const cDate = log.completionDate ? new Date(log.completionDate).toISOString().split('T')[0] : 'N/A';
      csvContent += `"${log.vehicle?.name || 'Unknown'}","${log.vehicle?.registrationNumber || 'N/A'}","${log.type}","${log.priority}","${log.description}","${log.mechanic}",${log.estimatedCost},${log.actualCost || 0},"${sDate}","${eDate}","${cDate}","${log.status}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=maintenance_report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting maintenance CSV', error: (error as Error).message });
  }
};
