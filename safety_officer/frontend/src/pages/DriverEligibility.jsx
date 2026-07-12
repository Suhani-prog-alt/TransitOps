import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import api from "../lib/api"

export function DriverEligibility() {
  const [ineligibleDrivers, setIneligibleDrivers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        const res = await api.get('/drivers/eligibility')
        // Process reasons and severity based on data
        const processed = res.data.map(driver => {
          let reason = ''
          let severity = 'Medium'
          
          if (new Date(driver.licenseExpiryDate) < new Date()) {
            reason = 'License Expired'
            severity = 'High'
          } else if (driver.status === 'Suspended') {
            reason = 'Suspended'
            severity = 'High'
          }
          
          return {
            ...driver,
            reason,
            severity
          }
        })
        setIneligibleDrivers(processed)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchEligibility()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Driver Eligibility</h1>
        <p className="text-sm text-slate-400 mt-1">
          Displays drivers who currently cannot be assigned to any dispatch based on mandatory business rules.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-200">Dispatch Ineligible Drivers</CardTitle>
          <CardDescription className="text-slate-500">
            Drivers with expired licenses or Suspended status cannot be assigned to trips.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Driver</TableHead>
                <TableHead className="text-slate-400">License No.</TableHead>
                <TableHead className="text-slate-400">Reason</TableHead>
                <TableHead className="text-slate-400 text-right">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-4 text-slate-500">Loading...</TableCell></TableRow>
              ) : ineligibleDrivers.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-4 text-slate-500">All drivers are eligible.</TableCell></TableRow>
              ) : ineligibleDrivers.map((item) => (
                <TableRow key={item._id} className="border-slate-800 hover:bg-slate-800/50 transition-colors text-slate-300">
                  <TableCell className="font-medium text-white">{item.name}</TableCell>
                  <TableCell>{item.licenseNumber}</TableCell>
                  <TableCell>
                     <Badge variant="outline" className={`border-none ${
                        item.reason === 'License Expired' || item.reason === 'Suspended' ? 'bg-red-500/10 text-red-500' : 
                        item.reason === 'Safety Score Below 60' ? 'bg-orange-500/10 text-orange-500' : 
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {item.reason}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`text-xs font-bold ${
                      item.severity === 'High' ? 'text-red-500' : 
                      item.severity === 'Medium' ? 'text-orange-500' : 
                      'text-blue-500'
                    }`}>
                      {item.severity}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
