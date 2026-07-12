import React, { useState, useEffect } from 'react';
import { Bell, Calendar, MapPin, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

const Navbar = ({ title, apiFetch }) => {
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedDateRange, setSelectedDateRange] = useState('12 May 2025 - 18 May 2025');

  useEffect(() => {
    const loadComplianceAlerts = async () => {
      try {
        // Fetch drivers & trips to dynamically calculate compliance warnings
        const [driversRes, tripsRes, maintenanceRes] = await Promise.all([
          apiFetch('/api/drivers'),
          apiFetch('/api/trips'),
          apiFetch('/api/maintenance')
        ]);
        const driversData = await driversRes.json();
        const tripsData = await tripsRes.json();
        const maintenanceData = await maintenanceRes.json();

        const activeAlerts = [];
        const today = new Date();

        // 1. License Expiry Alerts
        if (driversData.success) {
          driversData.data.forEach(d => {
            const expDate = new Date(d.licenseExpiryDate);
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 0) {
              activeAlerts.push({
                id: `exp-${d._id}`,
                type: 'danger',
                text: `Driver ${d.name} has an EXPIRED license!`,
                time: 'Immediate Action Required'
              });
            } else if (diffDays <= 30) {
              activeAlerts.push({
                id: `exp-warn-${d._id}`,
                type: 'warning',
                text: `Driver ${d.name}'s license expires in ${diffDays} days.`,
                time: 'Urgent'
              });
            }
          });
        }

        // 2. Pending Trips Alert (> 24 hours)
        if (tripsData.success) {
          tripsData.data.forEach(t => {
            if (t.status === 'Draft') {
              const createdDate = new Date(t.createdAt);
              const diffHours = (today - createdDate) / (1000 * 60 * 60);
              if (diffHours >= 24) {
                activeAlerts.push({
                  id: `trip-warn-${t._id}`,
                  type: 'info',
                  text: `Trip to ${t.destination} has been pending for over 24 hours.`,
                  time: 'Pending'
                });
              }
            }
          });
        }

        // 3. Maintenance due Alert
        if (maintenanceData.success) {
          maintenanceData.data.forEach(m => {
            if (m.status === 'Scheduled') {
              const schedDate = new Date(m.scheduledDate);
              if (schedDate <= today) {
                activeAlerts.push({
                  id: `maint-due-${m._id}`,
                  type: 'warning',
                  text: `Vehicle ${m.vehicle?.registrationNumber || 'Unknown'} is due for maintenance.`,
                  time: 'Overdue'
                });
              }
            }
          });
        }

        setAlerts(activeAlerts);
      } catch (err) {
        console.error('Error fetching alerts', err);
      }
    };

    loadComplianceAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(loadComplianceAlerts, 30000);
    return () => clearInterval(interval);
  }, [apiFetch]);

  return (
    <header className="h-16 bg-[#0e1731] border-b border-[#1c2541] flex items-center justify-between px-8 relative z-20">
      
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-bold text-white tracking-wide uppercase">{title}</h1>
      </div>

      {/* Control Actions & Notifications */}
      <div className="flex items-center gap-6">
        
        {/* Region Selector */}
        <div className="flex items-center gap-2 bg-[#1c2541]/80 border border-[#3a506b] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#9ca3af]">
          <MapPin className="h-4 w-4 text-[#5bc0be]" />
          <select 
            value={selectedRegion} 
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-white cursor-pointer pr-1"
          >
            <option value="All Regions" className="bg-[#1c2541]">All Regions</option>
            <option value="North" className="bg-[#1c2541]">North Region</option>
            <option value="South" className="bg-[#1c2541]">South Region</option>
            <option value="East" className="bg-[#1c2541]">East Region</option>
            <option value="West" className="bg-[#1c2541]">West Region</option>
          </select>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#1c2541]/80 border border-[#3a506b] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#9ca3af]">
          <Calendar className="h-4 w-4 text-[#5bc0be]" />
          <input 
            type="text" 
            value={selectedDateRange} 
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-white w-48 font-medium text-center"
          />
        </div>

        {/* Notification Bell with Badge */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="h-10 w-10 bg-[#1c2541]/80 border border-[#3a506b] rounded-xl flex items-center justify-center text-[#9ca3af] hover:text-white transition-all hover:scale-105 cursor-pointer relative"
          >
            <Bell className="h-5 w-5" />
            {alerts.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-bold text-[10px] h-5 w-5 rounded-full flex items-center justify-center animate-pulse border border-[#0b132b]">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#1c2541] border border-[#3a506b] rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
              <div className="p-4 border-b border-[#3a506b] bg-[#0b132b]/50 flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Alerts & Compliance ({alerts.length})</span>
                {alerts.length === 0 && <span className="text-[10px] text-green-400 font-semibold flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Fleet Compliant</span>}
              </div>
              
              <div className="max-h-72 overflow-y-auto divide-y divide-[#3a506b]/40">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div key={alert.id} className="p-4 flex gap-3 hover:bg-[#0b132b]/30 transition-all">
                      <div className="shrink-0 mt-0.5">
                        {alert.type === 'danger' ? (
                          <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
                        ) : alert.type === 'warning' ? (
                          <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                        ) : (
                          <Clock className="h-4.5 w-4.5 text-cyan-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-normal font-medium ${alert.type === 'danger' ? 'text-red-200' : alert.type === 'warning' ? 'text-amber-200' : 'text-slate-200'}`}>
                          {alert.text}
                        </p>
                        <span className="text-[9px] text-[#9ca3af] font-semibold uppercase tracking-wider block mt-1">{alert.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-[#9ca3af]">
                    No compliance warnings or critical notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};

export default Navbar;
