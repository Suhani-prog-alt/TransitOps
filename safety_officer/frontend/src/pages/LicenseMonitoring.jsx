import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import api from "../lib/api"

export function LicenseMonitoring() {
  const [licenseData, setLicenseData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await api.get('/drivers')
        const processedData = res.data.map(driver => {
          const expiryDate = new Date(driver.licenseExpiryDate)
          const today = new Date()
          const diffTime = expiryDate - today
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return {
            ...driver,
            daysLeft: diffDays
          }
        })
        setLicenseData(processedData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDrivers()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">License Monitoring</h1>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-200">License Expiry Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Driver</TableHead>
                <TableHead className="text-slate-400">License No.</TableHead>
                <TableHead className="text-slate-400">Expiry Date</TableHead>
                <TableHead className="text-slate-400 text-right">Days Left</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-4">Loading data...</TableCell></TableRow>
              ) : licenseData.map((item) => (
                <TableRow key={item._id} className="border-slate-800 hover:bg-slate-800/50 transition-colors text-slate-300">
                  <TableCell className="font-medium text-white">{item.name}</TableCell>
                  <TableCell>{item.licenseNumber}</TableCell>
                  <TableCell>{new Date(item.licenseExpiryDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      item.daysLeft < 0 ? 'bg-red-500/20 text-red-500' : 
                      item.daysLeft <= 7 ? 'bg-orange-500/20 text-orange-500' : 
                      item.daysLeft <= 30 ? 'bg-yellow-500/20 text-yellow-500' : 
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {item.daysLeft < 0 ? 'Expired' : `${item.daysLeft} Days`}
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
