import React, { useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, Compass, Activity, ArrowUpRight } from 'lucide-react';

const Reports = ({ apiFetch }) => {
  const [data, setData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [dashRes, vehiclesRes] = await Promise.all([
          apiFetch('/api/dashboard'),
          apiFetch('/api/vehicles')
        ]);

        const dashData = await dashRes.json();
        const vehiclesData = await vehiclesRes.json();

        if (dashData.success) setData(dashData);
        if (vehiclesData.success) setVehicles(vehiclesData.data);
      } catch (err) {
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [apiFetch]);

  // CSV Export Handler
  const handleCSVExport = () => {
    if (!vehicles.length) return;
    
    // Header
    let csv = 'Reg Number,Vehicle Model,Type,Max Capacity (kg),Odometer (km),Status\n';
    
    // Rows
    vehicles.forEach(v => {
      csv += `"${v.registrationNumber}","${v.name}","${v.type}",${v.maxCapacity},${v.odometer},"${v.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transitops_fleet_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5bc0be]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in print:p-0 print:bg-white print:text-black">
      
      {/* Header (hidden in print) */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white">Reports & Fleet Analytics</h2>
          <p className="text-xs text-[#9ca3af]">Export operational metrics, review asset ROI, and measure efficiency.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCSVExport}
            className="bg-[#1c2541] hover:bg-[#3a506b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all text-xs font-semibold"
          >
            <Download className="h-4 w-4 text-[#5bc0be]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="bg-[#5bc0be] text-[#0b132b] px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all text-xs font-bold hover:bg-[#48a9a7] hover:scale-105"
          >
            <FileText className="h-4 w-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Header */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-extrabold">TransitOps - Smart Transport Operations Platform</h1>
        <p className="text-sm text-gray-600">Fleet Operations Analysis & ROI Report — Generated on {new Date().toLocaleDateString()}</p>
        <hr className="mt-4 border-gray-300" />
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-6 shadow-lg flex items-center gap-5 print:bg-white print:border-gray-300">
          <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider print:text-gray-500">Fleet ROI Performance</p>
            <h3 className="text-2xl font-bold text-white mt-1 print:text-black">Optimal ROI</h3>
            <p className="text-[10px] text-green-400 font-semibold flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="h-3 w-3" /> Average +18.4%
            </p>
          </div>
        </div>

        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-6 shadow-lg flex items-center gap-5 print:bg-white print:border-gray-300">
          <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
            <Compass className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider print:text-gray-500">Avg Fuel Efficiency</p>
            <h3 className="text-2xl font-bold text-white mt-1 print:text-black">{data.fuelEfficiency.average} km/l</h3>
            <p className="text-[10px] text-[#9ca3af] font-semibold mt-1 print:text-gray-500">
              Target: 7.0 km/l
            </p>
          </div>
        </div>

        <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-6 shadow-lg flex items-center gap-5 print:bg-white print:border-gray-300">
          <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider print:text-gray-500">Active Asset Utilization</p>
            <h3 className="text-2xl font-bold text-white mt-1 print:text-black">{data.kpis.fleetUtilization}%</h3>
            <p className="text-[10px] text-[#9ca3af] font-semibold mt-1 print:text-gray-500">
              Capacity: {data.kpis.availableVehicles + data.kpis.activeVehicles} active units
            </p>
          </div>
        </div>

      </div>

      {/* ROI List */}
      <div className="bg-[#1c2541]/70 border border-[#3a506b]/40 rounded-2xl p-6 shadow-lg print:bg-white print:border-gray-300">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 print:text-black">Vehicle Return on Investment (ROI)</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#3a506b]/40 text-[#9ca3af] text-[10px] uppercase font-bold tracking-wider print:text-gray-500 print:border-gray-300">
                <th className="pb-3">Rank</th>
                <th className="pb-3">Registration</th>
                <th className="pb-3">Model</th>
                <th className="pb-3 text-right">Computed ROI (%)</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#3a506b]/20 print:divide-gray-200">
              {data.topVehiclesByRoi.map((item, idx) => (
                <tr key={item.id} className="hover:bg-[#0b132b]/20 print:hover:bg-transparent">
                  <td className="py-4 text-[#9ca3af] font-bold print:text-gray-600">#{idx + 1}</td>
                  <td className="py-4 font-mono text-white font-bold print:text-black">{item.registrationNumber}</td>
                  <td className="py-4 text-white font-medium print:text-black">{item.name}</td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24 bg-[#0b132b] h-2 rounded-full overflow-hidden border border-[#3a506b]/30 print:hidden">
                        <div className="bg-[#5bc0be] h-full rounded-full" style={{ width: `${Math.max(item.roi, 0)}%` }}></div>
                      </div>
                      <span className="font-bold text-[#5bc0be] print:text-black">{item.roi}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {data.topVehiclesByRoi.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-[#9ca3af]">No active ROI records computed. Complete trips first to record revenues.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Formula Explainer (print visible) */}
        <div className="mt-8 p-4 bg-[#0b132b]/50 border border-[#3a506b]/40 rounded-xl text-xs text-[#9ca3af] print:bg-gray-100 print:text-gray-700 print:border-gray-300 leading-relaxed">
          <h4 className="font-bold text-white mb-1.5 print:text-black">ROI Calculation Formula:</h4>
          <p>
            Vehicle ROI is calculated as: 
            <span className="font-mono text-[#5bc0be] ml-1.5 font-bold print:text-black">[ (Revenue - (Maintenance + Fuel Costs)) / Acquisition Cost ] × 100</span>
          </p>
          <p className="mt-1 text-[11px]">
            This provides real-time lifecycle value insights for each dispatch truck or delivery van.
          </p>
        </div>

      </div>

    </div>
  );
};

export default Reports;
