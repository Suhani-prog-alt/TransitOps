import React, { useState, useEffect, useContext } from 'react';
import { Plus, Truck, ShieldAlert, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Vehicles = ({ apiFetch }) => {
  const { user } = useContext(AuthContext);
  const isFleetManager = user?.role === 'Fleet Manager';

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Van');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/vehicles');
      const data = await res.json();
      if (data.success) {
        setVehicles(data.data);
      }
    } catch (err) {
      console.error('Error fetching vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [apiFetch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await apiFetch('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          registrationNumber: registrationNumber.toUpperCase().trim(),
          name,
          type,
          maxCapacity: parseFloat(maxCapacity),
          odometer: parseFloat(odometer),
          acquisitionCost: parseFloat(acquisitionCost),
          status: 'Available'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(`Vehicle ${registrationNumber.toUpperCase()} added successfully!`);
        setShowAddForm(false);
        // Reset fields
        setRegistrationNumber('');
        setName('');
        setMaxCapacity('');
        setOdometer('');
        setAcquisitionCost('');
        fetchVehicles();
      } else {
        setError(data.message || 'Failed to add vehicle');
      }
    } catch (err) {
      setError(err.message || 'Error processing request');
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
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Vehicles Registry</h2>
          <p className="text-xs text-[#9ca3af]">Manage registrations, vehicle categories, and view fleet capacities.</p>
        </div>
        
        {/* Register Button */}
        <button
          onClick={() => {
            setError('');
            setShowAddForm(!showAddForm);
          }}
          className="bg-[#5bc0be] text-[#0b132b] font-bold px-4 py-2.5 rounded-xl hover:bg-[#48a9a7] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#5bc0be]/10"
        >
          <Plus className="h-5 w-5" />
          <span>Register Vehicle</span>
        </button>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-200 text-sm p-4 rounded-xl flex items-center gap-2 animate-fade-in">
          <ShieldCheck className="h-5 w-5 text-green-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-[#1c2541]/80 border border-[#3a506b] rounded-2xl p-6 shadow-xl animate-fade-in">
          <h3 className="font-bold text-white uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
            <Truck className="h-4.5 w-4.5 text-[#5bc0be]" />
            <span>Add Vehicle details</span>
          </h3>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs p-3.5 rounded-xl flex items-start gap-2 mb-4">
              <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Registration Number</label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. VAN-05"
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Name/Model</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ford Transit"
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
              >
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Max capacity (kg)</label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Starting Odometer (km)</label>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                placeholder="e.g. 10000"
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Acquisition Cost (₹)</label>
              <input
                type="number"
                value={acquisitionCost}
                onChange={(e) => setAcquisitionCost(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
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
                Register
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vehicles.map((v) => (
          <div key={v._id} className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between hover:scale-[1.01] transition-all">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-white text-xs font-bold bg-[#0b132b] px-2 py-0.5 rounded-lg border border-[#3a506b]/30">
                  {v.registrationNumber}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  v.status === 'Available' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  v.status === 'On Trip' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  v.status === 'In Shop' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {v.status === 'In Shop' ? 'In Shop (Maint)' : v.status}
                </span>
              </div>
              
              <h4 className="text-sm font-bold text-white">{v.name}</h4>
              <p className="text-xs text-[#9ca3af] mt-0.5">{v.type}</p>
            </div>

            <div className="border-t border-[#3a506b]/30 mt-4 pt-3 space-y-1.5 text-xs text-[#9ca3af]">
              <div className="flex justify-between">
                <span>Max Payload:</span>
                <strong className="text-white">{v.maxCapacity} kg</strong>
              </div>
              <div className="flex justify-between">
                <span>Odometer:</span>
                <strong className="text-white">{v.odometer} km</strong>
              </div>
              <div className="flex justify-between">
                <span>Cost Value:</span>
                <strong className="text-white">₹{(v.acquisitionCost || 0).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        ))}

        {vehicles.length === 0 && (
          <div className="col-span-4 py-16 text-center text-[#9ca3af] bg-[#1c2541]/40 border border-[#3a506b]/20 rounded-2xl">
            No vehicles registered.
          </div>
        )}
      </div>

    </div>
  );
};

export default Vehicles;
