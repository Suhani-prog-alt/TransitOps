import React, { useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Bell,
  Globe,
  Calendar,
  Menu,
  ChevronDown,
  LogOut,
  AlertTriangle
} from 'lucide-react';

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const {
    region,
    setRegion,
    dateRange,
    globalSearch,
    setGlobalSearch,
    alerts,
    resolveAlert,
    triggerScan
  } = useFilters();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const regions = ['All Regions', 'North', 'South', 'East', 'West'];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#0B0F19]/80 px-6 backdrop-blur-md">
      {/* Left section: Hamburger & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuToggle}
          className="rounded-xl p-2 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden border border-white/5"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden max-w-xs w-full sm:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search registration, name..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white/[0.03] border border-white/5 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all duration-200"
          />
        </div>
      </div>

      {/* Right section: Filters & Profile */}
      <div className="flex items-center gap-3.5">
        {/* Region Selector */}
        <div className="relative hidden md:block">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-gray-300 font-medium">
            <Globe size={13} className="text-gray-400" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-transparent text-gray-300 focus:outline-none cursor-pointer pr-4 font-semibold appearance-none"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg} className="bg-[#0B0F19] text-gray-300">
                  {reg}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="text-gray-400 absolute right-3 pointer-events-none" />
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-gray-300 font-semibold">
          <Calendar size={13} className="text-gray-400" />
          <span>{dateRange}</span>
        </div>

        {/* Smart scan button */}
        <button
          onClick={triggerScan}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/20 transition-all duration-150"
        >
          Scan Alert
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className={`relative rounded-xl p-2.5 text-gray-400 hover:bg-white/5 hover:text-white border border-white/5 transition-all duration-150 ${
              isNotifOpen ? 'bg-white/5 text-white' : ''
            }`}
          >
            <Bell size={16} />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 bg-[#0B0F19] p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Alerts & Notifications ({alerts.length})</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {alerts.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No active system alerts.</p>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert._id} className="rounded-xl bg-white/[0.02] border border-white/5 p-3 flex flex-col gap-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          size={15}
                          className={`mt-0.5 shrink-0 ${
                            alert.severity === 'critical' ? 'text-brand-red' : 'text-brand-amber'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-white/90 leading-normal">{alert.message}</p>
                          <span className="text-[10px] text-gray-500 font-medium">
                            {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 border-t border-white/5 pt-2 mt-1">
                        <button
                          onClick={() => resolveAlert(alert._id)}
                          className="text-[10px] font-bold text-brand-green hover:underline uppercase tracking-wider"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
              alt={user?.name || 'User'}
              className="h-8.5 w-8.5 rounded-xl object-cover border border-white/10 group-hover:border-brand-blue transition-colors duration-150"
            />
            <div className="hidden xl:block">
              <p className="text-xs font-bold text-white">{user?.name || 'Rohit Sharma'}</p>
              <p className="text-[10px] font-semibold text-gray-400 -mt-0.5">{user?.role || 'Fleet Manager'}</p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/10 bg-[#0B0F19] p-2 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-semibold text-brand-red hover:bg-white/[0.02] rounded-xl transition-colors duration-150"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
