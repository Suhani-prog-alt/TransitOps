import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  expenseId: {
    type: String,
    required: true,
    unique: true
  },
  vehicleName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Fuel', 'Maintenance', 'Repair', 'Insurance', 'Toll', 'Miscellaneous'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Pending'
  },
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
