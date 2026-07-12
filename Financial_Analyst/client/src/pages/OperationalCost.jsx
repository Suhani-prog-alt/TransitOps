import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { DollarSign, Truck, Award, TrendingUp, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const OperationalCost = () => {
  const { vehicleFilter, regionFilter } = useOutletContext();
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperationalData = async () => {
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

    fetchOperationalData();
  }, [vehicleFilter, regionFilter]);

  if (loading || !data || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accentCyan"></div>
        <p className="text-gray-400 text-sm">Processing Cost Ledgers...</p>
      </div>
    );
  }

  // Find Highest and Lowest cost vehicles
  const vehiclesList = data.allVehiclesProfitability;
  const sortedByCost = [...vehiclesList].sort((a, b) => b.operationalCost - a.operationalCost);
  const highestCostVehicle = sortedByCost[0] || { vehicleName: 'N/A', operationalCost: 0 };
  const lowestCostVehicle = sortedByCost[sortedByCost.length - 1] || { vehicleName: 'N/A', operationalCost: 0 };

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Operational Fleet Costs</h2>
        <p className="text-xs text-gray-500">Auto-calculation ledger: Fuel + Maintenance + General overhead bills</p>
      </div>

      {/* Aggregate Cards */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder">
          <span className="text-[10px] text-gray-400 font-semibold uppercase">Total Operational Cost</span>
          <h3 className="text-xl font-bold text-white mt-1">{fmt(metrics.totalOperationalCost)}</h3>
          <div className="mt-2 text-[10px] text-gray-500">Fuel + maintenance + bills</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-darkBorder">
          <span className="text-[10px] text-gray-400 font-semibold uppercase">Avg Cost Per Vehicle</span>
          <h3 className="text-xl font-bold text-white mt-1">{fmt(metrics.averageCostPerVehicle)}</h3>
          <div className="mt-2 text-[10px] text-gray-500">Per vehicle active billing</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-darkBorder">
          <span className="text-[10px] text-gray-400 font-semibold uppercase">Avg Cost Per Trip</span>
          <h3 className="text-xl font-bold text-white mt-1">{fmt(metrics.averageCostPerTrip)}</h3>
          <div className="mt-2 text-[10px] text-gray-500">Average cost per route trip</div>
        </div>

        {/* Highest vehicle */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder flex items-center justify-between">
          <div>
            <span className="text-[10px] text-red-400 font-semibold uppercase">Highest Cost Vehicle</span>
            <h3 className="text-lg font-bold text-white mt-1">{highestCostVehicle.vehicleName}</h3>
            <div className="mt-2 text-[10px] text-red-500 font-bold">{fmt(highestCostVehicle.operationalCost)}</div>
          </div>
          <div className="p-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
            <Truck size={18} />
          </div>
        </div>

        {/* Lowest vehicle */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder flex items-center justify-between">
          <div>
            <span className="text-[10px] text-accentGreen font-semibold uppercase">Lowest Cost Vehicle</span>
            <h3 className="text-lg font-bold text-white mt-1">{lowestCostVehicle.vehicleName}</h3>
            <div className="mt-2 text-[10px] text-accentGreen font-bold">{fmt(lowestCostVehicle.operationalCost)}</div>
          </div>
          <div className="p-2 bg-accentGreen/10 text-accentGreen rounded-xl border border-accentGreen/20">
            <Truck size={18} />
          </div>
        </div>
      </section>

      {/* Line Chart */}
      <section className="glass-panel p-6 rounded-2xl border border-darkBorder">
        <h3 className="text-sm font-bold text-white mb-4">Operational Cost Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.monthlyTrends}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#151d30', borderColor: 'rgba(255,255,255,0.08)' }} />
              <Area type="monotone" dataKey="operationalCost" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCost)" name="Operational Cost" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Vehicles list */}
      <section className="glass-panel p-6 rounded-2xl border border-darkBorder">
        <h3 className="text-sm font-bold text-white mb-4">Operational Cost Breakdown by Vehicle</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-darkBorder text-gray-400 uppercase font-semibold bg-white/5">
                <th className="py-3 px-4">Vehicle Name</th>
                <th className="py-3 px-4">Acquisition Base</th>
                <th className="py-3 px-4">Fuel Costs</th>
                <th className="py-3 px-4">Other Expenses</th>
                <th className="py-3 px-4">Total Cost</th>
                <th className="py-3 px-4">Trips Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {vehiclesList.map((v, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{v.vehicleName}</td>
                  <td className="py-3.5 px-4">{fmt(v.acquisitionCost)}</td>
                  <td className="py-3.5 px-4 text-red-400 font-semibold">{fmt(v.operationalCost * 0.6)}</td>
                  <td className="py-3.5 px-4 text-orange-400">{fmt(v.operationalCost * 0.4)}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{fmt(v.operationalCost)}</td>
                  <td className="py-3.5 px-4 font-mono">{(v.operationalCost / metrics.averageCostPerTrip).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default OperationalCost;
