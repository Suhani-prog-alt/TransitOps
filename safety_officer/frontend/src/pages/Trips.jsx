import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import dispatcherApi from "../lib/dispatcherApi"

export function Trips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await dispatcherApi.get('/trips')
        setTrips(res.data.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTrips()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Trips (Read Only)</h1>
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-200">Trip History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Route</TableHead>
                <TableHead className="text-slate-400">Vehicle</TableHead>
                <TableHead className="text-slate-400">Driver</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-4">Loading data...</TableCell></TableRow>
              ) : trips.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-4">No trips found.</TableCell></TableRow>
              ) : trips.map((item) => (
                <TableRow key={item._id} className="border-slate-800 hover:bg-slate-800/50 transition-colors text-slate-300">
                  <TableCell className="font-medium text-white">{item.routeName}</TableCell>
                  <TableCell>{item.vehicle?.name || item.vehicle || 'N/A'}</TableCell>
                  <TableCell>{item.driver?.name || item.driver || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      item.status === 'Completed' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {item.status}
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
