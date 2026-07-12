import { useState, useEffect } from "react"
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  Clock,
  ShieldAlert,
  Info,
  Map
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
import api from "../lib/api"

export function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [ineligible, setIneligible] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/drivers/analytics')
        setAnalytics(res.data)
        
        const eligRes = await api.get('/drivers/eligibility')
        setIneligible(eligRes.data.slice(0, 5)) // Get top 5 for panel
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  if (!analytics) return <div className="text-white">Loading...</div>

  const statusData = [
    { name: 'Available', value: analytics.status.available, color: '#10b981' },
    { name: 'On Trip', value: analytics.status.onTrip, color: '#3b82f6' },
    { name: 'Suspended', value: analytics.status.suspended, color: '#ef4444' },
    { name: 'Off Duty', value: Math.max(0, analytics.status.total - analytics.status.available - analytics.status.onTrip - analytics.status.suspended), color: '#64748b' },
  ]

  const expiryData = [
    { name: 'Expired', value: analytics.licenses.expired, color: '#ef4444' },
    { name: '< 7 Days', value: analytics.licenses.expiring7Days, color: '#f97316' },
    { name: '< 30 Days', value: analytics.licenses.expiring30Days, color: '#eab308' },
    { name: 'Valid', value: Math.max(0, analytics.status.total - analytics.licenses.expired - analytics.licenses.expiring7Days - analytics.licenses.expiring30Days), color: '#22c55e' },
  ]

  // Placeholder distribution until we build full score logic on backend
  const scoreData = [
    { name: '90-100', value: Math.floor(analytics.status.total * 0.6), color: '#22c55e' },
    { name: '80-89', value: Math.floor(analytics.status.total * 0.2), color: '#84cc16' },
    { name: '70-79', value: Math.floor(analytics.status.total * 0.1), color: '#eab308' },
    { name: '60-69', value: Math.floor(analytics.status.total * 0.05), color: '#f97316' },
    { name: '< 60', value: Math.floor(analytics.status.total * 0.05), color: '#ef4444' },
  ]

  return (
    <div className="flex flex-col gap-6">
      
      {/* KPIs Row */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { title: "TOTAL DRIVERS", value: analytics.status.total, icon: <Users className="text-blue-500" size={24}/> },
          { title: "AVAILABLE", value: analytics.status.available, icon: <UserCheck className="text-green-500" size={24}/> },
          { title: "ON TRIP", value: analytics.status.onTrip, icon: <Map className="text-blue-400" size={24}/> },
          { title: "SUSPENDED", value: analytics.status.suspended, icon: <UserX className="text-red-500" size={24}/> },
          { title: "EXPIRED LICENSES", value: analytics.licenses.expired, icon: <AlertTriangle className="text-red-500" size={24}/> },
          { title: "EXPIRING SOON", value: analytics.licenses.expiring7Days, icon: <Clock className="text-orange-500" size={24}/> },
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
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white rounded-sm px-1.5 py-0">{ineligible.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {ineligible.length === 0 ? (
                <p className="text-slate-400 text-sm">No ineligible drivers found.</p>
              ) : ineligible.map((drv, i) => (
                <div key={drv._id} className={`flex justify-between items-center ${i !== ineligible.length - 1 ? 'pb-3 border-b border-slate-800' : ''}`}>
                  <span className="text-sm text-slate-200 font-medium">{drv.name}</span>
                  <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-none">
                    {new Date(drv.licenseExpiryDate) < new Date() ? 'License Expired' : 'Suspended'}
                  </Badge>
                </div>
              ))}
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
                <p className="text-sm text-slate-200"><span className="font-semibold text-white">System Alert</span>: Found {analytics.licenses.expired} expired licenses.</p>
                <p className="text-xs text-slate-500 mt-1">Just now</p>
              </div>
            </div>
            <div className="flex gap-4 items-start pb-4 border-b border-slate-800">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-sm text-slate-200">{analytics.licenses.expiring7Days} licenses expiring this week.</p>
                <p className="text-xs text-slate-500 mt-1">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
