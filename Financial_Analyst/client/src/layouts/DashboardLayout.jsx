import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Fuel,
  CreditCard,
  DollarSign,
  TrendingUp,
  FileText,
  BarChart3,
  Settings,
  User,
  LogOut,
  Bell,
  Search,
  Calendar,
  Filter,
  Globe,
  Truck
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Filters State
  const [globalSearch, setGlobalSearch] = useState('');
  const [dateRange, setDateRange] = useState('180'); // default last 180 days (6 months)
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'Fuel Budget Exceeded for Truck-04 (South)', type: 'error', time: '10m ago' },
    { id: 2, text: 'Monthly ROI Summary Report generated', type: 'info', time: '1h ago' },
    { id: 3, text: 'High Maintenance Cost detected for Truck-07', type: 'warning', time: '3h ago' },
    { id: 4, text: 'Expense Approved: EXP-0042 ($450.00)', type: 'success', time: '5h ago' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Fuel Logs', path: '/fuel', icon: Fuel },
    { name: 'Expense Logs', path: '/expenses', icon: CreditCard },
    { name: 'Operational Cost', path: '/operational-cost', icon: DollarSign },
    { name: 'Profitability', path: '/profitability', icon: TrendingUp },
    { name: 'ROI', path: '/roi', icon: DollarSign },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  const vehicles = ['Truck-01', 'Truck-02', 'Truck-03', 'Truck-04', 'Truck-05', 'Truck-06', 'Truck-07', 'Truck-08', 'Truck-09', 'Truck-10'];
  const regions = ['North', 'East', 'West', 'South'];

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-slate-100 overflow-x-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 glass-panel border-r border-darkBorder hidden md:flex flex-col z-20 sticky top-0 h-screen">
        {/* Brand Logo */}
        <div className="p-6 border-b border-darkBorder flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-accentCyan to-accentGreen rounded-xl text-darkBg shadow-glow">
            <Truck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">Transit<span className="text-accentCyan">Ops</span></h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Financial Analyst</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-accentCyan/15 to-transparent text-white border-l-4 border-accentCyan shadow-inner'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComponent
                  size={18}
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-accentCyan' : 'text-gray-400 group-hover:text-white'
                  }`}
                />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-darkBorder">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* NAVBAR */}
        <header className="sticky top-0 z-30 glass-panel border-b border-darkBorder p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Title & Page context */}
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold tracking-tight text-white uppercase md:hidden">TransitOps</h2>
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-white">
                {navItems.find((item) => item.path === location.pathname)?.name || 'Dashboard'}
              </h2>
              <p className="text-xs text-gray-500">Transit fleet operations accounting ledger</p>
            </div>
          </div>

          {/* Search bar & notification button */}
          <div className="flex flex-1 max-w-md items-center relative">
            <Search className="absolute left-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Global Search Logs..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-white/5 border border-darkBorder rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition-all duration-300"
            />
          </div>

          {/* Header Controls and User Panel */}
          <div className="flex items-center space-x-4 justify-end">
            
            {/* Filter controls */}
            <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-darkBorder">
              {/* Date Filter */}
              <div className="flex items-center px-2 py-1 text-xs text-gray-400 border-r border-darkBorder">
                <Calendar size={14} className="mr-1 text-accentCyan" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option className="bg-[#151d30] text-white" value="30">Last 30 Days</option>
                  <option className="bg-[#151d30] text-white" value="90">Last 90 Days</option>
                  <option className="bg-[#151d30] text-white" value="180">Last 180 Days</option>
                  <option className="bg-[#151d30] text-white" value="365">Last 365 Days</option>
                </select>
              </div>

              {/* Vehicle Filter */}
              <div className="flex items-center px-2 py-1 text-xs text-gray-400 border-r border-darkBorder">
                <Filter size={14} className="mr-1 text-accentCyan" />
                <select
                  value={vehicleFilter}
                  onChange={(e) => setVehicleFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option className="bg-[#151d30] text-white" value="">All Vehicles</option>
                  {vehicles.map(v => <option className="bg-[#151d30] text-white" key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* Region Filter */}
              <div className="flex items-center px-2 py-1 text-xs text-gray-400">
                <Globe size={14} className="mr-1 text-accentCyan" />
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option className="bg-[#151d30] text-white" value="">All Regions</option>
                  {regions.map(r => <option className="bg-[#151d30] text-white" key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-300 relative"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-[#080d1a] border border-darkBorder rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 border-b border-darkBorder bg-white/5 flex justify-between items-center">
                    <span className="font-semibold text-sm">Notifications</span>
                    <button className="text-xs text-accentCyan hover:underline" onClick={() => setShowNotifications(false)}>
                      Close
                    </button>
                  </div>
                  <div className="divide-y divide-darkBorder max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-white/5 transition-colors">
                        <p className="text-xs text-gray-200">{n.text}</p>
                        <span className="text-[10px] text-gray-500 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Badge */}
            <div className="flex items-center space-x-3 border-l border-darkBorder pl-4">
              <div className="w-9 h-9 bg-accentCyan/20 border border-accentCyan/40 rounded-xl flex items-center justify-center font-bold text-accentCyan shadow-inner">
                FA
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-white">{user?.username || 'Analyst'}</p>
                <p className="text-[10px] text-gray-400">Financial Analyst</p>
              </div>
            </div>
            
          </div>
        </header>

        {/* MAIN BODY PAGES OUTLET */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet context={{ globalSearch, dateRange, vehicleFilter, regionFilter }} />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
