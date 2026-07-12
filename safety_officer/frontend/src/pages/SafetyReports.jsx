import { Download, FileText, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const safetyData = [
  { driverId: "DRV-101", name: "Alex Johnson", licenseExpiry: "2024-05-14", safetyScore: 98, status: "Available" },
  { driverId: "DRV-102", name: "Michael Chang", licenseExpiry: "2024-05-30", safetyScore: 85, status: "Available" },
  { driverId: "DRV-103", name: "Priya Patel", licenseExpiry: "2024-06-15", safetyScore: 72, status: "Available" },
  { driverId: "DRV-104", name: "Ravi Kumar", licenseExpiry: "2025-05-18", safetyScore: 88, status: "On Trip" },
  { driverId: "DRV-105", name: "John Smith", licenseExpiry: "2025-08-22", safetyScore: 55, status: "Suspended" },
]

export function SafetyReports() {

  const handleExportCSV = () => {
    // Basic CSV generation
    const headers = "Driver ID,Name,License Expiry,Safety Score,Status\n"
    const csvContent = safetyData.map(row => 
      `${row.driverId},${row.name},${row.licenseExpiry},${row.safetyScore},${row.status}`
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
                 <span className="font-bold text-green-500">45 Drivers</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Good (80-89)</span>
                 <span className="font-bold text-lime-500">25 Drivers</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Warning (60-79)</span>
                 <span className="font-bold text-orange-500">14 Drivers</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Critical (&lt;60)</span>
                 <span className="font-bold text-red-500">2 Drivers</span>
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
                 <span className="font-bold text-red-500">2 Drivers</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Expiring in &lt; 7 Days</span>
                 <span className="font-bold text-orange-500">7 Drivers</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Expiring in &lt; 30 Days</span>
                 <span className="font-bold text-yellow-500">12 Drivers</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Valid</span>
                 <span className="font-bold text-green-500">65 Drivers</span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
