import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Route, 
  Wrench, 
  Fuel, 
  FileBarChart2, 
  LogOut 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trips', label: 'Trips Workspace', icon: Route },
    { id: 'vehicles', label: 'Vehicles Registry', icon: Truck },
    { id: 'drivers', label: 'Drivers Directory', icon: Users },
    { id: 'maintenance', label: 'Maintenance Log', icon: Wrench },
    { id: 'expenses', label: 'Fuel & Expenses', icon: Fuel },
    { id: 'reports', label: 'Reports & Analytics', icon: FileBarChart2 }
  ];

  return (
    <aside className="w-64 bg-[#0e1731] border-r border-[#1c2541] flex flex-col min-h-screen">
      
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-[#1c2541] flex items-center gap-3">
        <div className="bg-gradient-to-tr from-[#5bc0be] to-[#3a506b] p-2 rounded-lg">
          <Truck className="h-6 w-6 text-[#0b132b] font-bold" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-wider text-white">TRANSIT<span className="text-[#5bc0be]">OPS</span></h2>
          <p className="text-[10px] text-[#9ca3af] uppercase tracking-widest font-semibold">Dispatcher Hub</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <span className="text-[10px] font-bold text-[#3a506b] uppercase tracking-wider pl-2 block mb-3">Operations</span>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-[#5bc0be] text-[#0b132b] font-semibold shadow-md shadow-[#5bc0be]/10' 
                  : 'text-[#9ca3af] hover:bg-[#1c2541] hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#0b132b]' : 'text-[#9ca3af]'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Profile & Logout Footer */}
      <div className="p-4 border-t border-[#1c2541] bg-[#0b132b]/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-[#1c2541] border border-[#3a506b] flex items-center justify-center font-bold text-[#5bc0be]">
            {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'DS'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Rohit Sharma'}</p>
            <p className="text-xs text-[#9ca3af] truncate">{user?.role || 'Dispatcher'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-[#1c2541]/50 border border-[#3a506b]/40 text-[#ef4444] px-4 py-2 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 transition-all cursor-pointer text-xs font-semibold"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
