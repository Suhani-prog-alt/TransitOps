import { Bell, Search, MapPin, Calendar, User } from "lucide-react"

export function Topbar() {
  return (
    <div className="h-20 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-slate-800 border border-slate-700 rounded-md pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300">
          <MapPin size={16} className="text-slate-500" />
          <select className="bg-transparent border-none focus:outline-none text-sm appearance-none outline-none">
            <option>All Regions</option>
            <option>North</option>
            <option>South</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300">
          <Calendar size={16} className="text-slate-500" />
          <span>12 May 2025 - 18 May 2025</span>
        </div>

        <div className="relative cursor-pointer">
          <Bell className="text-slate-400 hover:text-white transition-colors" size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] flex items-center justify-center rounded-full text-white font-bold">
            3
          </span>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-700 pl-6">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <User size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-white leading-tight">Rohit Sharma</p>
            <p className="text-xs text-slate-400">Safety Officer</p>
          </div>
        </div>
      </div>
    </div>
  )
}
