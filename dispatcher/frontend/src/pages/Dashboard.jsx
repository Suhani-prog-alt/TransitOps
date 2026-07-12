import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Truck, Users, Route, Wrench, AlertTriangle, ArrowUpRight, ArrowDownRight, Wallet, ShieldAlert 
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']; // Green, Blue, Amber, Red for Completed, Active, Pending, Cancelled

const Dashboard = ({ apiFetch }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [upcomingMaint, setUpcomingMaint] = useState([]);
  const [alertLogs, setAlertLogs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, tripsRes, maintRes, driversRes] = await Promise.all([
          apiFetch('/api/dashboard'),
          apiFetch('/api/trips'),
          apiFetch('/api/maintenance'),
          apiFetch('/api/drivers')
        ]);

        const dashData = await dashRes.json();
        const tripsData = await tripsRes.json();
        const maintData = await maintRes.json();
        const driversData = await driversRes.json();

        if (dashData.success) {
          setStats(dashData);
        }

        if (tripsData.success) {
          // Take first 5 recent trips
          setRecentTrips(tripsData.data.slice(0, 5));
        }

        if (maintData.success) {
          // Take first 5 scheduled maintenance logs
          setUpcomingMaint(
            maintData.data.filter(m => m.status === 'Scheduled').slice(0, 5)
          );
        }

        // Calculate a few dynamic compliance warnings for the alerts section
        const warnings = [];
        const today = new Date();

        if (driversData.success) {
          driversData.data.forEach(d => {
            const expDate = new Date(d.licenseExpiryDate);
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 0) {
              warnings.push({ id: d._id, text: `License expired for driver ${d.name}!`, type: 'danger', time: 'Immediate' });
            } else if (diffDays <= 15) {
              warnings.push({ id: d._id, text: `Driver license for ${d.name} expires in ${diffDays} days.`, type: 'warning', time: 'Urgent' });
            }
          });
        }

        if (maintData.success) {
          maintData.data.forEach(m => {
            if (m.status === 'Active') {
              warnings.push({ id: m._id, text: `Vehicle ${m.vehicle?.registrationNumber || 'Unknown'} is currently in active maintenance.`, type: 'info', time: 'Ongoing' });
            }
          });
        }

        if (tripsData.success) {
          tripsData.data.forEach(t => {
            if (t.status === 'Draft') {
              const createdDate = new Date(t.createdAt);
              const diffHours = (today - createdDate) / (1000 * 60 * 60);
              if (diffHours >= 24) {
                warnings.push({ id: t._id, text: `Trip to ${t.destination} has been pending for over 24 hours.`, type: 'info', time: 'Pending' });
              }
            }
          });
        }

        setAlertLogs(warnings.slice(0, 3));

      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [apiFetch]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5bc0be]"></div>
      </div>
    );
  }

  // Format currency in Indian Rupees format (as requested in mockup)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Mock Utilization Trend data (Matching Mockup date range)
  const utilizationTrend = [
    { date: '12 May', utilization: 62 },
    { date: '13 May', utilization: 68 },
    { date: '14 May', utilization: 72 },
    { date: '15 May', utilization: 75 },
    { date: '16 May', utilization: 78 },
    { date: '17 May', utilization: 76 },
    { date: '18 May', utilization: 76 }
  ];

  // Pie Chart Data mapping
  const pieData = [
    { name: 'Completed', value: stats.tripsOverview.completed || 0 },
    { name: 'Active', value: stats.tripsOverview.active || 0 },
    { name: 'Pending', value: stats.tripsOverview.pending || 0 },
    { name: 'Cancelled', value: stats.tripsOverview.cancelled || 0 }
  ].filter(d => d.value > 0);

  // Default fallback if no data
  const chartData = pieData.length > 0 ? pieData : [
    { name: 'No Trips Yet', value: 1 }
  ];

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      
      {/* 1. KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-5">
        
        {/* KPI 1 */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">Active Vehicles</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{stats.kpis.activeVehicles}</h3>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[10px] text-green-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> 8% vs LW
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Truck className="h-4.5 w-4.5 text-blue-400" />
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">Available Vehicles</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{stats.kpis.availableVehicles}</h3>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[10px] text-green-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> 5% vs LW
            </span>
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Truck className="h-4.5 w-4.5 text-green-400" />
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">In Maintenance</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{stats.kpis.maintenanceVehicles}</h3>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[10px] text-red-400 font-semibold flex items-center gap-0.5">
              <ArrowDownRight className="h-3 w-3" /> 2% vs LW
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Wrench className="h-4.5 w-4.5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">Active Trips</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{stats.kpis.activeTrips}</h3>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[10px] text-green-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> 12% vs LW
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Route className="h-4.5 w-4.5 text-indigo-400" />
            </div>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">Pending Trips</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{stats.kpis.pendingTrips}</h3>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[10px] text-green-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> 3% vs LW
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Route className="h-4.5 w-4.5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">Drivers On Duty</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{stats.kpis.driversOnDuty}</h3>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[10px] text-green-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> 6% vs LW
            </span>
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <Users className="h-4.5 w-4.5 text-teal-400" />
            </div>
          </div>
        </div>

        {/* KPI 7 */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">Fleet Utilization</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{stats.kpis.fleetUtilization}%</h3>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[10px] text-green-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> 4% vs LW
            </span>
            <div className="h-10 w-10 flex items-center justify-center relative">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="rgba(58, 80, 107, 0.3)" strokeWidth="4" fill="transparent" />
                <circle cx="20" cy="20" r="16" stroke="#5bc0be" strokeWidth="4" fill="transparent"
                  strokeDasharray={100}
                  strokeDashoffset={100 - stats.kpis.fleetUtilization} />
              </svg>
              <span className="absolute text-[8px] font-bold">{stats.kpis.fleetUtilization}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fleet Utilization Recharts Trend */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-6 shadow-lg lg:col-span-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Fleet Utilization (%)</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5bc0be" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#5bc0be" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1c2541', borderColor: '#3a506b', color: '#fff', borderRadius: '10px' }} />
                <Area type="monotone" dataKey="utilization" stroke="#5bc0be" strokeWidth={2} fillOpacity={1} fill="url(#colorUtil)" name="Utilization" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trips Overview Recharts Donut */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-6 shadow-lg lg:col-span-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Trips Status Overview</h4>
          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1c2541', borderColor: '#3a506b', color: '#fff', borderRadius: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider">Total Trips</p>
              <p className="text-2xl font-bold text-white">{stats.tripsOverview.total}</p>
            </div>
          </div>
          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            {pieData.map((d, index) => (
              <div key={d.name} className="flex items-center gap-2 text-[#9ca3af]">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Cost Widget */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-6 shadow-lg lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Operational Cost Overview</h4>
              <Wallet className="h-5 w-5 text-[#5bc0be]" />
            </div>
            <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider">Total Operational Cost</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{formatCurrency(stats.costs.totalOperationalCost)}</h3>
            <span className="text-[10px] text-green-400 font-semibold flex items-center gap-0.5 mt-1.5">
              <ArrowUpRight className="h-3 w-3" /> 9% vs last week
            </span>
          </div>

          <div className="space-y-3.5 mt-6 border-t border-[#3a506b]/40 pt-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#9ca3af]">Fuel Cost</span>
              <span className="font-semibold text-white">{formatCurrency(stats.costs.fuelCost)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#9ca3af]">Maintenance Cost</span>
              <span className="font-semibold text-white">{formatCurrency(stats.costs.maintenanceCost)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#9ca3af]">Other Expenses</span>
              <span className="font-semibold text-white">{formatCurrency(stats.costs.otherCost)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Tables & Compliance Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Recent Trips Table */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-6 shadow-lg xl:col-span-2 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Recent Trips Monitor</h4>
          </div>
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-[#3a506b]/40 text-[#9ca3af] text-[10px] uppercase font-bold tracking-wider">
                <th className="pb-3">Trip</th>
                <th className="pb-3">Route</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Driver</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Cargo</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#3a506b]/20">
              {recentTrips.length > 0 ? (
                recentTrips.map((t) => (
                  <tr key={t._id} className="hover:bg-[#0b132b]/20 transition-all">
                    <td className="py-3.5 font-mono text-white text-[11px]">TRP-{t._id.slice(-4).toUpperCase()}</td>
                    <td className="py-3.5 text-white font-medium">{t.source} → {t.destination}</td>
                    <td className="py-3.5 text-[#9ca3af]">{t.vehicle?.registrationNumber || 'N/A'}</td>
                    <td className="py-3.5 text-[#9ca3af]">{t.driver?.name || 'N/A'}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        t.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        t.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-[#9ca3af] font-semibold">{t.cargoWeight} kg</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-[#9ca3af]">No trips logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Compliance Alerts & Notifications */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-6 shadow-lg xl:col-span-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>Alerts & Notifications</span>
            {alertLogs.length > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {alertLogs.length}
              </span>
            )}
          </h4>
          
          <div className="space-y-4">
            {alertLogs.length > 0 ? (
              alertLogs.map((log, idx) => (
                <div key={log.id || idx} className="p-3.5 bg-[#0b132b]/40 border border-[#3a506b]/30 rounded-xl flex items-start gap-3 transition-all hover:bg-[#0b132b]/60">
                  <ShieldAlert className={`h-5 w-5 shrink-0 mt-0.5 ${log.type === 'danger' ? 'text-red-500' : log.type === 'warning' ? 'text-amber-500' : 'text-blue-400'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white leading-normal">{log.text}</p>
                    <span className="text-[9px] font-bold text-[#9ca3af] uppercase tracking-wider block mt-1">{log.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-[#9ca3af]">
                All systems compliant. No critical alerts.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Bottom Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Maintenance Table */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-6 shadow-lg lg:col-span-2 overflow-x-auto">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Upcoming Maintenance Schedules</h4>
          <table className="w-full text-left border-collapse min-w-[450px]">
            <thead>
              <tr className="border-b border-[#3a506b]/40 text-[#9ca3af] text-[10px] uppercase font-bold tracking-wider">
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Service Type</th>
                <th className="pb-3">Scheduled Date</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#3a506b]/20">
              {upcomingMaint.length > 0 ? (
                upcomingMaint.map((m) => (
                  <tr key={m._id} className="hover:bg-[#0b132b]/20 transition-all">
                    <td className="py-3.5 text-white font-semibold flex items-center gap-2">
                      <Wrench className="h-3.5 w-3.5 text-amber-500" />
                      <span>{m.vehicle?.registrationNumber || 'N/A'}</span>
                    </td>
                    <td className="py-3.5 text-white font-medium">{m.serviceType}</td>
                    <td className="py-3.5 text-[#9ca3af] font-semibold">
                      {new Date(m.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-[#9ca3af]">No scheduled maintenance found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic ROI Widget */}
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-6 shadow-lg lg:col-span-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Top Vehicles by ROI</h4>
          <div className="space-y-4">
            {stats.topVehiclesByRoi.map((item, idx) => (
              <div key={item.id} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">{idx+1}. {item.registrationNumber} ({item.name})</span>
                  <span className="text-[#5bc0be]">{item.roi}%</span>
                </div>
                <div className="w-full bg-[#0b132b] h-2 rounded-full overflow-hidden border border-[#3a506b]/30">
                  <div 
                    className="bg-[#5bc0be] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(Math.max(item.roi, 0), 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {stats.topVehiclesByRoi.length === 0 && (
              <div className="py-12 text-center text-xs text-[#9ca3af]">
                No ROI data calculated. Seed completed trips first.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
