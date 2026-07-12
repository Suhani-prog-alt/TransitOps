import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Database, ShieldAlert, BadgeDollarSign } from 'lucide-react';

const Settings = () => {
  const [currency, setCurrency] = useState('USD');
  const [fuelBudget, setFuelBudget] = useState('50000');
  const [maintenanceLimit, setMaintenanceLimit] = useState('30000');
  const [roiTarget, setRoiTarget] = useState('15');

  const handleSave = (e) => {
    e.preventDefault();
    alert('TransitOps System configuration settings updated successfully.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">ERP Operations Settings</h2>
        <p className="text-xs text-gray-500">Configure financial thresholds, budgets, and calculation parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FINANCIAL PREFERENCES */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder lg:col-span-2">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center">
            <BadgeDollarSign size={16} className="mr-2 text-accentCyan" /> General Financial Policies
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Standard Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                >
                  <option value="USD">United States Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Target ROI Yield (%)</label>
                <input
                  type="number"
                  value={roiTarget}
                  onChange={(e) => setRoiTarget(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Monthly Fuel Cap Alert ($)</label>
                <input
                  type="number"
                  value={fuelBudget}
                  onChange={(e) => setFuelBudget(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Maintenance Cap Alert ($)</label>
                <input
                  type="number"
                  value={maintenanceLimit}
                  onChange={(e) => setMaintenanceLimit(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accentCyan"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 bg-gradient-to-r from-accentCyan to-accentGreen text-darkBg font-bold py-2 px-4 rounded-xl hover:shadow-glow transition-all"
              >
                <Save size={14} />
                <span>Save Policies</span>
              </button>
            </div>
          </form>
        </div>

        {/* SYSTEM STATS */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder h-fit space-y-4">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center">
            <Database size={16} className="mr-2 text-accentGreen" /> Server Status
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">Database Engine:</span> <span className="text-white font-semibold">MongoDB Atlas</span></div>
            <div className="flex justify-between"><span className="text-gray-400">API Host:</span> <span className="text-accentCyan font-mono">http://localhost:5000</span></div>
            <div className="flex justify-between"><span className="text-gray-400">DB Seeding Status:</span> <span className="text-accentGreen font-bold">Populated & Online</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Connection Latency:</span> <span className="text-white">12 ms</span></div>
          </div>

          <hr className="border-white/5" />

          <h3 className="text-xs font-bold text-white mb-2 flex items-center">
            <ShieldAlert size={14} className="mr-2 text-accentOrange" /> Analyst Security Level
          </h3>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Your login operates on a Role-Based Security token. Writing data is authorized exclusively for Fuel and Expense ledgers. Modify actions are monitored for compliance.
          </p>
        </div>

      </div>

    </div>
  );
};

export default Settings;
