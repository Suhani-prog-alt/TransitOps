import React, { useState, useEffect, useContext } from 'react';
import { 
  Plus, Route, ShieldCheck, ShieldAlert, ArrowRight, Eye, Play, CheckCircle2, XCircle, AlertTriangle 
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Trips = ({ apiFetch }) => {
  const { user } = useContext(AuthContext);
  const isDispatcher = user?.role === 'Dispatcher';

  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [revenue, setRevenue] = useState('');
  
  // Validation / Error States
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Complete Trip Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activeCompleteTrip, setActiveCompleteTrip] = useState(null);
  const [finalOdometer, setFinalOdometer] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');
  const [fuelCost, setFuelCost] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        apiFetch('/api/trips'),
        apiFetch('/api/vehicles'),
        apiFetch('/api/drivers')
      ]);

      const tripsData = await tripsRes.json();
      const vehiclesData = await vehiclesRes.json();
      const driversData = await driversRes.json();

      if (tripsData.success) setTrips(tripsData.data);
      if (vehiclesData.success) setVehicles(vehiclesData.data);
      if (driversData.success) setDrivers(driversData.data);
    } catch (err) {
      console.error('Error fetching workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiFetch]);

  // Filter available vehicles and drivers for the assignment dropdowns
  const availableVehiclesForDispatch = vehicles.filter(v => v.status === 'Available');
  
  const availableDriversForDispatch = drivers.filter(d => {
    const isAvailable = d.status === 'Available';
    const isNotSuspended = d.status !== 'Suspended';
    const isNotExpired = new Date(d.licenseExpiryDate) >= new Date();
    return isAvailable && isNotSuspended && isNotExpired;
  });

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    // Double validate cargo weight against vehicle capacity
    const selectedVehicle = vehicles.find(v => v._id === vehicleId);
    if (!selectedVehicle) {
      setFormError('Please select a valid vehicle');
      return;
    }

    if (parseFloat(cargoWeight) > selectedVehicle.maxCapacity) {
      setFormError(`Cargo weight (${cargoWeight} kg) exceeds vehicle max load capacity (${selectedVehicle.maxCapacity} kg)`);
      return;
    }

    try {
      const res = await apiFetch('/api/trips', {
        method: 'POST',
        body: JSON.stringify({
          source,
          destination,
          vehicleId,
          driverId,
          cargoWeight: parseFloat(cargoWeight),
          plannedDistance: parseFloat(plannedDistance),
          revenue: revenue ? parseFloat(revenue) : parseFloat(plannedDistance) * 20
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Trip created successfully as DRAFT!');
        setShowCreateModal(false);
        // Reset Form
        setSource('');
        setDestination('');
        setVehicleId('');
        setDriverId('');
        setCargoWeight('');
        setPlannedDistance('');
        setRevenue('');
        loadData(); // reload
      } else {
        setFormError(data.message || 'Failed to create trip');
      }
    } catch (err) {
      setFormError(err.message || 'Error processing request');
    }
  };

  const handleDispatch = async (tripId) => {
    if (!confirm('Are you sure you want to dispatch this trip?')) return;
    try {
      const res = await apiFetch(`/api/trips/${tripId}/dispatch`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Trip successfully Dispatched! Vehicle and Driver status set to On Trip.');
        loadData();
      } else {
        alert(data.message || 'Failed to dispatch trip');
      }
    } catch (err) {
      alert(err.message || 'Error dispatching trip');
    }
  };

  const handleCancel = async (tripId) => {
    if (!confirm('Are you sure you want to cancel this trip?')) return;
    try {
      const res = await apiFetch(`/api/trips/${tripId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Trip successfully Cancelled! Assets reverted to Available.');
        loadData();
      } else {
        alert(data.message || 'Failed to cancel trip');
      }
    } catch (err) {
      alert(err.message || 'Error cancelling trip');
    }
  };

  const openCompleteModal = (trip) => {
    setActiveCompleteTrip(trip);
    // Autofill suggestions
    const estOdometer = (trip.vehicle?.odometer || 0) + trip.plannedDistance;
    setFinalOdometer(estOdometer);
    setFuelConsumed(Math.round(trip.plannedDistance / 7)); // rough estimate: 7km per liter
    setFuelCost('');
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const startOdom = activeCompleteTrip.vehicle?.odometer || 0;
    if (parseFloat(finalOdometer) <= startOdom) {
      setFormError(`Final odometer (${finalOdometer} km) must exceed start odometer (${startOdom} km)`);
      return;
    }

    try {
      const res = await apiFetch(`/api/trips/${activeCompleteTrip._id}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          finalOdometer: parseFloat(finalOdometer),
          fuelConsumed: parseFloat(fuelConsumed),
          fuelCost: fuelCost ? parseFloat(fuelCost) : parseFloat(fuelConsumed) * 100
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Trip completed! Vehicle and Driver returned to Available. Fuel and Expense logged.');
        setShowCompleteModal(false);
        setActiveCompleteTrip(null);
        loadData();
      } else {
        setFormError(data.message || 'Failed to complete trip');
      }
    } catch (err) {
      setFormError(err.message || 'Error completing trip');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5bc0be]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      
      {/* Header and Add Action */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Dispatcher Workspace</h2>
          <p className="text-xs text-[#9ca3af]">Plan, dispatch, complete, or cancel transport operations.</p>
        </div>
        {isDispatcher && (
          <button
            onClick={() => {
              setFormError('');
              setShowCreateModal(true);
            }}
            className="bg-[#5bc0be] text-[#0b132b] font-bold px-4 py-2.5 rounded-xl hover:bg-[#48a9a7] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#5bc0be]/10"
          >
            <Plus className="h-5 w-5" />
            <span>Create Trip Request</span>
          </button>
        )}
      </div>

      {/* Global Toast Message */}
      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-200 text-sm p-4 rounded-xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-xs font-bold text-[#9ca3af] hover:text-white uppercase pl-4 cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Create Trip Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b132b]/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c2541] border border-[#3a506b] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-[#3a506b] bg-[#0b132b]/50 flex justify-between items-center">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Route className="h-5 w-5 text-[#5bc0be]" />
                <span>Create New Trip Request</span>
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-[#9ca3af] hover:text-white font-bold cursor-pointer text-sm"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="p-6 space-y-5">
              
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs p-3.5 rounded-xl flex items-start gap-2">
                  <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Source Location</label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                    placeholder="e.g. Delhi Depot"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Destination Location</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                    placeholder="e.g. Jaipur Branch"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                    placeholder="e.g. 450"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Planned Distance (km)</label>
                  <input
                    type="number"
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(e.target.value)}
                    className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                    placeholder="e.g. 270"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Assign Vehicle (Available Only)</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                    required
                  >
                    <option value="">-- Select Vehicle --</option>
                    {availableVehiclesForDispatch.map(v => (
                      <option key={v._id} value={v._id}>
                        {v.registrationNumber} - {v.name} (Max Cap: {v.maxCapacity} kg)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Assign Driver (Compliant & Available)</label>
                  <select
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                    required
                  >
                    <option value="">-- Select Driver --</option>
                    {availableDriversForDispatch.map(d => (
                      <option key={d._id} value={d._id}>
                        {d.name} (Score: {d.safetyScore}/100)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Estimated Revenue (₹, Optional)</label>
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                  placeholder="Leave blank for automatic estimation"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#3a506b]/40">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-[#0b132b] text-white border border-[#3a506b] px-4 py-2.5 rounded-xl hover:bg-[#3a506b]/30 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5bc0be] text-[#0b132b] font-bold px-6 py-2.5 rounded-xl hover:bg-[#48a9a7] cursor-pointer"
                >
                  Create Draft
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Complete Trip Request Modal */}
      {showCompleteModal && activeCompleteTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b132b]/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c2541] border border-[#3a506b] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-[#3a506b] bg-[#0b132b]/50 flex justify-between items-center">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span>Complete Trip</span>
              </h3>
              <button 
                onClick={() => {
                  setShowCompleteModal(false);
                  setActiveCompleteTrip(null);
                }}
                className="text-[#9ca3af] hover:text-white font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="p-6 space-y-5">
              
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs p-3.5 rounded-xl flex items-start gap-2">
                  <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="bg-[#0b132b]/50 p-4 border border-[#3a506b]/40 rounded-xl space-y-1 text-xs">
                <p className="text-[#9ca3af]">Vehicle: <strong className="text-white">{activeCompleteTrip.vehicle?.registrationNumber} ({activeCompleteTrip.vehicle?.name})</strong></p>
                <p className="text-[#9ca3af]">Starting Odometer: <strong className="text-white">{activeCompleteTrip.vehicle?.odometer || 0} km</strong></p>
                <p className="text-[#9ca3af]">Route: <strong className="text-white">{activeCompleteTrip.source} → {activeCompleteTrip.destination} ({activeCompleteTrip.plannedDistance} km)</strong></p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Final Odometer Reading (km)</label>
                <input
                  type="number"
                  value={finalOdometer}
                  onChange={(e) => setFinalOdometer(e.target.value)}
                  className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Fuel Consumed (Liters)</label>
                <input
                  type="number"
                  value={fuelConsumed}
                  onChange={(e) => setFuelConsumed(e.target.value)}
                  className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Fuel Cost (₹, Optional)</label>
                <input
                  type="number"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                  placeholder="Defaults to liters * ₹100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#3a506b]/40">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompleteModal(false);
                    setActiveCompleteTrip(null);
                  }}
                  className="bg-[#0b132b] text-white border border-[#3a506b] px-4 py-2.5 rounded-xl hover:bg-[#3a506b]/30 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-[#0b132b] font-bold px-6 py-2.5 rounded-xl hover:bg-green-600 cursor-pointer"
                >
                  Submit & Complete
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Trips Registry Table View */}
      <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-[#3a506b]/40 bg-[#0b132b]/30 text-[#9ca3af] text-[10px] uppercase font-bold tracking-wider">
              <th className="p-4">Trip ID</th>
              <th className="p-4">Route</th>
              <th className="p-4">Vehicle Details</th>
              <th className="p-4">Driver Details</th>
              <th className="p-4">Payload & Distance</th>
              <th className="p-4">Status</th>
              {isDispatcher && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-[#3a506b]/20">
            {trips.length > 0 ? (
              trips.map((t) => (
                <tr key={t._id} className="hover:bg-[#0b132b]/20 transition-all">
                  <td className="p-4 font-mono text-[11px] text-white font-bold">TRP-{t._id.slice(-6).toUpperCase()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <span>{t.source}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#5bc0be]" />
                      <span>{t.destination}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-white font-medium">{t.vehicle?.registrationNumber || 'N/A'}</p>
                    <p className="text-[10px] text-[#9ca3af]">{t.vehicle?.name || 'Unknown'}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-white font-medium">{t.driver?.name || 'N/A'}</p>
                    <p className="text-[10px] text-[#9ca3af]">{t.driver?.contactNumber || 'No Contact'}</p>
                  </td>
                  <td className="p-4 text-[#9ca3af]">
                    <p className="font-semibold text-white">{t.cargoWeight} kg</p>
                    <p className="text-[10px]">{t.plannedDistance} km</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      t.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      t.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  {isDispatcher && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2.5">
                        
                        {/* Dispatch Trigger */}
                        {t.status === 'Draft' && (
                          <button
                            onClick={() => handleDispatch(t._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                            title="Dispatch Vehicle and Driver"
                          >
                            <Play className="h-3.5 w-3.5 fill-white" />
                            <span>Dispatch</span>
                          </button>
                        )}

                        {/* Complete Trigger */}
                        {t.status === 'Dispatched' && (
                          <button
                            onClick={() => openCompleteModal(t)}
                            className="bg-green-500 hover:bg-green-600 text-[#0b132b] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                            title="Record Completion and Return Assets"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Complete</span>
                          </button>
                        )}

                        {/* Cancel Action */}
                        {(t.status === 'Draft' || t.status === 'Dispatched') && (
                          <button
                            onClick={() => handleCancel(t._id)}
                            className="bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all"
                            title="Cancel Trip"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}

                        {/* View details / Finished indicator */}
                        {t.status === 'Completed' && (
                          <span className="text-[10px] text-green-400 font-bold uppercase flex items-center gap-1 pr-3">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Finished
                          </span>
                        )}
                        
                        {t.status === 'Cancelled' && (
                          <span className="text-[10px] text-red-400 font-semibold uppercase flex items-center gap-1 pr-3">
                            <XCircle className="h-3.5 w-3.5" /> Cancelled
                          </span>
                        )}

                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-[#9ca3af]">No trips found in database. Click "Create Trip Request" to add one!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Trips;
