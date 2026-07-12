import React, { useState, useEffect } from 'react';
import { Plus, Truck, ShieldAlert, ShieldCheck } from 'lucide-react';

const Vehicles = ({ apiFetch }) => {
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
      </div>

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
                <strong className="text-white">₹{v.acquisitionCost.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        ))}

        {vehicles.length === 0 && (
          <div className="col-span-4 py-16 text-center text-[#9ca3af] bg-[#1c2541]/40 border border-[#3a506b]/20 rounded-2xl">
            No vehicles registered. Click "Register Vehicle" to add your first one!
          </div>
        )}
      </div>

    </div>
  );
};

export default Vehicles;
