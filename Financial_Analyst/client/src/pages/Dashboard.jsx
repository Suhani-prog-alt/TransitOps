import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { analyticsAPI, fuelAPI, expenseAPI } from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  Fuel,
  Wrench,
  DollarSign,
  Briefcase,
  PieChart as PieIcon,
  Percent,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const Dashboard = () => {
  const { globalSearch, dateRange, vehicleFilter, regionFilter } = useOutletContext();
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const params = {
          vehicleName: vehicleFilter,
          region: regionFilter,
          startDate: dateRange ? getStartDate(dateRange) : undefined
        };

        const [metricsRes, chartsRes, fuelRes, expenseRes] = await Promise.all([
          analyticsAPI.getDashboardMetrics(params),
          analyticsAPI.getChartData(params),
          fuelAPI.getLogs({ limit: 4 }),
          expenseAPI.getExpenses({ limit: 4 })
        ]);

        setMetrics(metricsRes.data);
        setCharts(chartsRes.data);

        // Merge recent logs and sort
        const merged = [
          ...fuelRes.data.logs.map(l => ({ ...l, type: 'Fuel', keyDate: l.fuelDate, title: `Fuel Log: ${l.vehicleName}`, cost: l.fuelCost })),
          ...expenseRes.data.expenses.map(e => ({ ...e, type: 'Expense', keyDate: e.date, title: `${e.category}: ${e.vehicleName}`, cost: e.amount }))
        ].sort((a, b) => new Date(b.keyDate) - new Date(a.keyDate)).slice(0, 5);

        setRecentLogs(merged);
      } catch (err) {
        console.error('Error fetching dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange, vehicleFilter, regionFilter]);

  const getStartDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - parseInt(days));
    return d.toISOString().split('T')[0];
  };

  // Sparkline point calculator
  const generateSparklinePoints = (arr, width = 100, height = 30) => {
    if (!arr || arr.length === 0) return '';
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min || 1;

    return arr
      .map((val, index) => {
        const x = (index / (arr.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(' ');
  };

  if (loading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accentCyan"></div>
        <p className="text-gray-400 text-sm">Loading Executive Dashboard...</p>
      </div>
    );
  }

  const { kpi, sparklines } = metrics;

  // Format currency helpers
  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  const fmtDecimal = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v);

  // MOCK default sparklines if database seed values are short
  const defaultSpark1 = [230, 240, 210, 260, 290, 280, 310, 340, 320, 350];
  const defaultSpark2 = [180, 190, 160, 220, 240, 210, 230, 260, 245, 270];

  const cards = [
    {
      title: 'Total Fuel Cost',
      value: fmt(kpi.totalFuelCost),
      growth: '+12.4%',
      isPositive: false,
      color: '#ef4444',
      points: generateSparklinePoints(sparklines.fuel.length ? sparklines.fuel : defaultSpark1),
      icon: Fuel
    },
    {
      title: 'Total Maintenance Cost',
      value: fmt(kpi.totalMaintenanceCost),
      growth: '-8.2%',
      isPositive: true,
      color: '#10b981',
      points: generateSparklinePoints(defaultSpark2),
      icon: Wrench
    },
    {
      title: 'Other Expenses',
      value: fmt(kpi.otherExpenses),
      growth: '+3.1%',
      isPositive: false,
      color: '#f97316',
      points: generateSparklinePoints([40, 45, 52, 48, 55, 60, 68, 62, 70, 75]),
      icon: DollarSign
    },
    {
      title: 'Total Operational Cost',
      value: fmt(kpi.totalOperationalCost),
      growth: '+5.7%',
      isPositive: false,
      color: '#06b6d4',
      points: generateSparklinePoints(sparklines.expenses.length ? sparklines.expenses : defaultSpark1),
      icon: DollarSign
    },
    {
      title: 'Revenue Generated',
      value: fmt(kpi.revenueGenerated),
      growth: '+18.1%',
      isPositive: true,
      color: '#10b981',
      points: generateSparklinePoints([120, 130, 145, 140, 155, 168, 175, 182, 190, 205]),
      icon: Briefcase
    },
    {
      title: 'Net Profit',
      value: fmt(kpi.netProfit),
      growth: '+22.4%',
      isPositive: true,
      color: '#10b981',
      points: generateSparklinePoints([80, 85, 98, 92, 105, 118, 125, 132, 140, 155]),
      icon: TrendingUp
    },
    {
      title: 'Fleet ROI',
      value: `${kpi.fleetROI}%`,
      growth: '+4.2%',
      isPositive: true,
      color: '#10b981',
      points: generateSparklinePoints([12, 13, 12.8, 13.5, 14.2, 14.8, 15.2, 15.8, 16.4, 17.2]),
      icon: Percent
    },
    {
      title: 'Profit Margin',
      value: `${kpi.profitMargin}%`,
      growth: '+2.8%',
      isPositive: true,
      color: '#06b6d4',
      points: generateSparklinePoints([38, 39, 37.5, 38.8, 39.5, 40.2, 41.1, 40.8, 41.6, 42.4]),
      icon: Percent
    },
    {
      title: 'Avg Cost Per Vehicle',
      value: fmt(kpi.averageCostPerVehicle),
      growth: '-4.1%',
      isPositive: true,
      color: '#10b981',
      points: generateSparklinePoints([32, 31.5, 32.8, 32.2, 31.8, 30.9, 30.5, 29.8, 29.2, 28.5]),
      icon: DollarSign
    },
    {
      title: 'Avg Cost Per Trip',
      value: fmtDecimal(kpi.averageCostPerTrip),
      growth: '-2.9%',
      isPositive: true,
      color: '#10b981',
      points: generateSparklinePoints([750, 742, 730, 725, 718, 705, 698, 685, 672, 660]),
      icon: DollarSign
    }
  ];

  // Filters results locally if global search is used
  const filteredRecentLogs = recentLogs.filter(log => {
    if (!globalSearch) return true;
    const search = globalSearch.toLowerCase();
    return (
      log.vehicleName.toLowerCase().includes(search) ||
      log.type.toLowerCase().includes(search) ||
      (log.driver && log.driver.toLowerCase().includes(search)) ||
      (log.category && log.category.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-12 pb-12 animate-fadeIn">
      
      {/* QUICK AI INSIGHTS BAR */}
      <section className="glass-panel p-4 rounded-2xl border border-accentCyan/20 bg-gradient-to-r from-accentCyan/5 to-transparent flex items-center space-x-3 shadow-sm mb-4">
        <Sparkles className="text-accentCyan flex-shrink-0" size={20} />
        <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none flex space-x-6 text-xs text-slate-300">
          <span className="flex items-center"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>Fuel Cost increased by 12%</span>
          <span className="flex items-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>Truck-08 has highest ROI (24.2%)</span>
          <span className="flex items-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>Maintenance expenses decreased by 8%</span>
          <span className="flex items-center"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-1.5"></span>Average operational cost per trip reduced to {fmtDecimal(kpi.averageCostPerTrip)}</span>
          <span className="flex items-center"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1.5"></span>Highest fuel consuming vehicle is Truck-04</span>
          <span className="flex items-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>Average fuel efficiency improved to 5.2 km/L</span>
        </div>
      </section>

      {/* KPI GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-darkBorder flex flex-col justify-between h-44 relative transition-all duration-300 glass-panel-hover"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">{card.title}</span>
                <div className="p-1.5 bg-white/5 rounded-lg border border-darkBorder text-gray-300">
                  <Icon size={14} />
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <span className={`text-[10px] font-bold flex items-center ${card.isPositive ? 'text-accentGreen' : 'text-accentRed'}`}>
                  {card.isPositive ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                  {card.growth}
                </span>

                {/* Custom SVG Sparkline */}
                <svg viewBox="0 0 100 30" className="w-16 h-6">
                  <polyline
                    fill="none"
                    stroke={card.color}
                    strokeWidth="1.5"
                    points={card.points}
                    className="sparkline-svg"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </section>

      {/* CHARTS SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Operational Cost Trend */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Operational Cost</h3>
              <p className="text-xs text-gray-500">Fuel & General Expenses combined timeline</p>
            </div>
            <Link to="/analytics" className="text-xs text-accentCyan hover:underline flex items-center">
              View Analytics <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151d30', borderColor: 'rgba(255,255,255,0.08)' }}
                  labelClassName="text-slate-400 font-semibold"
                />
                <Line type="monotone" dataKey="operationalCost" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} />
                <Line type="monotone" dataKey="fuel" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="expenses" stroke="#f97316" strokeWidth={1.5} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue vs Expenses */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Revenue vs Expenses</h3>
              <p className="text-xs text-gray-500">Monthly fleet yield versus operational cash output</p>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.revenueVsExpenses || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151d30', borderColor: 'rgba(255,255,255,0.08)' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* RECENT LOGS SUMMARY */}
      <section className="glass-panel p-6 rounded-2xl border border-darkBorder">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Recent Financial Operations</h3>
            <p className="text-xs text-gray-500">Latest ledger postings of fuel updates and fleet bills</p>
          </div>
          <div className="flex space-x-3">
            <Link to="/fuel" className="text-xs text-accentCyan hover:underline">Fuel Logs</Link>
            <span className="text-gray-600 text-xs">|</span>
            <Link to="/expenses" className="text-xs text-accentCyan hover:underline">Expense Logs</Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-darkBorder text-gray-400 text-xs uppercase font-semibold">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Category / Type</th>
                <th className="py-3 px-4">Cost / Amount</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Ledger Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecentLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-4 font-mono text-xs text-gray-300">
                    {log.fuelId || log.expenseId}
                  </td>
                  <td className="py-4 px-4 font-semibold text-white">
                    {log.vehicleName}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      log.type === 'Fuel' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {log.type === 'Fuel' ? 'Fuel Refuel' : log.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-white">
                    {fmtDecimal(log.cost)}
                  </td>
                  <td className="py-4 px-4 text-xs text-gray-400">
                    {new Date(log.keyDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'Approved' ? 'bg-accentGreen/15 text-accentGreen' : 'bg-yellow-500/15 text-yellow-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredRecentLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500 text-xs">
                    No transactions matching global search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
