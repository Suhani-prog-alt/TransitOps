import Expense from '../models/Expense.js';

// @desc    Get all expenses with filters, search, pagination, and sorting
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    const {
      search,
      vehicleName,
      category,
      status,
      startDate,
      endDate,
      sortField = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // Global Search
    if (search) {
      query.$or = [
        { expenseId: { $regex: search, $options: 'i' } },
        { vehicleName: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (vehicleName) {
      query.vehicleName = vehicleName;
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    // Date Range Filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Pagination & Sorting
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const order = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: order };

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Summary Aggregation for Monthly Expenses
    const summaryAggregation = await Expense.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    res.json({
      expenses,
      monthlySummary: summaryAggregation,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      totalExpenses: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (expense) {
      res.json(expense);
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res) => {
  try {
    const {
      vehicleName,
      category,
      amount,
      date,
      status,
      remarks
    } = req.body;

    // Auto-generate expense ID
    const count = await Expense.countDocuments();
    const expenseId = `EXP-${String(count + 1).padStart(4, '0')}`;

    const expense = new Expense({
      expenseId,
      vehicleName,
      category,
      amount: parseFloat(amount),
      date: new Date(date),
      status: status || 'Pending',
      remarks: remarks || ''
    });

    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  try {
    const {
      vehicleName,
      category,
      amount,
      date,
      status,
      remarks
    } = req.body;

    const expense = await Expense.findById(req.params.id);

    if (expense) {
      expense.vehicleName = vehicleName || expense.vehicleName;
      expense.category = category || expense.category;
      expense.amount = amount !== undefined ? parseFloat(amount) : expense.amount;
      expense.date = date ? new Date(date) : expense.date;
      expense.status = status || expense.status;
      expense.remarks = remarks !== undefined ? remarks : expense.remarks;

      const updatedExpense = await expense.save();
      res.json(updatedExpense);
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (expense) {
      await Expense.deleteOne({ _id: req.params.id });
      res.json({ message: 'Expense removed' });
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
