import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  Clock,
  ShieldAlert,
  Info
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts"

const statusData = [
  { name: 'Available', value: 49, color: '#10b981' },
  { name: 'On Trip', value: 18, color: '#3b82f6' },
  { name: 'Off Duty', value: 14, color: '#64748b' },
  { name: 'Suspended', value: 5, color: '#ef4444' },
]

const expiryData = [
  { name: 'Expired', value: 2, color: '#ef4444' },
  { name: '< 7 Days', value: 7, color: '#f97316' },
  { name: '< 30 Days', value: 12, color: '#eab308' },
  { name: 'Valid', value: 65, color: '#22c55e' },
]

const scoreData = [
  { name: '90-100', value: 45, color: '#22c55e' },
  { name: '80-89', value: 25, color: '#84cc16' },
  { name: '70-79', value: 10, color: '#eab308' },
  { name: '60-69', value: 4, color: '#f97316' },
  { name: '< 60', value: 2, color: '#ef4444' },
]

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* KPIs Row */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { title: "TOTAL DRIVERS", value: "86", icon: <Users className="text-blue-500" size={24}/> },
          { title: "AVAILABLE", value: "49", icon: <UserCheck className="text-green-500" size={24}/> },
          { title: "ON TRIP", value: "18", icon: <Map className="text-blue-400" size={24}/> },
          { title: "SUSPENDED", value: "5", icon: <UserX className="text-red-500" size={24}/> },
          { title: "EXPIRED LICENSES", value: "2", icon: <AlertTriangle className="text-red-500" size={24}/> },
          { title: "EXPIRING SOON", value: "7", icon: <Clock className="text-orange-500" size={24}/> },
        ].map((kpi, idx) => (
          <Card key={idx} className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-bold text-white">{kpi.value}</h3>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider mt-1">{kpi.title}</p>
                </div>
                {kpi.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        {/* Driver Status Chart */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-200">Driver Status</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {statusData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                  {item.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* License Expiry Chart */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-200">License Expiry Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expiryData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {expiryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Safety Score Chart */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-200">Safety Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        
        {/* Driver Validation Panel (Ineligible) */}
        <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              Dispatch Ineligible Drivers
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white rounded-sm px-1.5 py-0">3</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-sm text-slate-200 font-medium">Alex Johnson</span>
                <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-none">License Expired</Badge>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-sm text-slate-200 font-medium">John Smith</span>
                <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-none">Suspended</Badge>
              </div>
              <div className="flex justify-between items-center pb-3">
                <span className="text-sm text-slate-200 font-medium">Ravi Kumar</span>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-none">Already On Trip</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Alerts */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-200">Recent Driver Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
             <div className="flex gap-4 items-start pb-4 border-b border-slate-800">
              <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-sm text-slate-200"><span className="font-semibold text-white">Driver Alex</span> safety score dropped below 60.</p>
                <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4 items-start pb-4 border-b border-slate-800">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-sm text-slate-200">5 licenses expiring this week.</p>
                <p className="text-xs text-slate-500 mt-1">Today</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <Info className="text-green-500 shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-sm text-slate-200"><span className="font-semibold text-white">Ravi Kumar</span> license renewed.</p>
                <p className="text-xs text-slate-500 mt-1">Yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
