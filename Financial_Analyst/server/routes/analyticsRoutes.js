import express from 'express';
import { getDashboardMetrics, getChartData } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardMetrics);
router.get('/charts', getChartData);

export default router;
