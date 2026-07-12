import express from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expenseController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(authorizeRoles('Financial Analyst', 'Admin'), createExpense);

router.route('/:id')
  .get(getExpenseById)
  .put(authorizeRoles('Financial Analyst', 'Admin'), updateExpense)
  .delete(authorizeRoles('Financial Analyst', 'Admin'), deleteExpense);

export default router;
