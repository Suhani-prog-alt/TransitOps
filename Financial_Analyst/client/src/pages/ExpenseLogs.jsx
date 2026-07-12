import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { expenseAPI } from '../services/api';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  CreditCard,
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';

const ExpenseLogs = () => {
  const { globalSearch, dateRange, vehicleFilter, regionFilter } = useOutletContext();

  const [expenses, setExpenses] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filter/Sort State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    vehicleName: 'Truck-01',
    category: 'Maintenance',
    amount: '',
    date: '',
    status: 'Pending',
    remarks: ''
  });

  const categories = ['Maintenance', 'Repair', 'Insurance', 'Toll', 'Miscellaneous'];
  const vehicles = ['Truck-01', 'Truck-02', 'Truck-03', 'Truck-04', 'Truck-05', 'Truck-06', 'Truck-07', 'Truck-08', 'Truck-09', 'Truck-10'];

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || globalSearch || undefined,
        vehicleName: vehicleFilter || undefined,
        category: category || undefined,
        status: status || undefined,
        sortField,
        sortOrder,
        page,
        limit: 8
      };
      const { data } = await expenseAPI.getExpenses(params);
      setExpenses(data.expenses);
      setMonthlySummary(data.monthlySummary);
      setTotal(data.totalExpenses);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, search, category, status, sortField, sortOrder, globalSearch, vehicleFilter]);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  const handleOpenAdd = () => {
    setCurrentExpense(null);
    setFormData({
      vehicleName: 'Truck-01',
      category: 'Maintenance',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      remarks: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setCurrentExpense(exp);
    setFormData({
      vehicleName: exp.vehicleName,
      category: exp.category,
      amount: exp.amount,
      date: new Date(exp.date).toISOString().split('T')[0],
      status: exp.status,
      remarks: exp.remarks
    });
    setIsModalOpen(true);
  };

  const handleOpenView = (exp) => {
    setCurrentExpense(exp);
    setIsViewOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentExpense) {
        await expenseAPI.updateExpense(currentExpense._id, formData);
      } else {
        await expenseAPI.createExpense(formData);
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense log?')) {
      try {
        await expenseAPI.deleteExpense(id);
        fetchExpenses();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top action block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Ledger Expenses Logs</h2>
          <p className="text-xs text-gray-500">Review repairs, insurances, maintenance bills, and road tolls</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-gradient-to-r from-accentCyan to-accentGreen text-darkBg font-bold py-2.5 px-4 rounded-xl hover:shadow-glow transition-all duration-300"
        >
          <Plus size={16} />
          <span className="text-sm">Log Expense</span>
        </button>
      </div>

      {/* Monthly Summary Cards Carousel / Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {monthlySummary.slice(0, 4).map((summary, index) => (
          <div key={index} className="glass-panel p-4 rounded-xl border border-darkBorder flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">{summary._id} Summary</span>
              <h4 className="text-lg font-bold text-white mt-1">${summary.totalAmount.toLocaleString()}</h4>
              <p className="text-[10px] text-gray-500">{summary.count} expense vouchers posted</p>
            </div>
            <div className="p-2 bg-white/5 rounded-lg border border-darkBorder text-accentGreen">
              <TrendingUp size={16} />
            </div>
          </div>
        ))}
        {monthlySummary.length === 0 && (
          <div className="col-span-4 glass-panel p-4 text-center text-xs text-gray-500">
            No monthly expense data logged.
          </div>
        )}
      </section>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 p-4 rounded-2xl border border-darkBorder">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search remarks, expense ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-darkBg border border-darkBorder rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accentCyan transition-all"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
        >
          <option value="">All Statuses</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* Reset */}
        <button
          onClick={() => { setSearch(''); setCategory(''); setStatus(''); }}
          className="w-full bg-white/5 border border-darkBorder text-gray-400 hover:text-white rounded-xl py-2 text-xs transition-all"
        >
          Reset Filters
        </button>
      </div>

      {/* Expenses Table */}
      <div className="glass-panel rounded-2xl border border-darkBorder overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-darkBorder text-gray-400 text-xs uppercase font-semibold bg-white/5">
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('expenseId')}>Expense ID</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('amount')}>Amount</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('date')}>Date</th>
                <th className="py-3.5 px-4">Remarks</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-xs text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accentCyan mx-auto mb-2"></div>
                    Fetching expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-xs text-gray-500">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-white/5 transition-colors text-xs text-gray-300">
                    <td className="py-4 px-4 font-mono font-bold text-gray-200">{exp.expenseId}</td>
                    <td className="py-4 px-4 font-semibold text-white">{exp.vehicleName}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/5 text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-white">${exp.amount.toFixed(2)}</td>
                    <td className="py-4 px-4 text-gray-400">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4 max-w-xs truncate text-gray-400">{exp.remarks || '-'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        exp.status === 'Approved'
                          ? 'bg-accentGreen/15 text-accentGreen'
                          : exp.status === 'Rejected'
                          ? 'bg-red-500/15 text-accentRed'
                          : 'bg-yellow-500/15 text-yellow-400'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleOpenView(exp)}
                        className="p-1 text-gray-400 hover:text-white bg-white/5 rounded border border-darkBorder hover:border-white/10"
                        title="View"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1 text-gray-400 hover:text-accentCyan bg-white/5 rounded border border-darkBorder hover:border-accentCyan/20"
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="p-1 text-gray-400 hover:text-red-400 bg-white/5 rounded border border-darkBorder hover:border-red-500/20"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-darkBorder flex items-center justify-between text-xs text-gray-400">
          <span>
            Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{pages}</strong> ({total} records)
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 border border-darkBorder bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, pages))}
              disabled={page === pages}
              className="p-2 border border-darkBorder bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ADD/EDIT EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-darkBorder relative shadow-2xl animate-scaleIn">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white mb-4">
              {currentExpense ? 'Modify Expense Record' : 'Record Operational Bill'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Vehicle Assignment</label>
                <select
                  value={formData.vehicleName}
                  onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                >
                  {vehicles.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Billing Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Ledger Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-accentCyan h-20 resize-none"
                  placeholder="Additional invoice details or description..."
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-darkBorder">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-darkBorder rounded-xl hover:bg-white/5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-accentCyan to-accentGreen text-darkBg rounded-xl hover:shadow-glow text-xs font-bold"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAIL EXPENSE */}
      {isViewOpen && currentExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-darkBorder relative shadow-2xl animate-scaleIn">
            <button
              onClick={() => setIsViewOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white mb-6 border-b border-white/5 pb-2">
              Expense Record Details ({currentExpense.expenseId})
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Vehicle Assignment:</span> <span className="font-semibold text-white">{currentExpense.vehicleName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Category:</span> <span className="font-semibold text-white">{currentExpense.category}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Billing Amount:</span> <span className="font-bold text-accentGreen">${currentExpense.amount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Transaction Date:</span> <span className="font-semibold text-white">{new Date(currentExpense.date).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Description / Remarks:</span> <span className="font-semibold text-white">{currentExpense.remarks || '-'}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">Ledger Status:</span> 
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentExpense.status === 'Approved' ? 'bg-accentGreen/15 text-accentGreen' : 'bg-yellow-500/15 text-yellow-400'
                }`}>
                  {currentExpense.status}
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-darkBorder flex justify-end">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 bg-white/5 border border-darkBorder rounded-xl hover:bg-white/10 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpenseLogs;
