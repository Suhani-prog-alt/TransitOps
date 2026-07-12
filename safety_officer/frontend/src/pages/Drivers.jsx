import { useState } from "react"
import { Users, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  license: z.string().min(5, "License number is required"),
  category: z.string().min(2, "Category is required"),
  expiry: z.string().refine((date) => new Date(date) > new Date(), {
    message: "License must not be expired",
  }),
  contact: z.string().min(10, "Contact number is invalid"),
})

const initialDrivers = [
  { id: "DRV-101", name: "Alex Johnson", license: "DL-192837", category: "Heavy", expiry: "2025-06-15", status: "Available", score: 98 },
  { id: "DRV-102", name: "Ravi Kumar", license: "DL-938472", category: "Heavy", expiry: "2025-05-18", status: "On Trip", score: 85 },
  { id: "DRV-103", name: "Suresh Patel", license: "DL-456789", category: "Light", expiry: "2024-12-01", status: "Suspended", score: 45 },
]

export function Drivers() {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      license: "",
      category: "Heavy",
      expiry: "",
      contact: "",
    },
  })

  function onSubmit(values) {
    const newDriver = {
      id: `DRV-${Math.floor(Math.random() * 900) + 100}`,
      name: values.name,
      license: values.license,
      category: values.category,
      expiry: values.expiry,
      status: "Available",
      score: 100, // new drivers start at 100
    }
    setDrivers([newDriver, ...drivers])
    setIsOpen(false)
    form.reset()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Driver Management</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus size={16} /> Add New Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 text-white border-slate-800">
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
              <DialogDescription className="text-slate-400">
                Register a new driver to the fleet. The license must be currently valid.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="bg-slate-800 border-slate-700 text-white" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="license"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="DL-XXXXXX" className="bg-slate-800 border-slate-700 text-white" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Heavy / Light" className="bg-slate-800 border-slate-700 text-white" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" className="bg-slate-800 border-slate-700 text-white" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" className="bg-slate-800 border-slate-700 text-white" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Save Driver</Button>
              </form>
            </Form>

          </DialogContent>
        </Dialog>

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
