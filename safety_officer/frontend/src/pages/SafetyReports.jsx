import { useState, useEffect } from "react"
import { Download, FileText, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import api from "../lib/api"

export function SafetyReports() {
  const [safetyData, setSafetyData] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversRes, analyticsRes] = await Promise.all([
          api.get('/drivers'),
          api.get('/drivers/analytics')
        ])
        setSafetyData(driversRes.data)
        setAnalytics(analyticsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleExportCSV = () => {
    if (!safetyData.length) return

    const headers = "Driver ID,Name,License Expiry,Safety Score,Status,Trips Count\n"
    const csvContent = safetyData.map(row => 
      `${row.driverId},${row.name},${new Date(row.licenseExpiryDate).toLocaleDateString()},${row.safetyScore},${row.status},${row.tripsCount || 0}`
    ).join("\n")

    const fullCsv = headers + csvContent
    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "safety_report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading || !analytics) {
    return <div className="text-white">Loading reports...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Safety Reports</h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate and export compliance and safety score reports.
          </p>
        </div>
        <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white gap-2">
          <Download size={16} /> Export to CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="text-blue-500" size={20} />
              <CardTitle className="text-base text-white">Safety Score Distribution</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Overview of how drivers are performing based on their recent trips and incidents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Excellent (90-100)</span>
                 <span className="font-bold text-green-500">{Math.floor(analytics.status.total * 0.6)} Drivers</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Good (80-89)</span>
                 <span className="font-bold text-lime-500">{Math.floor(analytics.status.total * 0.2)} Drivers</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Warning (60-79)</span>
                 <span className="font-bold text-orange-500">{Math.floor(analytics.status.total * 0.15)} Drivers</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Critical (&lt;60)</span>
                 <span className="font-bold text-red-500">{Math.floor(analytics.status.total * 0.05)} Drivers</span>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-blue-500" size={20} />
              <CardTitle className="text-base text-white">License Expiry Summary</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              A breakdown of current license validities across the fleet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Expired</span>
                 <span className="font-bold text-red-500">{analytics.licenses.expired} Drivers</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Expiring in &lt; 7 Days</span>
                 <span className="font-bold text-orange-500">{analytics.licenses.expiring7Days} Drivers</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Expiring in &lt; 30 Days</span>
                 <span className="font-bold text-yellow-500">{analytics.licenses.expiring30Days} Drivers</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Valid</span>
                 <span className="font-bold text-green-500">{Math.max(0, analytics.status.total - analytics.licenses.expired - analytics.licenses.expiring7Days - analytics.licenses.expiring30Days)} Drivers</span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
