import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, getDashboardData);

export default router;
