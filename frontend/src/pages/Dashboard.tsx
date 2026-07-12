import React, { useEffect, useState } from 'react';
import API from '../api';
import { useFilters } from '../context/FilterContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import {
  Truck,
  CheckCircle2,
  Navigation,
  Wrench,
  Ban,
  TrendingUp,
  Coins,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface KPIProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  trend: string;
  trendType: 'up' | 'down';
  sparklineData: { val: number }[];
  iconColor: string;
}

const KPICard: React.FC<KPIProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendType,
  sparklineData,
  iconColor
}) => {
  const isUp = trendType === 'up';
  return (
    <Card className="glass-card flex flex-col justify-between h-36">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl bg-white/[0.03] border border-white/5 ${iconColor}`}>
          <Icon size={18} className="stroke-[2.5]" />
        </div>
      </div>

      <div className="flex justify-between items-end mt-4">
        <div className="flex items-center gap-1">
          {isUp ? (
            <ArrowUpRight size={14} className="text-emerald-400" />
          ) : (
            <ArrowDownRight size={14} className="text-red-400" />
          )}
          <span className={`text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend}
          </span>
          <span className="text-[10px] text-gray-500 font-semibold ml-0.5">vs last week</span>
        </div>

        {/* Sparkline chart */}
        <div className="w-16 h-8 overflow-hidden opacity-85">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isUp ? '#10B981' : '#EF4444'} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={isUp ? '#10B981' : '#EF4444'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="val"
                stroke={isUp ? '#10B981' : '#EF4444'}
                strokeWidth={1.5}
                fillOpacity={1}
                fill={`url(#grad-${title})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { region, refreshTrigger } = useFilters();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await API.get(`/dashboard?region=${region}`);
        setData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [region, refreshTrigger]);

  if (isLoading || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent"></div>
      </div>
    );
  }

  const { kpis, charts, recentActivity } = data;

  // Render sparkles / mini mock data for cards
  const sparklines = {
    total: [{ val: 10 }, { val: 10 }, { val: 11 }, { val: 11 }, { val: 11 }],
    avail: [{ val: 40 }, { val: 42 }, { val: 41 }, { val: 44 }, { val: 45 }],
    trip: [{ val: 24 }, { val: 26 }, { val: 25 }, { val: 28 }, { val: 28 }],
    maint: [{ val: 15 }, { val: 14 }, { val: 13 }, { val: 11 }, { val: 12 }],
    ret: [{ val: 1 }, { val: 1 }, { val: 1 }, { val: 1 }, { val: 1 }],
    util: [{ val: 72 }, { val: 74 }, { val: 73 }, { val: 75 }, { val: 76 }],
    value: [{ val: 80 }, { val: 82 }, { val: 84 }, { val: 86 }, { val: 87 }],
    due: [{ val: 8 }, { val: 9 }, { val: 7 }, { val: 6 }, { val: 5 }]
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-xs text-gray-400 mt-0.5">Real-time status updates and operation control metrics.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Vehicles"
          value={kpis.totalVehicles}
          icon={Truck}
          trend="+10%"
          trendType="up"
          sparklineData={sparklines.total}
          iconColor="text-brand-blue"
        />
        <KPICard
          title="Available Vehicles"
          value={kpis.available}
          icon={CheckCircle2}
          trend="+5%"
          trendType="up"
          sparklineData={sparklines.avail}
          iconColor="text-brand-green"
        />
        <KPICard
          title="Active Trips"
          value={kpis.onTrip}
          icon={Navigation}
          trend="+12%"
          trendType="up"
          sparklineData={sparklines.trip}
          iconColor="text-indigo-400"
        />
        <KPICard
          title="In Maintenance"
          value={kpis.inShop}
          icon={Wrench}
          trend="-2%"
          trendType="down"
          sparklineData={sparklines.maint}
          iconColor="text-brand-amber"
        />
        <KPICard
          title="Retired Vehicles"
          value={kpis.retired}
          icon={Ban}
          trend="0%"
          trendType="up"
          sparklineData={sparklines.ret}
          iconColor="text-brand-red"
        />
        <KPICard
          title="Fleet Utilization"
          value={`${kpis.utilization}%`}
          icon={TrendingUp}
          trend="+4%"
          trendType="up"
          sparklineData={sparklines.util}
          iconColor="text-cyan-400"
        />
        <KPICard
          title="Total Fleet Value"
          value={`₹${(kpis.totalFleetValue / 100000).toFixed(1)}L`}
          icon={Coins}
          trend="+9%"
          trendType="up"
          sparklineData={sparklines.value}
          iconColor="text-brand-purple"
        />
        <KPICard
          title="Maintenance Due"
          value={kpis.maintenanceDue}
          icon={CalendarDays}
          trend="-15%"
          trendType="down"
          sparklineData={sparklines.due}
          iconColor="text-pink-400"
        />
      </div>

      {/* Primary Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Utilization Trend Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fleet Utilization Trend (%)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.utilizationTrend}>
                <defs>
                  <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="utilization" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#utilGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vehicle Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex flex-col justify-between items-center">
            <div className="w-full h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.statusDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.statusDistribution.map((entry: any, idx: number) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total</span>
                <span className="text-2xl font-bold text-white">{kpis.totalVehicles}</span>
              </div>
            </div>
            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 w-full text-xs font-semibold px-4 pb-2">
              {charts.statusDistribution.map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-gray-400">{entry.name}</span>
                  <span className="text-white ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Maintenance Cost Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Maintenance Cost (₹)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyMaintenanceCost}>
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'semibold' }} />
                <Bar dataKey="cost" name="Actual Cost" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expected" name="Budget Limit" fill="#1F2937" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Vehicles by ROI */}
        <Card>
          <CardHeader>
            <CardTitle>Top Vehicles by ROI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {charts.topPerformingROI.map((veh: any, idx: number) => (
              <div key={veh.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-400">{idx + 1}. {veh.name}</span>
                  <span className="text-emerald-400">{veh.roi}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, veh.roi * 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Recent Activity & Fuel Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fuel Efficiency Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fuel Efficiency (km/l)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.fuelEfficiency} layout="vertical">
                <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" name="Avg mileage" fill="#10B981" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto space-y-4 pr-1">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No recent activity logs.</p>
            ) : (
              recentActivity.map((act: any) => (
                <div key={act._id} className="flex gap-3 text-xs">
                  <div className="mt-0.5 shrink-0 flex items-center justify-center h-6 w-6 rounded-lg bg-white/5 border border-white/10 text-gray-400">
                    <Truck size={12} />
                  </div>
                  <div>
                    <p className="font-semibold text-white/90 leading-tight">{act.description}</p>
                    <span className="text-[10px] text-gray-500 font-semibold block mt-1">
                      {new Date(act.timestamp).toLocaleDateString()} at{' '}
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
