import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const licenseData = [
  { driver: "Alex Johnson", license: "DL-192837", expiry: "2024-05-14", daysLeft: -12, status: "Expired" },
  { driver: "Michael Chang", license: "DL-109238", expiry: "2024-05-30", daysLeft: 4, status: "Less than 7 days" },
  { driver: "Priya Patel", license: "DL-837465", expiry: "2024-06-15", daysLeft: 20, status: "Less than 30 days" },
  { driver: "Ravi Kumar", license: "DL-938472", expiry: "2025-05-18", daysLeft: 358, status: "Valid" },
]

export function LicenseMonitoring() {
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
              {licenseData.map((item, idx) => (
                <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/50 transition-colors text-slate-300">
                  <TableCell className="font-medium text-white">{item.driver}</TableCell>
                  <TableCell>{item.license}</TableCell>
                  <TableCell>{item.expiry}</TableCell>
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
