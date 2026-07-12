import { Router } from 'express';
import { getReportsSummary, exportVehiclesCSV, exportMaintenanceCSV } from '../controllers/reportController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/summary', getReportsSummary);
router.get('/export/vehicles', exportVehiclesCSV);
router.get('/export/maintenance', exportMaintenanceCSV);

export default router;
