import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import dispatcherApi from "../lib/dispatcherApi"

export function Maintenance() {
  const [maintenance, setMaintenance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await dispatcherApi.get('/maintenance')
        setMaintenance(res.data.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMaintenance()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Maintenance (Read Only)</h1>
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-200">Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Vehicle</TableHead>
                <TableHead className="text-slate-400">Task</TableHead>
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-4">Loading data...</TableCell></TableRow>
              ) : maintenance.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-4">No maintenance records found.</TableCell></TableRow>
              ) : maintenance.map((item) => (
                <TableRow key={item._id} className="border-slate-800 hover:bg-slate-800/50 transition-colors text-slate-300">
                  <TableCell className="font-medium text-white">{item.vehicle?.registrationNumber || item.vehicle || 'N/A'}</TableCell>
                  <TableCell>{item.taskDescription || item.task}</TableCell>
                  <TableCell>{new Date(item.date || item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-green-500 font-medium">${item.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
