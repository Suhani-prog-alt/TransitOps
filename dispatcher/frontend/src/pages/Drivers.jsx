import React, { useState, useEffect, useContext } from 'react';
import { Plus, Users, ShieldAlert, ShieldCheck, Calendar } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Drivers = ({ apiFetch }) => {
  const { user } = useContext(AuthContext);
  const isAuthorizedToEdit = user?.role === 'Fleet Manager' || user?.role === 'Safety Officer';

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState(100);
  const [status, setStatus] = useState('Available');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/drivers');
      const data = await res.json();
      if (data.success) {
        setDrivers(data.data);
      }
    } catch (err) {
      console.error('Error fetching drivers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [apiFetch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await apiFetch('/api/drivers', {
        method: 'POST',
        body: JSON.stringify({
          name,
          licenseNumber: licenseNumber.trim(),
          licenseCategory,
          licenseExpiryDate,
          contactNumber,
          safetyScore: parseInt(safetyScore),
          status
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(`Driver ${name} registered successfully!`);
        setShowAddForm(false);
        // Reset
        setName('');
        setLicenseNumber('');
        setLicenseCategory('');
        setLicenseExpiryDate('');
        setContactNumber('');
        setSafetyScore(100);
        setStatus('Available');
        fetchDrivers();
      } else {
        setError(data.message || 'Failed to register driver');
      }
    } catch (err) {
      setError(err.message || 'Error processing request');
    }
  };

  const getLicenseBadge = (expiryDate) => {
    const today = new Date();
    const exp = new Date(expiryDate);
    const diff = exp - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold">Expired</span>;
    } else if (days <= 30) {
      return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold">Expires in {days}d</span>;
    } else {
      return <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold">Active</span>;
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
          <h2 className="text-xl font-bold text-white">Drivers Directory</h2>
          <p className="text-xs text-[#9ca3af]">Manage compliance profiles, license expiries, and safety scores.</p>
        </div>
        
        {/* Conditional Register Button */}
        {isAuthorizedToEdit && (
          <button
            onClick={() => {
              setError('');
              setShowAddForm(!showAddForm);
            }}
            className="bg-[#5bc0be] text-[#0b132b] font-bold px-4 py-2.5 rounded-xl hover:bg-[#48a9a7] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#5bc0be]/10"
          >
            <Plus className="h-5 w-5" />
            <span>Register Driver</span>
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-200 text-sm p-4 rounded-xl flex items-center gap-2 animate-fade-in">
          <ShieldCheck className="h-5 w-5 text-green-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Conditional Add Form */}
      {isAuthorizedToEdit && showAddForm && (
        <div className="bg-[#1c2541]/80 border border-[#3a506b] rounded-2xl p-6 shadow-xl animate-fade-in">
          <h3 className="font-bold text-white uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-[#5bc0be]" />
            <span>Register Driver details</span>
          </h3>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs p-3.5 rounded-xl flex items-start gap-2 mb-4 animate-fade-in">
              <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Driver Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. DL-192837"
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">License Category</label>
              <input
                type="text"
                value={licenseCategory}
                onChange={(e) => setLicenseCategory(e.target.value)}
                placeholder="e.g. Class A Commercial"
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">License Expiry Date</label>
              <input
                type="date"
                value={licenseExpiryDate}
                onChange={(e) => setLicenseExpiryDate(e.target.value)}
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Contact Number</label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. +1 555-0199"
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Safety Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={safetyScore}
                onChange={(e) => setSafetyScore(e.target.value)}
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Starting Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be]"
              >
                <option value="Available">Available</option>
                <option value="Off Duty">Off Duty</option>
                <option value="Suspended">Suspended</option>
              </select>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((d) => (
          <div key={d._id} className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between hover:scale-[1.01] transition-all">
            
            {/* Header info */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  d.status === 'Available' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  d.status === 'On Trip' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  d.status === 'Suspended' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  {d.status}
                </span>
                {getLicenseBadge(d.licenseExpiryDate)}
              </div>
              <h4 className="text-sm font-bold text-white">{d.name}</h4>
              <p className="text-xs text-[#9ca3af] mt-0.5">{d.licenseCategory}</p>
            </div>

            {/* Content Details */}
            <div className="border-t border-[#3a506b]/30 mt-4 pt-3 space-y-1.5 text-xs text-[#9ca3af]">
              <div className="flex justify-between">
                <span>License Number:</span>
                <strong className="text-white font-mono">{d.licenseNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Contact Number:</span>
                <strong className="text-white">{d.contactNumber}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Safety Score:</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 bg-[#0b132b] h-1.5 rounded-full overflow-hidden border border-[#3a506b]/20">
                    <div 
                      className={`h-full rounded-full ${d.safetyScore >= 85 ? 'bg-green-400' : d.safetyScore >= 70 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${d.safetyScore}%` }}
                    ></div>
                  </div>
                  <strong className="text-white">{d.safetyScore}/100</strong>
                </div>
              </div>
              <div className="flex justify-between">
                <span>License Expiry:</span>
                <strong className="text-white flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[#5bc0be]" />
                  {new Date(d.licenseExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </strong>
              </div>
            </div>

          </div>
        ))}

        {drivers.length === 0 && (
          <div className="col-span-3 py-16 text-center text-[#9ca3af] bg-[#1c2541]/40 border border-[#3a506b]/20 rounded-2xl">
            No drivers registered.
          </div>
        )}
      </div>

    </div>
  );
};

export default Drivers;
