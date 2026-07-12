import React, { useEffect, useState } from 'react';
import API from '../api';
import { useFilters } from '../context/FilterContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis } from 'recharts';
import { BarChart3, TrendingUp, HeartPulse, Wrench } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { region, refreshTrigger } = useFilters();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await API.get(`/dashboard?region=${region}`);
        setData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [region, refreshTrigger]);

  if (isLoading || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent"></div>
      </div>
    );
  }

  const { charts } = data;

  // Additional mock parameters for analytics charts
  const downtimeData = [
    { name: 'Truck-12', downtime: 18, odometer: 142350 },
    { name: 'Van-05', downtime: 2, odometer: 24600 },
    { name: 'Truck-08', downtime: 8, odometer: 85200 },
    { name: 'Bus-02', downtime: 4, odometer: 34100 },
    { name: 'Van-07', downtime: 12, odometer: 54120 },
    { name: 'Truck-09', downtime: 14, odometer: 112000 },
    { name: 'Van-03', downtime: 25, odometer: 165000 }
  ];

  const maintenanceFrequency = [
    { type: 'Routine Oil Change', count: 32 },
    { type: 'Brake Inspection', count: 18 },
    { type: 'Tire Rotations', count: 12 },
    { type: 'Electrical Systems', count: 9 },
    { type: 'Suspension Repairs', count: 6 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Fleet Analytics</h1>
        <p className="text-xs text-gray-400 mt-0.5">Advanced diagnostics, ROI calculations, and downtime telemetry logs.</p>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue">
            <BarChart3 size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Average Mileage</span>
            <span className="text-xl font-bold text-white mt-0.5 block">85,240 km</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Fleet ROI Rate</span>
            <span className="text-xl font-bold text-white mt-0.5 block">19.54%</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-brand-amber/10 border border-brand-amber/20 text-brand-amber">
            <HeartPulse size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Avg Health Score</span>
            <span className="text-xl font-bold text-white mt-0.5 block">76.3%</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-brand-purple/10 border border-brand-purple/20 text-brand-purple">
            <Wrench size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Avg Downtime</span>
            <span className="text-xl font-bold text-white mt-0.5 block">4.8 Days</span>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Downtime vs Odometer */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Shop Downtime (Days) vs Mileage</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                <XAxis type="number" dataKey="odometer" name="Odometer" unit="km" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis type="number" dataKey="downtime" name="Downtime" unit=" days" stroke="#475569" fontSize={11} tickLine={false} />
                <ZAxis type="number" range={[60, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                <Scatter name="Vehicles" data={downtimeData} fill="#8B5CF6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Maintenance Frequency Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Task Frequencies</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceFrequency}>
                <XAxis dataKey="type" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vehicle Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Composition by Vehicle Type</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.typeDistribution}>
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                <Bar dataKey="value" name="Count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Maintenance Categories Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Severity Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={charts.maintCategories}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="name" stroke="#475569" fontSize={10} />
                <PolarRadiusAxis stroke="#475569" fontSize={9} />
                <Radar name="Count" dataKey="count" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

