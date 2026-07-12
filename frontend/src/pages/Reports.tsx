import React, { useEffect, useState } from 'react';
import API from '../api';
import { useFilters } from '../context/FilterContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, FileText, ChevronDown, CheckCircle } from 'lucide-react';

export const Reports: React.FC = () => {
  const { region } = useFilters();
  const [reportType, setReportType] = useState('fleet_summary');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const response = await API.get(`/reports/summary?region=${region}`);
      setSummaryData(response.data);
      setIsGenerated(true);
    } catch (err) {
      console.error('Error fetching report summaries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [region]);

  const handleDownload = async () => {
    try {
      const endpoint = reportType === 'maintenance_report' 
        ? '/reports/export/maintenance' 
        : `/reports/export/vehicles?region=${region}`;
      const filename = reportType === 'maintenance_report'
        ? 'maintenance_report.csv'
        : 'fleet_report.csv';

      const response = await API.get(endpoint, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Fleet Reports</h1>
        <p className="text-xs text-gray-400 mt-0.5">Generate, audit and export detailed fleet telemetry and maintenance statements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: Report parameters */}
        <Card hoverable={false} className="h-fit">
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-semibold">
            {/* Report Type selector */}
            <div className="space-y-1.5 font-medium">
              <label className="text-gray-400 font-semibold">Report Category</label>
              <div className="relative">
                <select
                  value={reportType}
                  onChange={(e) => {
                    setReportType(e.target.value);
                  }}
                  className="w-full glass-input bg-[#0D1321] cursor-pointer appearance-none"
                >
                  <option value="fleet_summary">Fleet Valuation & Summary</option>
                  <option value="maintenance_report">Maintenance cost & summary statement</option>
                  <option value="vehicle_utilization">Vehicle utilization & Odometer log</option>
                </select>
                <ChevronDown size={14} className="text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Region description */}
            <div className="space-y-1">
              <span className="text-gray-500 font-semibold uppercase tracking-wider block">Scope</span>
              <span className="text-sm font-bold text-white mt-1 block">{region}</span>
            </div>

            <div className="flex gap-2.5 pt-4">
              <Button variant="primary" className="flex-1" onClick={fetchSummary} isLoading={isLoading}>
                Compile Statement
              </Button>
              {isGenerated && (
                <Button variant="secondary" onClick={handleDownload}>
                  <Download size={14} />
                  <span>CSV</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right side: Report preview */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card hoverable={false} className="h-80 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent"></div>
            </Card>
          ) : !summaryData ? (
            <Card hoverable={false} className="h-80 flex flex-col items-center justify-center text-gray-500">
              <FileText size={48} className="stroke-[1.2] mb-3 text-gray-600" />
              <p>Configure parameters and compile to view report details.</p>
            </Card>
          ) : (
            <Card hoverable={false} className="space-y-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={18} className="text-brand-blue" />
                  <span>
                    Report Summary Preview: {reportType.replace('_', ' ').toUpperCase()}
                  </span>
                </CardTitle>
                <div className="flex items-center gap-1 text-[10px] text-brand-green font-bold uppercase tracking-wider">
                  <CheckCircle size={11} />
                  <span>Ready to export</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 1. Fleet summary preview */}
                {reportType === 'fleet_summary' && (
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                      <span className="text-gray-500 uppercase tracking-wider block">Total Fleet Size</span>
                      <span className="text-2xl font-bold text-white mt-1 block">
                        {summaryData.fleetSummary.totalVehicles} Vehicles
                      </span>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                      <span className="text-gray-500 uppercase tracking-wider block">Fleet Valuation</span>
                      <span className="text-2xl font-bold text-white mt-1 block">
                        ₹{(summaryData.fleetSummary.totalValue / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <div className="col-span-2 rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-2">
                      <span className="text-gray-500 uppercase tracking-wider block mb-2">Fleet status breakdown</span>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-gray-400">Available</span>
                        <span className="text-white font-bold">{summaryData.fleetSummary.statusCounts.Available}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-gray-400">On Trip</span>
                        <span className="text-white font-bold">{summaryData.fleetSummary.statusCounts.InTrip}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-gray-400">In Shop (Maintenance)</span>
                        <span className="text-white font-bold">{summaryData.fleetSummary.statusCounts.InShop}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Maintenance report preview */}
                {reportType === 'maintenance_report' && (
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                      <span className="text-gray-500 uppercase tracking-wider block">Cumulative Expenses</span>
                      <span className="text-2xl font-bold text-white mt-1 block">
                        ₹{(summaryData.maintenanceSummary.totalCost / 100000).toFixed(2)}L
                      </span>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                      <span className="text-gray-500 uppercase tracking-wider block">Service Tickets Closed</span>
                      <span className="text-2xl font-bold text-white mt-1 block">
                        {summaryData.maintenanceSummary.stats.completedLogs} of {summaryData.maintenanceSummary.stats.totalLogs} logs
                      </span>
                    </div>
                    <div className="col-span-2 rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-2">
                      <span className="text-gray-500 uppercase tracking-wider block mb-2">Service Ticket Statuses</span>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-gray-400">Active (In progress)</span>
                        <span className="text-white font-bold">{summaryData.maintenanceSummary.stats.activeLogs}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-gray-400">Scheduled / Upcoming</span>
                        <span className="text-white font-bold">{summaryData.maintenanceSummary.stats.scheduledLogs}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-gray-400">Cancelled Tickets</span>
                        <span className="text-white font-bold">{summaryData.maintenanceSummary.stats.cancelledLogs}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Vehicle utilization preview */}
                {reportType === 'vehicle_utilization' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 text-xs font-semibold">
                      <span className="text-gray-500 uppercase tracking-wider block mb-3">Regional Valuations</span>
                      {Object.keys(summaryData.regionValuations).map((reg) => (
                        <div key={reg} className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0">
                          <span className="text-gray-400 font-bold">{reg} Region</span>
                          <span className="text-white">₹{(summaryData.regionValuations[reg] / 100000).toFixed(1)}L</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
