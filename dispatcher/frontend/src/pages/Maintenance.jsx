import React, { useState, useEffect } from 'react';
import { Plus, Wrench, ShieldAlert, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

const Maintenance = ({ apiFetch }) => {
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
  const [status, setStatus] = useState('Active'); // Defaults to Active (starts immediately)

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
        setSuccess(`Maintenance logged! Vehicle status has been updated to ${status === 'Active' ? 'In Shop' : 'Available (Scheduled)'}.`);
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
    if (!confirm('Are you sure this maintenance is complete and the vehicle is ready for operations?')) return;
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

  // Only show Available and On Trip vehicles for new maintenance (exclude Retired and those already In Shop)
  const availableVehiclesForMaint = vehicles.filter(v => v.status !== 'Retired' && v.status !== 'In Shop');

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Maintenance Log</h2>
          <p className="text-xs text-[#9ca3af]">Track scheduled checkups, active garage repairs, and vehicle uptime.</p>
        </div>
      </div>

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
              <th className="p-4 font-bold">Notes</th>
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-[#9ca3af]">No maintenance logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Maintenance;
