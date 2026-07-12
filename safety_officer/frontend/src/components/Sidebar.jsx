import { NavLink } from "react-router-dom"
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  Fuel, 
  BarChart, 
  TrendingUp,
  Settings,
  ShieldCheck,
  HeadphonesIcon
} from "lucide-react"

const navItems = [
  { section: "OPERATIONS", items: [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
    { name: "Vehicles", path: "/vehicles", icon: <Truck size={18} /> },
    { name: "Drivers", path: "/drivers", icon: <Users size={18} /> },
    { name: "Trips", path: "/trips", icon: <Map size={18} /> },
    { name: "Maintenance", path: "/maintenance", icon: <Wrench size={18} /> },
    { name: "Fuel & Expenses", path: "/expenses", icon: <Fuel size={18} /> },
  ]},
  { section: "ANALYTICS", items: [
    { name: "Reports", path: "/reports", icon: <BarChart size={18} /> },
    { name: "Analytics", path: "/analytics", icon: <TrendingUp size={18} /> },
  ]},
  { section: "ADMIN", items: [
    { name: "Users & Roles", path: "/users", icon: <ShieldCheck size={18} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={18} /> },
  ]}
]

export function Sidebar() {
  return (
    <div className="w-[260px] bg-slate-900 h-screen border-r border-slate-800 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <Truck className="text-blue-500 shrink-0" size={32} />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white tracking-wide leading-tight">TRANSITOPS</h1>
          <p className="text-[11px] font-medium text-blue-500 mt-0.5">Smart Transport Operations</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {navItems.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="px-6 text-[10px] font-bold text-slate-500 mb-3 tracking-widest uppercase">
              {group.section}
            </h2>
            <ul className="px-3 space-y-1">
              {group.items.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                        isActive 
                          ? "bg-blue-600 text-white font-medium shadow-sm" 
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`
                    }
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-800 mt-auto">
        <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors cursor-pointer group">
          <div className="bg-slate-800 p-2 rounded-full group-hover:bg-slate-700 transition-colors">
             <HeadphonesIcon size={20} />
          </div>
          <div>
            <p className="text-xs">Need Help?</p>
            <p className="text-sm font-medium text-blue-500">Contact Support</p>
          </div>
        </div>
      </div>
    </div>
  )
}
