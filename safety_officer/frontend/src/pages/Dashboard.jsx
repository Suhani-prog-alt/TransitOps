import { 
  Truck, 
  Wrench, 
  Map, 
  Users, 
  PieChart, 
  AlertTriangle, 
  Info,
  Wallet
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

const utilizationData = [
  { name: '12 May', value: 55 },
  { name: '13 May', value: 60 },
  { name: '14 May', value: 70 },
  { name: '15 May', value: 72 },
  { name: '16 May', value: 75 },
  { name: '17 May', value: 76 },
  { name: '18 May', value: 72 },
]

const tripsData = [
  { name: 'Completed', value: 22, color: '#10b981' },
  { name: 'Active', value: 12, color: '#3b82f6' },
  { name: 'Pending', value: 8, color: '#f59e0b' },
  { name: 'Cancelled', value: 2, color: '#ef4444' },
]

const fuelData = [
  { name: 'Mon', value: 6.2 },
  { name: 'Tue', value: 5.8 },
  { name: 'Wed', value: 6.5 },
  { name: 'Thu', value: 6.4 },
  { name: 'Fri', value: 6.1 },
  { name: 'Sat', value: 6.8 },
  { name: 'Sun', value: 6.45 },
]

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* KPIs Row */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { title: "ACTIVE VEHICLES", value: "132", icon: <Truck className="text-blue-500" size={24}/>, trend: "↑ 8%", trendColor: "text-green-500" },
          { title: "AVAILABLE VEHICLES", value: "45", icon: <Truck className="text-green-500" size={24}/>, trend: "↑ 5%", trendColor: "text-green-500" },
          { title: "VEHICLES IN MAINTENANCE", value: "12", icon: <Wrench className="text-orange-500" size={24}/>, trend: "↓ 2%", trendColor: "text-red-500" },
          { title: "ACTIVE TRIPS", value: "28", icon: <Map className="text-blue-400" size={24}/>, trend: "↑ 12%", trendColor: "text-green-500" },
          { title: "DRIVERS ON DUTY", value: "38", icon: <Users className="text-purple-500" size={24}/>, trend: "↑ 6%", trendColor: "text-green-500" },
        ].map((kpi, idx) => (
          <Card key={idx} className="bg-slate-900 border-slate-800">
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 tracking-wider mb-2">{kpi.title}</p>
                  <h3 className="text-3xl font-bold text-white">{kpi.value}</h3>
                </div>
                {kpi.icon}
              </div>
              <p className={`text-xs ${kpi.trendColor}`}>{kpi.trend} vs last week</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        {/* Fleet Utilization Chart */}
        <Card className="col-span-2 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-200">Fleet Utilization (%)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`}/>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Operational Cost Overview */}
        <Card className="bg-slate-900 border-slate-800 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-200">Operational Cost Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-slate-400 mb-1">Total Operational Cost</p>
              <h2 className="text-3xl font-bold text-white">₹ 8,75,430</h2>
              <p className="text-xs text-green-500 mt-2">↑ 9% vs last week</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Fuel Cost</span>
                <span className="text-white">₹ 5,40,230</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Maintenance Cost</span>
                <span className="text-white">₹ 2,15,600</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Other Expenses</span>
                <span className="text-white">₹ 1,19,600</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Alerts & Notifications (Crucial for Safety Officer) */}
        <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              Alerts & Notifications
              <Badge className="bg-red-500 hover:bg-red-600 text-white rounded-sm px-1.5 py-0">3</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex gap-4 items-start pb-4 border-b border-slate-800">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-sm text-slate-200">3 driver licenses will expire in the next 7 days.</p>
                <p className="text-xs text-slate-500 mt-1">10:30 AM</p>
              </div>
            </div>
            <div className="flex gap-4 items-start pb-4 border-b border-slate-800">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-sm text-slate-200">Vehicle Truck-07 is due for maintenance.</p>
                <p className="text-xs text-slate-500 mt-1">Yesterday</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-sm text-slate-200">Trip TRP-1042 has been pending for more than 24 hours.</p>
                <p className="text-xs text-slate-500 mt-1">17 May 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fuel Efficiency */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-200">Fuel Efficiency (km/l)</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-6 h-48">
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-1">Overall Average</p>
              <h2 className="text-3xl font-bold text-white mb-2">6.45 <span className="text-lg text-slate-400 font-normal">km/l</span></h2>
              <p className="text-xs text-green-500">↑ 4% vs last week</p>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelData}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#22c55e" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
