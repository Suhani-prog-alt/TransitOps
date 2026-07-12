import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Key, Mail, CheckCircle2, XCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  const permissions = [
    { name: 'Review Fuel Consumption & Costs', allowed: true },
    { name: 'Review Operational Expenses', allowed: true },
    { name: 'Review Maintenance Budgets & Cost', allowed: true },
    { name: 'Review ROI calculations', allowed: true },
    { name: 'Generate & Export Financial Audits', allowed: true },
    { name: 'Add/Edit Fuel Transaction Logs', allowed: true },
    { name: 'Add/Edit Fleet Expense Vouchers', allowed: true },
    { name: 'Add/Edit Fleet Vehicles', allowed: false },
    { name: 'Dispatch & Create Route Trips', allowed: false },
    { name: 'Modify Drivers Assignments', allowed: false }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">User Security Profile</h2>
        <p className="text-xs text-gray-500">Access credential logs and permissions details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PROFILE CARD */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 bg-accentCyan/15 border-2 border-accentCyan/30 rounded-2xl flex items-center justify-center font-bold text-3xl text-accentCyan shadow-glow">
            FA
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase">{user?.username || 'Analyst'}</h3>
            <p className="text-xs text-accentCyan font-medium mt-0.5">Financial Analyst</p>
          </div>
          <div className="w-full text-xs text-gray-400 pt-4 border-t border-white/5 space-y-2 text-left">
            <div className="flex items-center space-x-2">
              <Mail size={14} className="text-gray-500" />
              <span>{user?.email || 'analyst@transitops.com'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield size={14} className="text-gray-500" />
              <span>RBAC Token Verified</span>
            </div>
          </div>
        </div>

        {/* PERMISSIONS MATRIX */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center">
            <Shield size={16} className="mr-2 text-accentGreen" /> Functional Permissions Matrix
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissions.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-darkBorder">
                <span className="text-xs text-gray-300">{p.name}</span>
                {p.allowed ? (
                  <CheckCircle2 size={16} className="text-accentGreen flex-shrink-0 ml-2" />
                ) : (
                  <XCircle size={16} className="text-accentRed flex-shrink-0 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Profile;
