import { Router } from 'express';
import { getMaintenances, createMaintenance, updateMaintenance, deleteMaintenance } from '../controllers/maintenanceController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Bypass JWT auth for hackathon demo
// router.use(authenticateJWT);

router.get('/', getMaintenances);
router.post('/', createMaintenance);
router.put('/:id', updateMaintenance);
router.delete('/:id', deleteMaintenance);

export default router;
