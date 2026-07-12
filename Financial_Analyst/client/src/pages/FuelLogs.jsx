import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fuelAPI } from '../services/api';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  AlertCircle
} from 'lucide-react';

const FuelLogs = () => {
  const { globalSearch, dateRange, vehicleFilter, regionFilter } = useOutletContext();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [status, setStatus] = useState('');
  const [sortField, setSortField] = useState('fuelDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    vehicleName: 'Truck-01',
    registrationNumber: 'TX-8839-A',
    tripId: '',
    driver: '',
    fuelQuantity: '',
    fuelCost: '',
    fuelDate: '',
    distanceCovered: '',
    status: 'Pending Review'
  });

  const vehiclesData = {
    'Truck-01': 'TX-8839-A',
    'Truck-02': 'TX-9402-B',
    'Truck-03': 'TX-1093-C',
    'Truck-04': 'TX-5582-D',
    'Truck-05': 'TX-3382-E',
    'Truck-06': 'TX-7711-F',
    'Truck-07': 'TX-2283-G',
    'Truck-08': 'TX-4402-H',
    'Truck-09': 'TX-9901-I',
    'Truck-10': 'TX-8172-J'
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || globalSearch || undefined,
        vehicleName: vehicle || vehicleFilter || undefined,
        status: status || undefined,
        sortField,
        sortOrder,
        page,
        limit: 8
      };
      const { data } = await fuelAPI.getLogs(params);
      setLogs(data.logs);
      setTotal(data.totalLogs);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, vehicle, status, sortField, sortOrder, globalSearch, vehicleFilter]);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  const handleOpenAdd = () => {
    setCurrentLog(null);
    setFormData({
      vehicleName: 'Truck-01',
      registrationNumber: vehiclesData['Truck-01'],
      tripId: `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
      driver: '',
      fuelQuantity: '',
      fuelCost: '',
      fuelDate: new Date().toISOString().split('T')[0],
      distanceCovered: '',
      status: 'Pending Review'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (log) => {
    setCurrentLog(log);
    setFormData({
      vehicleName: log.vehicleName,
      registrationNumber: log.registrationNumber,
      tripId: log.tripId,
      driver: log.driver,
      fuelQuantity: log.fuelQuantity,
      fuelCost: log.fuelCost,
      fuelDate: new Date(log.fuelDate).toISOString().split('T')[0],
      distanceCovered: log.distanceCovered,
      status: log.status
    });
    setIsModalOpen(true);
  };

  const handleOpenView = (log) => {
    setCurrentLog(log);
    setIsViewOpen(true);
  };

  const handleVehicleChange = (e) => {
    const v = e.target.value;
    setFormData({
      ...formData,
      vehicleName: v,
      registrationNumber: vehiclesData[v] || ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentLog) {
        // Edit log
        await fuelAPI.updateLog(currentLog._id, formData);
      } else {
        // Add log
        await fuelAPI.createLog(formData);
      }
      setIsModalOpen(false);
      fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fuel log?')) {
      try {
        await fuelAPI.deleteLog(id);
        fetchLogs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Fuel Operational Logs</h2>
          <p className="text-xs text-gray-500">Record and audit transport diesel transactions</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-gradient-to-r from-accentCyan to-accentGreen text-darkBg font-bold py-2.5 px-4 rounded-xl hover:shadow-glow transition-all duration-300"
        >
          <Plus size={16} />
          <span className="text-sm">Log Fuel Entry</span>
        </button>
      </div>

      {/* Local Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 p-4 rounded-2xl border border-darkBorder">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search Driver/Trip ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-darkBg border border-darkBorder rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accentCyan transition-all"
          />
        </div>

        {/* Vehicle */}
        <select
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
        >
          <option value="">All Vehicles</option>
          {Object.keys(vehiclesData).map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
        >
          <option value="">All Statuses</option>
          <option value="Approved">Approved</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* Clear Filters */}
        <button
          onClick={() => { setSearch(''); setVehicle(''); setStatus(''); }}
          className="w-full bg-white/5 border border-darkBorder text-gray-400 hover:text-white rounded-xl py-2 text-xs transition-all"
        >
          Reset Filters
        </button>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl border border-darkBorder overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-darkBorder text-gray-400 text-xs uppercase font-semibold bg-white/5">
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('fuelId')}>Fuel ID</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Registration</th>
                <th className="py-3.5 px-4">Trip ID</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('fuelQuantity')}>Quantity</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('fuelCost')}>Cost</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('fuelDate')}>Date</th>
                <th className="py-3.5 px-4">Distance</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('fuelEfficiency')}>Efficiency</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center py-12 text-xs text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accentCyan mx-auto mb-2"></div>
                    Fetching logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-12 text-xs text-gray-500">
                    No fuel logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors text-xs text-gray-300">
                    <td className="py-4 px-4 font-mono font-bold text-gray-200">{log.fuelId}</td>
                    <td className="py-4 px-4 font-semibold text-white">{log.vehicleName}</td>
                    <td className="py-4 px-4">{log.registrationNumber}</td>
                    <td className="py-4 px-4 font-mono">{log.tripId}</td>
                    <td className="py-4 px-4">{log.driver}</td>
                    <td className="py-4 px-4 font-mono">{log.fuelQuantity} L</td>
                    <td className="py-4 px-4 font-bold text-white">${log.fuelCost.toFixed(2)}</td>
                    <td className="py-4 px-4 text-gray-400">{new Date(log.fuelDate).toLocaleDateString()}</td>
                    <td className="py-4 px-4">{log.distanceCovered} km</td>
                    <td className="py-4 px-4 font-mono font-bold text-accentCyan">
                      {log.fuelEfficiency} <span className="text-[10px] text-gray-500">km/L</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'Approved'
                          ? 'bg-accentGreen/15 text-accentGreen'
                          : log.status === 'Rejected'
                          ? 'bg-red-500/15 text-accentRed'
                          : 'bg-yellow-500/15 text-yellow-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleOpenView(log)}
                        className="p-1 text-gray-400 hover:text-white bg-white/5 rounded border border-darkBorder hover:border-white/10"
                        title="View"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(log)}
                        className="p-1 text-gray-400 hover:text-accentCyan bg-white/5 rounded border border-darkBorder hover:border-accentCyan/20"
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(log._id)}
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

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-darkBorder relative shadow-2xl animate-scaleIn">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white mb-4">
              {currentLog ? 'Modify Fuel Transaction' : 'Record New Fuel Refill'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Vehicle</label>
                  <select
                    value={formData.vehicleName}
                    onChange={handleVehicleChange}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                  >
                    {Object.keys(vehiclesData).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Registration</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    className="w-full bg-white/5 border border-darkBorder rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Trip ID</label>
                  <input
                    type="text"
                    value={formData.tripId}
                    onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Driver</label>
                  <input
                    type="text"
                    value={formData.driver}
                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Quantity (Litres)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fuelQuantity}
                    onChange={(e) => setFormData({ ...formData, fuelQuantity: e.target.value })}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fuelCost}
                    onChange={(e) => setFormData({ ...formData, fuelCost: e.target.value })}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.distanceCovered}
                    onChange={(e) => setFormData({ ...formData, distanceCovered: e.target.value })}
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
                    value={formData.fuelDate}
                    onChange={(e) => setFormData({ ...formData, fuelDate: e.target.value })}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Audit Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
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
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewOpen && currentLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-darkBorder relative shadow-2xl animate-scaleIn">
            <button
              onClick={() => setIsViewOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white mb-6 border-b border-white/5 pb-2">
              Fuel Log Details ({currentLog.fuelId})
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Vehicle Name:</span> <span className="font-semibold text-white">{currentLog.vehicleName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Reg Plate:</span> <span className="font-semibold text-white">{currentLog.registrationNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Trip ID:</span> <span className="font-semibold font-mono text-white">{currentLog.tripId}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Driver Assignment:</span> <span className="font-semibold text-white">{currentLog.driver}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Diesel Quantity:</span> <span className="font-semibold text-white">{currentLog.fuelQuantity} L</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total Invoice Cost:</span> <span className="font-bold text-accentGreen">${currentLog.fuelCost.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Date Posted:</span> <span className="font-semibold text-white">{new Date(currentLog.fuelDate).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Distance Travelled:</span> <span className="font-semibold text-white">{currentLog.distanceCovered} km</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Fuel Efficiency:</span> <span className="font-bold text-accentCyan">{currentLog.fuelEfficiency} km/L</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">Auditor Status:</span> 
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentLog.status === 'Approved' ? 'bg-accentGreen/15 text-accentGreen' : 'bg-yellow-500/15 text-yellow-400'
                }`}>
                  {currentLog.status}
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

export default FuelLogs;
