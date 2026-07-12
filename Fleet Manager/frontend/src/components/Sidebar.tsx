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
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5 bg-[#0B0F19] transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header/Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue">
              <Truck size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white">TRANSITOPS</span>
              <p className="text-[10px] font-semibold text-brand-blue uppercase tracking-widest -mt-1">Fleet Manager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20 shadow-md shadow-blue-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={18}
                  className="transition-colors duration-200 group-hover:text-white"
                />
                <span>{item.name}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1.5 text-[10px] font-bold text-white shadow-lg shadow-red-500/20">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        {/* Support Card - matches visual inspiration */}
        <div className="p-4 border-t border-white/5">
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 flex gap-3.5 items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400">
              <HelpCircle size={20} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Need Help?</h4>
              <button className="text-[11px] font-medium text-brand-blue hover:underline">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
