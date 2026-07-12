import { Request, Response } from 'express';
import Alert from '../models/Alert';
import Vehicle from '../models/Vehicle';
import Maintenance from '../models/Maintenance';
import { AuthRequest } from '../middleware/auth';

export const getAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { severity, isResolved = 'false' } = req.query;
    const query: any = { isResolved: isResolved === 'true' };

    if (severity) {
      query.severity = severity;
    }

    // Apply region checks if user is restricted
    if (req.user && req.user.region !== 'All Regions') {
      const vehiclesInRegion = await Vehicle.find({ region: req.user.region }).select('_id');
      query.vehicle = { $in: vehiclesInRegion.map(v => v._id) };
    }

    const alerts = await Alert.find(query)
      .populate('vehicle')
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving alerts', error: (error as Error).message });
  }
};

export const resolveAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByIdAndUpdate(id, { isResolved: true }, { new: true });
    if (!alert) {
      res.status(404).json({ message: 'Alert not found' });
      return;
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Error resolving alert', error: (error as Error).message });
  }
};

// Intelligent Rule Scan to populate new Alerts
export const scanForAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicles = await Vehicle.find({ status: { $ne: 'Retired' } });
    const newAlertsCount = { count: 0 };

    const scanPromises = vehicles.map(async (vehicle) => {
      const now = new Date();

      // Rule 1: Insurance Expiry (within next 30 days)
      const daysToInsuranceExpiry = (new Date(vehicle.insuranceExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysToInsuranceExpiry < 30 && daysToInsuranceExpiry > 0) {
        const exist = await Alert.findOne({ vehicle: vehicle._id, type: 'Insurance Expiry', isResolved: false });
        if (!exist) {
          await Alert.create({
            vehicle: vehicle._id,
            type: 'Insurance Expiry',
            message: `Insurance for ${vehicle.name} (${vehicle.registrationNumber}) expires in ${Math.round(daysToInsuranceExpiry)} days.`,
            severity: daysToInsuranceExpiry < 7 ? 'critical' : 'warning'
          });
          newAlertsCount.count++;
        }
      }

      // Rule 2: Mileage Limit (odometer crossed 150k km)
      if (vehicle.currentOdometer > 150000) {
        const exist = await Alert.findOne({ vehicle: vehicle._id, type: 'Mileage Limit', isResolved: false });
        if (!exist) {
          await Alert.create({
            vehicle: vehicle._id,
            type: 'Mileage Limit',
            message: `Vehicle ${vehicle.name} has crossed the high mileage threshold with ${vehicle.currentOdometer.toLocaleString()} km.`,
            severity: 'warning'
          });
          newAlertsCount.count++;
        }
      }

      // Rule 3: High Maintenance Costs (> 40% of Purchase Cost)
      const maintenanceLogs = await Maintenance.find({ vehicle: vehicle._id });
      const totalMaintCost = maintenanceLogs.reduce((sum, log) => sum + (log.actualCost || log.estimatedCost || 0), 0);
      if (vehicle.purchaseCost > 0 && totalMaintCost > (vehicle.purchaseCost * 0.4)) {
        const exist = await Alert.findOne({ vehicle: vehicle._id, type: 'High Cost', isResolved: false });
        if (!exist) {
          await Alert.create({
            vehicle: vehicle._id,
            type: 'High Cost',
            message: `Cumulative maintenance costs ($${totalMaintCost.toLocaleString()}) for ${vehicle.name} have exceeded 40% of its purchase price.`,
            severity: 'critical'
          });
          newAlertsCount.count++;
        }
      }

      // Rule 4: Vehicle Unavailable for Long Duration (In Shop for more than 10 days)
      if (vehicle.status === 'In Shop') {
        const activeMaint = await Maintenance.findOne({ vehicle: vehicle._id, status: 'In Progress' }).sort({ startDate: -1 });
        if (activeMaint) {
          const daysInShop = (now.getTime() - new Date(activeMaint.startDate).getTime()) / (1000 * 60 * 60 * 24);
          if (daysInShop > 10) {
            const exist = await Alert.findOne({ vehicle: vehicle._id, type: 'Long Downtime', isResolved: false });
            if (!exist) {
              await Alert.create({
                vehicle: vehicle._id,
                type: 'Long Downtime',
                message: `${vehicle.name} has been in shop for over ${Math.round(daysInShop)} days (Maintenance: ${activeMaint.type}).`,
                severity: 'critical'
              });
              newAlertsCount.count++;
            }
          }
        }
      }
    });

    await Promise.all(scanPromises);

    res.json({ message: 'Smart alerts scan completed', newAlertsTriggered: newAlertsCount.count });
  } catch (error) {
    res.status(500).json({ message: 'Error scanning for alerts', error: (error as Error).message });
  }
};
