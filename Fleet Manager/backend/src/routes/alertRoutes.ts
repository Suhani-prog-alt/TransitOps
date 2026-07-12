import { Router } from 'express';
import { getAlerts, resolveAlert, scanForAlerts } from '../controllers/alertController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAlerts);
router.post('/scan', scanForAlerts);
router.put('/:id/resolve', resolveAlert);

export default router;
