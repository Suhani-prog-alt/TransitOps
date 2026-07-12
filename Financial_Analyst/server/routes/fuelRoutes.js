import express from 'express';
import {
  getFuelLogs,
  getFuelLogById,
  createFuelLog,
  updateFuelLog,
  deleteFuelLog
} from '../controllers/fuelController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFuelLogs)
  .post(authorizeRoles('Financial Analyst', 'Admin'), createFuelLog);

router.route('/:id')
  .get(getFuelLogById)
  .put(authorizeRoles('Financial Analyst', 'Admin'), updateFuelLog)
  .delete(authorizeRoles('Financial Analyst', 'Admin'), deleteFuelLog);

export default router;
