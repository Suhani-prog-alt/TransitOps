import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { DollarSign, Percent, TrendingUp, Award, AlertTriangle, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Profitability = () => {
  const { vehicleFilter, regionFilter } = useOutletContext();
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfitData = async () => {
      try {
        setLoading(true);
        const params = { vehicleName: vehicleFilter, region: regionFilter };
        const [chartsRes, metricsRes] = await Promise.all([
          analyticsAPI.getChartData(params),
          analyticsAPI.getDashboardMetrics(params)
        ]);
        setData(chartsRes.data);
        setMetrics(metricsRes.data.kpi);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfitData();
  }, [vehicleFilter, regionFilter]);

  if (loading || !data || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accentCyan"></div>
        <p className="text-gray-400 text-sm">Processing Profit Ledgers...</p>
      </div>
    );
  }

  const vehiclesList = data.allVehiclesProfitability;
  // Most and least profitable
  const sortedByProfit = [...vehiclesList].sort((a, b) => b.profit - a.profit);
  const mostProfitable = sortedByProfit[0] || { vehicleName: 'N/A', profit: 0, profitMargin: 0 };
  const leastProfitable = sortedByProfit[sortedByProfit.length - 1] || { vehicleName: 'N/A', profit: 0, profitMargin: 0 };

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Fleet Profitability Ledger</h2>
        <p className="text-xs text-gray-500">Overview of margins, vehicle-wise earnings, and annual trends</p>
      </div>

      {/* Aggregate metrics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Revenue Generated</span>
            <h3 className="text-2xl font-bold text-white mt-1">{fmt(metrics.revenueGenerated)}</h3>
            <p className="text-[10px] text-accentGreen font-bold flex items-center mt-1">
              <TrendingUp size={10} className="mr-0.5" /> +18.1% vs last period
            </p>
          </div>
          <div className="p-3 bg-white/5 border border-darkBorder rounded-xl text-gray-300">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Operational Cost */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Operational Cost</span>
            <h3 className="text-2xl font-bold text-white mt-1">{fmt(metrics.totalOperationalCost)}</h3>
            <p className="text-[10px] text-accentGreen font-bold flex items-center mt-1">
              -4.2% cost reduction
            </p>
          </div>
          <div className="p-3 bg-white/5 border border-darkBorder rounded-xl text-gray-300">
            <Activity size={18} />
          </div>
        </div>

        {/* Profit */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Net Fleet Profit</span>
            <h3 className="text-2xl font-bold text-accentGreen mt-1">{fmt(metrics.netProfit)}</h3>
            <p className="text-[10px] text-accentGreen font-bold flex items-center mt-1">
              Margin: {metrics.profitMargin}%
            </p>
          </div>
          <div className="p-3 bg-accentGreen/10 border border-accentGreen/20 rounded-xl text-accentGreen">
            <TrendingUp size={18} />
          </div>
        </div>

        {/* Profit Margin */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Profit Margin</span>
            <h3 className="text-2xl font-bold text-accentCyan mt-1">{metrics.profitMargin}%</h3>
            <p className="text-[10px] text-gray-500 mt-1">Return ratio on operations</p>
          </div>
          <div className="p-3 bg-accentCyan/10 border border-accentCyan/20 rounded-xl text-accentCyan">
            <Percent size={18} />
          </div>
        </div>

      </section>

      {/* Most & Least Profitable Assets */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Most Profitable */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder flex items-center justify-between bg-gradient-to-r from-accentGreen/5 to-transparent">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-accentGreen">
              <Award size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Most Profitable Vehicle</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-2">{mostProfitable.vehicleName}</h3>
            <p className="text-xs text-gray-400">Total Profit: <strong className="text-white">{fmt(mostProfitable.profit)}</strong></p>
            <p className="text-[10px] text-gray-500">Margin: {mostProfitable.profitMargin}%</p>
          </div>
          <div className="p-4 bg-accentGreen/10 text-accentGreen rounded-2xl border border-accentGreen/20 shadow-glowGreen">
            <TrendingUp size={28} />
          </div>
        </div>

        {/* Least Profitable */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder flex items-center justify-between bg-gradient-to-r from-accentRed/5 to-transparent">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-accentRed">
              <AlertTriangle size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Least Profitable Vehicle</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-2">{leastProfitable.vehicleName}</h3>
            <p className="text-xs text-gray-400">Total Profit: <strong className="text-white">{fmt(leastProfitable.profit)}</strong></p>
            <p className="text-[10px] text-gray-500">Margin: {leastProfitable.profitMargin}%</p>
          </div>
          <div className="p-4 bg-accentRed/10 text-accentRed rounded-2xl border border-accentRed/20">
            <AlertTriangle size={28} />
          </div>
        </div>

      </section>

      {/* Monthly Profit Area Chart */}
      <section className="glass-panel p-6 rounded-2xl border border-darkBorder">
        <h3 className="text-sm font-bold text-white mb-4">Monthly Profit Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenueVsExpenses}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#151d30', borderColor: 'rgba(255,255,255,0.08)' }} />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" name="Net Profit ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Table Vehicle Wise Profit */}
      <section className="glass-panel p-6 rounded-2xl border border-darkBorder">
        <h3 className="text-sm font-bold text-white mb-4">Vehicle Profitability Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-darkBorder text-gray-400 uppercase font-semibold bg-white/5">
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Simulated Revenue</th>
                <th className="py-2.5 px-3">Operational Cost</th>
                <th className="py-2.5 px-3">Net Profit</th>
                <th className="py-2.5 px-3">Net Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {vehiclesList.map((v, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-white">{v.vehicleName}</td>
                  <td className="py-3.5 px-3 text-accentGreen">{fmt(v.revenue)}</td>
                  <td className="py-3.5 px-3 text-red-400">{fmt(v.operationalCost)}</td>
                  <td className="py-3.5 px-3 font-bold text-white">{fmt(v.profit)}</td>
                  <td className="py-3.5 px-3 font-semibold text-accentCyan">{v.profitMargin}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default Profitability;
