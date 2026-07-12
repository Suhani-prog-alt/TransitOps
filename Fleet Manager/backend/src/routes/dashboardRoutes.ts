import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';

const router = Router();

// Bypass JWT authentication for dashboard so it always loads for the hackathon demo
router.get('/', getDashboardData);

export default router;
