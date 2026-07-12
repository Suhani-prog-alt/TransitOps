import React, { useState, useEffect, useContext } from 'react';
import { Plus, Wrench, ShieldAlert, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Maintenance = ({ apiFetch }) => {
  const { user } = useContext(AuthContext);
  const isFleetManager = user?.role === 'Fleet Manager';

  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [serviceType, setServiceType] = useState('Oil Change');
  const [scheduledDate, setScheduledDate] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Active'); // Defaults to Active

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsRes, vehiclesRes] = await Promise.all([
        apiFetch('/api/maintenance'),
        apiFetch('/api/vehicles')
      ]);

      const logsData = await logsRes.json();
      const vehiclesData = await vehiclesRes.json();

      if (logsData.success) setLogs(logsData.data);
      if (vehiclesData.success) setVehicles(vehiclesData.data);
    } catch (err) {
      console.error('Error fetching maintenance records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiFetch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await apiFetch('/api/maintenance', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId,
          serviceType,
          scheduledDate,
          cost: parseFloat(cost) || 0,
          notes,
          status
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(`Maintenance logged! Vehicle status has been updated.`);
        setShowAddForm(false);
        // Reset fields
        setVehicleId('');
        setScheduledDate('');
        setCost('');
        setNotes('');
        loadData();
      } else {
        setError(data.message || 'Failed to log maintenance');
      }
    } catch (err) {
      setError(err.message || 'Error processing request');
    }
  };

  const handleCloseMaintenance = async (id) => {
    if (!confirm('Are you sure this maintenance is complete?')) return;
    try {
      const res = await apiFetch(`/api/maintenance/${id}/close`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuccess('Maintenance closed! Vehicle returned to Available fleet.');
        loadData();
      } else {
        alert(data.message || 'Failed to close maintenance');
      }
    } catch (err) {
      alert(err.message || 'Error closing maintenance');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5bc0be]"></div>
      </div>
    );
  }

  const availableVehiclesForMaint = vehicles.filter(v => v.status !== 'Retired' && v.status !== 'In Shop');

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Maintenance Log</h2>
          <p className="text-xs text-[#9ca3af]">Track scheduled checkups, active garage repairs, and vehicle uptime.</p>
        </div>
        
        {/* Conditional Schedule Button */}
        {isFleetManager && (
          <button
            onClick={() => {
              setError('');
              setShowAddForm(!showAddForm);
            }}
            className="bg-[#5bc0be] text-[#0b132b] font-bold px-4 py-2.5 rounded-xl hover:bg-[#48a9a7] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#5bc0be]/10"
          >
            <Plus className="h-5 w-5" />
            <span>Log Maintenance</span>
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-200 text-sm p-4 rounded-xl flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Conditional Add Form */}
      {isFleetManager && showAddForm && (
        <div className="bg-[#1c2541]/80 border border-[#3a506b] rounded-2xl p-6 shadow-xl animate-fade-in">
          <h3 className="font-bold text-white uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
            <Wrench className="h-4.5 w-4.5 text-[#5bc0be]" />
            <span>Create Maintenance Record</span>
          </h3>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs p-3.5 rounded-xl flex items-start gap-2 mb-4">
              <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Select Vehicle</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
              >
                <option value="">-- Select Vehicle --</option>
                {availableVehiclesForMaint.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.registrationNumber} - {v.name} (Current Status: {v.status})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
              >
                <option value="Oil Change">Oil Change</option>
                <option value="Brake Inspection">Brake Inspection</option>
                <option value="Tire Replacement">Tire Replacement</option>
                <option value="Engine Check">Engine Check</option>
                <option value="General Service">General Service</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Scheduled Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Est/Actual Cost (₹)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
              >
                <option value="Active">Active (Send to Shop Immediately)</option>
                <option value="Scheduled">Scheduled (Plan for Later)</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Service Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe details like engine warnings, components replaced, mechanic name..."
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be] h-20"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-[#0b132b] text-white border border-[#3a506b] px-4 py-2 rounded-xl hover:bg-[#3a506b]/30 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#5bc0be] text-[#0b132b] font-bold px-6 py-2 rounded-xl hover:bg-[#48a9a7] cursor-pointer"
              >
                Log Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Maintenance Logs Table */}
      <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#3a506b]/40 bg-[#0b132b]/30 text-[#9ca3af] text-[10px] uppercase font-bold tracking-wider">
              <th className="p-4">Vehicle</th>
              <th className="p-4">Service Type</th>
              <th className="p-4">Scheduled/Active Date</th>
              <th className="p-4">Cost</th>
              <th className="p-4">Status</th>
              <th className="p-4">Notes</th>
              {isFleetManager && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-[#3a506b]/20">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-[#0b132b]/20 transition-all">
                  <td className="p-4 text-white font-semibold">{log.vehicle?.registrationNumber || 'N/A'}</td>
                  <td className="p-4 font-medium text-white">{log.serviceType}</td>
                  <td className="p-4 text-[#9ca3af] font-semibold">
                    {new Date(log.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-white font-bold">₹{log.cost.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      log.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      log.status === 'Active' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {log.status === 'Active' ? 'In Shop' : log.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#9ca3af] max-w-[200px] truncate" title={log.notes}>
                    {log.notes || '—'}
                  </td>
                  {isFleetManager && (
                    <td className="p-4 text-right">
                      {log.status === 'Active' ? (
                        <button
                          onClick={() => handleCloseMaintenance(log._id)}
                          className="bg-green-500 hover:bg-green-600 text-[#0b132b] font-bold px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all hover:scale-105 inline-flex"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Close Maint</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-green-400 font-bold uppercase flex items-center gap-1 pr-3 inline-flex">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isFleetManager ? 7 : 6} className="p-8 text-center text-[#9ca3af]">No maintenance logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Maintenance;
