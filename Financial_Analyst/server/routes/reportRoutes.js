import express from 'express';
import { getReports, createReportLog, downloadReportFile } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getReports)
  .post(createReportLog);

router.get('/:id/download', downloadReportFile);

export default router;
