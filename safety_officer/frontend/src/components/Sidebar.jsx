import { NavLink } from "react-router-dom"
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  BarChart, 
  Settings,
  ShieldCheck,
  HeadphonesIcon,
  ShieldAlert,
  FileText,
  UserCheck
} from "lucide-react"

const navItems = [
  { section: "SAFETY & COMPLIANCE", items: [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
    { name: "Driver Management", path: "/drivers", icon: <Users size={18} /> },
    { name: "License Monitoring", path: "/licenses", icon: <FileText size={18} /> },
    { name: "Driver Eligibility", path: "/eligibility", icon: <UserCheck size={18} /> },
    { name: "Safety Reports", path: "/reports", icon: <ShieldAlert size={18} /> },
  ]},
  { section: "READ ONLY", items: [
    { name: "Vehicles", path: "/vehicles", icon: <Truck size={18} /> },
    { name: "Trips", path: "/trips", icon: <Map size={18} /> },
    { name: "Maintenance", path: "/maintenance", icon: <Wrench size={18} /> },
  ]},
  { section: "ADMIN", items: [
    { name: "Users & Roles", path: "/users", icon: <ShieldCheck size={18} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={18} /> },
  ]}
]

export function Sidebar() {
  return (
    <div className="w-64 bg-[#0e1731] h-screen border-r border-[#1c2541] flex flex-col">
      <div className="p-6 border-b border-[#1c2541] flex items-center gap-3">
        <div className="bg-gradient-to-tr from-[#5bc0be] to-[#3a506b] p-2 rounded-lg">
          <Truck className="h-6 w-6 text-[#0b132b] font-bold" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-wider text-white">TRANSIT<span className="text-[#5bc0be]">OPS</span></h2>
          <p className="text-[10px] text-[#5bc0be] uppercase tracking-widest font-bold">Safety Officer</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {navItems.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="text-[10px] font-bold text-[#3a506b] uppercase tracking-wider pl-2 block mb-3">
              {group.section}
            </h2>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? "bg-[#5bc0be] text-[#0b132b] font-semibold shadow-md shadow-[#5bc0be]/10" 
                          : "text-[#9ca3af] hover:bg-[#1c2541] hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          {React.cloneElement(item.icon, { 
                            className: isActive ? 'text-[#0b132b]' : 'text-[#9ca3af]' 
                          })}
                          <span className="text-sm">{item.name}</span>
                        </div>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[#1c2541] bg-[#0b132b]/50">
        <div className="rounded-2xl bg-[#1c2541]/50 border border-[#3a506b]/40 p-4 flex gap-3.5 items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b132b] border border-[#3a506b]/40 text-[#5bc0be]">
             <HeadphonesIcon size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Need Help?</p>
            <p className="text-[11px] font-medium text-[#5bc0be] hover:underline cursor-pointer">Contact Support</p>
          </div>
        </div>
      </div>
    </div>
  )
}
