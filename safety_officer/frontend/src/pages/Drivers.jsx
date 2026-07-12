import { Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const drivers = [
  { id: "DRV-101", name: "Alex Johnson", license: "DL-192837", category: "Heavy", expiry: "2025-06-15", status: "Available", score: 98 },
  { id: "DRV-102", name: "Ravi Kumar", license: "DL-938472", category: "Heavy", expiry: "2025-05-18", status: "On Trip", score: 85 },
  { id: "DRV-103", name: "Suresh Patel", license: "DL-456789", category: "Light", expiry: "2024-12-01", status: "Suspended", score: 45 },
]

export function Drivers() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Driver Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Add New Driver</Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-200">All Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">ID</TableHead>
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">License No.</TableHead>
                <TableHead className="text-slate-400">Expiry Date</TableHead>
                <TableHead className="text-slate-400">Safety Score</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors text-slate-300">
                  <TableCell className="font-medium text-white">{driver.id}</TableCell>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver.license}</TableCell>
                  <TableCell className={new Date(driver.expiry) < new Date() ? "text-red-500 font-semibold" : ""}>
                    {driver.expiry}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${driver.score > 90 ? 'bg-green-500/10 text-green-500' : driver.score < 60 ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {driver.score} / 100
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      driver.status === 'Available' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 
                      driver.status === 'On Trip' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : 
                      'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    } variant="outline" style={{ border: 'none' }}>
                      {driver.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">Edit</Button>
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
