import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Wrench,
  BarChart3,
  FileText,
  AlertTriangle,
  Settings,
  HelpCircle,
  X
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { alerts } = useFilters();
  const activeAlertsCount = alerts.length;

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Vehicle Registry', path: '/vehicles', icon: Truck },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Fleet Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Fleet Alerts', path: '/alerts', icon: AlertTriangle, badge: activeAlertsCount },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#1c2541] bg-[#0e1731] transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-[#1c2541] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-[#5bc0be] to-[#3a506b] p-2 rounded-lg">
              <Truck className="h-6 w-6 text-[#0b132b] font-bold" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wider text-white">TRANSIT<span className="text-[#5bc0be]">OPS</span></h2>
              <p className="text-[10px] text-[#5bc0be] uppercase tracking-widest font-bold">Fleet Manager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[#9ca3af] hover:bg-[#1c2541] hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <span className="text-[10px] font-bold text-[#3a506b] uppercase tracking-wider pl-2 block mb-3">Operations</span>
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#5bc0be] text-[#0b132b] font-semibold shadow-md shadow-[#5bc0be]/10'
                    : 'text-[#9ca3af] hover:bg-[#1c2541] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 flex-1">
                    <item.icon
                      size={18}
                      className={isActive ? 'text-[#0b132b]' : 'text-[#9ca3af]'}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1.5 text-[10px] font-bold text-white shadow-lg shadow-red-500/20">
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Support Card - matches visual inspiration */}
        <div className="p-4 border-t border-[#1c2541] bg-[#0b132b]/50">
          <div className="rounded-2xl bg-[#1c2541]/50 border border-[#3a506b]/40 p-4 flex gap-3.5 items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b132b] border border-[#3a506b]/40 text-[#5bc0be]">
              <HelpCircle size={20} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Need Help?</h4>
              <button className="text-[11px] font-medium text-[#5bc0be] hover:underline">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
