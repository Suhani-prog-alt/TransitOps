import React, { useEffect, useState } from 'react';
import API from '../api';
import { useFilters } from '../context/FilterContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MaintenancePriorityBadge } from '../components/ui/Badge';
import {
  Play,
  CheckCircle,
  XCircle,
  Plus,
  Calendar,
  DollarSign,
  User
} from 'lucide-react';

export const Maintenance: React.FC = () => {
  const { region, refreshTrigger, triggerRefresh } = useFilters();

  const [logs, setLogs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab state: 'all' | 'Scheduled' | 'In Progress' | 'Completed'
  const [activeTab, setActiveTab] = useState<'Scheduled' | 'In Progress' | 'Completed'>('In Progress');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Add Maintenance form state
  const [targetVeh, setTargetVeh] = useState('');
  const [maintType, setMaintType] = useState('Oil Change');
  const [maintPriority, setMaintPriority] = useState('Medium');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintMechanic, setMaintMechanic] = useState('');
  const [maintCost, setMaintCost] = useState(12000);
  const [maintCompletion, setMaintCompletion] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Complete Maintenance form state
  const [actualCost, setActualCost] = useState(12000);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch maintenance logs
      const response = await API.get('/maintenance', {
        params: { status: activeTab }
      });
      setLogs(response.data.logs);

      // Fetch active vehicles for selection list
      const vehResponse = await API.get('/vehicles', { params: { limit: 100 } });
      setVehicles(vehResponse.data.vehicles.filter((v: any) => v.status !== 'Retired'));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, region, refreshTrigger]);

  // Create Maintenance
  const handleScheduleMaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetVeh) {
      alert('Please select a vehicle');
      return;
    }
    try {
      await API.post('/maintenance', {
        vehicle: targetVeh,
        type: maintType,
        priority: maintPriority,
        description: maintDesc,
        mechanic: maintMechanic,
        estimatedCost: maintCost,
        expectedCompletion: maintCompletion,
        status: 'Scheduled'
      });
      setIsAddOpen(false);
      resetAddForm();
      triggerRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating maintenance event');
    }
  };

  const resetAddForm = () => {
    setTargetVeh('');
    setMaintType('Oil Change');
    setMaintPriority('Medium');
    setMaintDesc('');
    setMaintMechanic('');
    setMaintCost(12000);
  };

  // Start Service (Scheduled -> In Progress)
  const handleStartService = async (logId: string) => {
    try {
      await API.put(`/maintenance/${logId}`, { status: 'In Progress' });
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Open complete service modal
  const handleOpenComplete = (log: any) => {
    setSelectedLog(log);
    setActualCost(log.estimatedCost);
    setIsCompleteOpen(true);
  };

  // Complete Service (In Progress -> Completed)
  const handleConfirmComplete = async () => {
    if (!selectedLog) return;
    try {
      await API.put(`/maintenance/${selectedLog._id}`, {
        status: 'Completed',
        actualCost,
        completionDate
      });
      setIsCompleteOpen(false);
      setSelectedLog(null);
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel Service
  const handleCancelService = async (logId: string) => {
    if (confirm('Are you sure you want to cancel this maintenance service?')) {
      try {
        await API.put(`/maintenance/${logId}`, { status: 'Cancelled' });
        triggerRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // KPIs

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Maintenance Module</h1>
          <p className="text-xs text-gray-400 mt-0.5">Track repairs, scheduling alerts, mechanic assignments and shop downtime.</p>
        </div>

        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} />
          <span>New Maintenance Task</span>
        </Button>
      </div>

      {/* Tabs selectors - matches visual inspiration */}
      <div className="flex border-b border-white/5 space-x-6 text-sm font-bold text-gray-400">
        {(['In Progress', 'Scheduled', 'Completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 focus:outline-none transition-all duration-200 border-b-2 px-1 ${
              activeTab === tab
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent hover:text-white'
            }`}
          >
            <span>{tab} Services</span>
          </button>
        ))}
      </div>

      {/* Main logs display list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-500 font-semibold bg-slate-950/20 border border-white/5 rounded-3xl">
            No maintenance records in {activeTab} status.
          </div>
        ) : (
          logs.map((log: any) => (
            <Card key={log._id} className="flex flex-col justify-between h-72">
              <div>
                <CardHeader className="mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{log.type}</h3>
                    <span className="text-[10px] text-gray-500 font-bold block mt-0.5">
                      Vehicle: {log.vehicle?.name || 'Unknown'} ({log.vehicle?.registrationNumber || 'N/A'})
                    </span>
                  </div>
                  <MaintenancePriorityBadge priority={log.priority} />
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <p className="text-gray-400 line-clamp-2 leading-relaxed">{log.description}</p>
                  
                  <div className="grid grid-cols-2 gap-y-2 pt-2 border-t border-white/5 font-semibold text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-gray-500" />
                      <span>{log.mechanic || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <DollarSign size={13} className="text-gray-500" />
                      <span className="text-white">
                        ₹
                        {activeTab === 'Completed'
                          ? log.actualCost.toLocaleString()
                          : log.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 mt-1">
                      <Calendar size={13} className="text-gray-500" />
                      <span>
                        {activeTab === 'Completed' ? 'Completed: ' : 'Expected: '}
                        {new Date(
                          activeTab === 'Completed' ? log.completionDate : log.expectedCompletion
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Actions footer */}
              <div className="flex justify-end gap-2 border-t border-white/5 pt-3 mt-4">
                {activeTab === 'Scheduled' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelService(log._id)}
                      className="border-red-500/20 hover:border-red-500/40 text-brand-red hover:bg-brand-red/5"
                    >
                      <XCircle size={13} />
                      <span>Cancel</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStartService(log._id)}
                      className="border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5"
                    >
                      <Play size={13} />
                      <span>Start Shop</span>
                    </Button>
                  </>
                )}

                {activeTab === 'In Progress' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelService(log._id)}
                      className="border-red-500/20 hover:border-red-500/40 text-brand-red hover:bg-brand-red/5"
                    >
                      <XCircle size={13} />
                      <span>Cancel</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenComplete(log)}
                    >
                      <CheckCircle size={13} />
                      <span>Complete Work</span>
                    </Button>
                  </>
                )}

                {activeTab === 'Completed' && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    <CheckCircle size={12} />
                    <span>Work Completed</span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Maintenance Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Schedule Maintenance Service">
        <form onSubmit={handleScheduleMaint} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1.5 font-medium">
            <label className="text-gray-400 font-semibold">Target Vehicle</label>
            <select
              value={targetVeh}
              onChange={(e) => setTargetVeh(e.target.value)}
              className="w-full glass-input bg-[#0D1321]"
            >
              <option value="">Select a Vehicle...</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name} ({v.registrationNumber}) - {v.status}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 font-medium col-span-2 sm:col-span-1">
              <label className="text-gray-400 font-semibold">Service Type</label>
              <select
                value={maintType}
                onChange={(e) => setMaintType(e.target.value)}
                className="w-full glass-input bg-[#0D1321]"
              >
                <option value="Brake Inspection">Brake Inspection</option>
                <option value="Oil Change">Oil Change</option>
                <option value="Tire Replacement">Tire Replacement</option>
                <option value="General Service">General Service</option>
                <option value="Engine Check">Engine Check</option>
              </select>
            </div>

            <div className="space-y-1.5 font-medium col-span-2 sm:col-span-1">
              <label className="text-gray-400 font-semibold">Priority Level</label>
              <select
                value={maintPriority}
                onChange={(e) => setMaintPriority(e.target.value)}
                className="w-full glass-input bg-[#0D1321]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400">Description of Service Tasks</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Engine temperature gauge fluctuation diagnostic test..."
              value={maintDesc}
              onChange={(e) => setMaintDesc(e.target.value)}
              className="w-full glass-input resize-none py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1 font-medium">
              <label className="text-gray-400 font-semibold">Mechanic Assignment</label>
              <input
                type="text"
                required
                placeholder="e.g. Rakesh Verma"
                value={maintMechanic}
                onChange={(e) => setMaintMechanic(e.target.value)}
                className="w-full glass-input"
              />
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1 font-medium">
              <label className="text-gray-400 font-semibold">Estimated Cost (₹)</label>
              <input
                type="number"
                required
                value={maintCost}
                onChange={(e) => setMaintCost(Number(e.target.value))}
                className="w-full glass-input"
              />
            </div>
          </div>

          <div className="space-y-1.5 font-medium">
            <label className="text-gray-400 font-semibold">Expected Completion Date</label>
            <input
              type="date"
              required
              value={maintCompletion}
              onChange={(e) => setMaintCompletion(e.target.value)}
              className="w-full glass-input"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Service
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complete Maintenance Modal */}
      <Modal isOpen={isCompleteOpen} onClose={() => setIsCompleteOpen(false)} title="Close Maintenance Service">
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-gray-400">
            Completing service event for <span className="text-white font-bold">{selectedLog?.vehicle?.name}</span>. Provide actual metrics below:
          </p>

          <div className="space-y-4 mt-4">
            <div className="space-y-1.5 font-medium">
              <label className="text-gray-400 font-semibold">Actual Cost (₹)</label>
              <input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(Number(e.target.value))}
                className="w-full glass-input"
              />
            </div>

            <div className="space-y-1.5 font-medium">
              <label className="text-gray-400 font-semibold">Completion Date</label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full glass-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsCompleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleConfirmComplete}>
              Confirm Closure
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
