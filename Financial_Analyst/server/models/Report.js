import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'Fuel Report',
      'Expense Report',
      'Operational Cost Report',
      'Maintenance Cost Report',
      'Profitability Report',
      'ROI Report',
      'Financial Summary Report'
    ],
    required: true
  },
  generatedBy: {
    type: String,
    required: true
  },
  dateGenerated: {
    type: Date,
    default: Date.now
  },
  format: {
    type: String,
    enum: ['PDF', 'CSV', 'EXCEL'],
    required: true
  },
  filtersUsed: {
    type: Map,
    of: String
  },
  status: {
    type: String,
    enum: ['Completed', 'Generating', 'Failed'],
    default: 'Completed'
  }
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
