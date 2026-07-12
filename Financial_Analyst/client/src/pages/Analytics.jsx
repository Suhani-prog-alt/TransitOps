import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#06b6d4', '#10b981', '#f97316', '#ef4444', '#a855f7', '#64748b'];

const Analytics = () => {
  const { vehicleFilter, regionFilter } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const params = { vehicleName: vehicleFilter, region: regionFilter };
        const { data } = await analyticsAPI.getChartData(params);
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [vehicleFilter, regionFilter]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accentCyan"></div>
        <p className="text-gray-400 text-sm">Rendering Fleet Charts...</p>
      </div>
    );
  }

  // Format currency
  const fmt = (v) => `$${v.toLocaleString()}`;

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Advanced Fleet Analytics</h2>
        <p className="text-xs text-gray-500">Visual operations ledger of operational, profit, and return statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Line Chart: Monthly Operational Cost */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
          <h3 className="text-sm font-bold text-white mb-4">Monthly Operational Cost (Line)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#151d30', borderColor: 'rgba(255,255,255,0.08)' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="operationalCost" stroke="#06b6d4" strokeWidth={3} name="Total Cost" />
                <Line type="monotone" dataKey="fuel" stroke="#ef4444" strokeWidth={1.5} name="Fuel Share" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Bar Chart: Revenue vs Expenses */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
          <h3 className="text-sm font-bold text-white mb-4">Revenue vs Expenses (Bar)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueVsExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#151d30', borderColor: 'rgba(255,255,255,0.08)' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Simulated Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Operating Costs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Area Chart: Profit Trend */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
          <h3 className="text-sm font-bold text-white mb-4">Profit Trend (Area)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueVsExpenses}>
                <defs>
                  <linearGradient id="colorProfitA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#151d30', borderColor: 'rgba(255,255,255,0.08)' }} />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfitA)" name="Net Profit ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Horizontal Bar Chart: Top 10 Profitable Vehicles */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
          <h3 className="text-sm font-bold text-white mb-4">Top 10 Profitable Vehicles (Horizontal Bar)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.vehicleProfitability}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <YAxis dataKey="vehicleName" type="category" stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#151d30', borderColor: 'rgba(255,255,255,0.08)' }} />
                <Bar dataKey="profit" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Vehicle Net Profit ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Pie Chart: Expense Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
          <h3 className="text-sm font-bold text-white mb-4">Expense Distribution (Pie)</h3>
          <div className="h-72 flex flex-col sm:flex-row items-center justify-around">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={70}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `$${v}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 text-xs">
              {data.categoryDistribution.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-gray-400">{entry.name}:</span>
                  <span className="font-semibold text-white">{fmt(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Donut Chart: Expense Categories */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
          <h3 className="text-sm font-bold text-white mb-4">Expense Categories (Donut)</h3>
          <div className="h-72 flex flex-col sm:flex-row items-center justify-around">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `$${v}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 text-xs">
              {data.categoryDistribution.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-gray-400">{entry.name}:</span>
                  <span className="font-semibold text-white">{fmt(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
