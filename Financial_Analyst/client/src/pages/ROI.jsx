import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { Percent, TrendingUp, Award, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const ROI = () => {
  const { vehicleFilter, regionFilter } = useOutletContext();
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchROIData = async () => {
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

    fetchROIData();
  }, [vehicleFilter, regionFilter]);

  if (loading || !data || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accentCyan"></div>
        <p className="text-gray-400 text-sm">Computing Return On Investment...</p>
      </div>
    );
  }

  const vehiclesList = data.allVehiclesProfitability;
  // Sort for Top and Bottom ROI vehicles
  const sortedByROI = [...vehiclesList].sort((a, b) => b.roi - a.roi);
  const topVehicles = sortedByROI.slice(0, 3);
  const bottomVehicles = [...sortedByROI].reverse().slice(0, 3);

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Return on Investment (ROI)</h2>
        <p className="text-xs text-gray-500">Auto-calculation ledger: (Revenue - (Fuel + Maintenance)) / Acquisition Cost</p>
      </div>

      {/* Fleet Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Total Fleet ROI</span>
            <h3 className="text-3xl font-bold text-accentGreen mt-1">{metrics.fleetROI}%</h3>
            <p className="text-xs text-gray-500 mt-2">Combined yield after operating variables</p>
          </div>
          <div className="p-4 bg-accentGreen/15 text-accentGreen rounded-2xl border border-accentGreen/20 shadow-glowGreen">
            <Percent size={28} />
          </div>
        </div>

        {/* Top performer card */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
          <div className="flex items-center space-x-2 text-accentGreen mb-3">
            <Award size={18} />
            <h4 className="text-xs font-bold uppercase">Top Performing Vehicle</h4>
          </div>
          <h3 className="text-lg font-bold text-white">{sortedByROI[0]?.vehicleName}</h3>
          <p className="text-xs text-gray-400 mt-1">ROI: <strong className="text-white">{sortedByROI[0]?.roi}%</strong></p>
          <p className="text-[10px] text-gray-500 mt-2">Revenue: {fmt(sortedByROI[0]?.revenue)}</p>
        </div>

        {/* Bottom performer card */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
          <div className="flex items-center space-x-2 text-accentRed mb-3">
            <AlertTriangle size={18} />
            <h4 className="text-xs font-bold uppercase">Lowest Yield Vehicle</h4>
          </div>
          <h3 className="text-lg font-bold text-white">{sortedByROI[sortedByROI.length - 1]?.vehicleName}</h3>
          <p className="text-xs text-gray-400 mt-1">ROI: <strong className="text-white">{sortedByROI[sortedByROI.length - 1]?.roi}%</strong></p>
          <p className="text-[10px] text-gray-500 mt-2">Revenue: {fmt(sortedByROI[sortedByROI.length - 1]?.revenue)}</p>
        </div>
      </section>

      {/* ROI Trend Chart */}
      <section className="glass-panel p-6 rounded-2xl border border-darkBorder">
        <h3 className="text-sm font-bold text-white mb-4">ROI Monthly Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.revenueVsExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ backgroundColor: '#151d30', borderColor: 'rgba(255,255,255,0.08)' }} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981' }} name="Profit Value" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ROI Lists & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 vehicles table */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
          <h3 className="text-sm font-bold text-white mb-4">Leaderboard - Top Performing Asset ROI</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-darkBorder text-gray-400 uppercase font-semibold bg-white/5">
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Acquisition Cost</th>
                  <th className="py-2.5 px-3">Revenue Generated</th>
                  <th className="py-2.5 px-3">ROI Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {topVehicles.map((v, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">{v.vehicleName}</td>
                    <td className="py-3 px-3">{fmt(v.acquisitionCost)}</td>
                    <td className="py-3 px-3">{fmt(v.revenue)}</td>
                    <td className="py-3 px-3 text-accentGreen font-bold flex items-center">
                      <ArrowUpRight size={12} className="mr-1" /> {v.roi}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom 5 vehicles table */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
          <h3 className="text-sm font-bold text-white mb-4">Asset Warnings - Lowest Yield ROI</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-darkBorder text-gray-400 uppercase font-semibold bg-white/5">
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Acquisition Cost</th>
                  <th className="py-2.5 px-3">Revenue Generated</th>
                  <th className="py-2.5 px-3">ROI Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {bottomVehicles.map((v, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">{v.vehicleName}</td>
                    <td className="py-3 px-3">{fmt(v.acquisitionCost)}</td>
                    <td className="py-3 px-3">{fmt(v.revenue)}</td>
                    <td className="py-3 px-3 text-accentRed font-bold">{v.roi}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ROI;
