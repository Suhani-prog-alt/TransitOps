import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Lock, Mail, AlertCircle, User, Fingerprint } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('analyst@transitops.com');
  const [password, setPassword] = useState('password123');
  const [employeeId, setEmployeeId] = useState('EMP-4920');
  const [employeeType, setEmployeeType] = useState('Financial Analyst');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !employeeId) {
      setLocalError('Please fill in all security fields.');
      return;
    }

    try {
      setLocalError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role) => {
    if (role === 'analyst') {
      setEmail('analyst@transitops.com');
      setPassword('password123');
      setEmployeeId('EMP-4920');
      setEmployeeType('Financial Analyst');
    } else {
      setEmail('admin@transitops.com');
      setPassword('password123');
      setEmployeeId('EMP-0001');
      setEmployeeType('Fleet Manager');
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accentCyan/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accentGreen/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main glass card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative border border-white/5 z-10">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-gradient-to-tr from-accentCyan to-accentGreen rounded-2xl text-darkBg shadow-glow mb-4">
            <Truck size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide text-white">Transit<span className="text-accentCyan">Ops</span></h1>
          <p className="text-xs text-gray-400 mt-1">Operations Accounting Platform</p>
        </div>

        {localError && (
          <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl mb-6 text-sm">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Employee ID
              </label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-3.5 text-gray-500" size={16} />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="EMP-XXXX"
                  className="w-full bg-white/5 border border-darkBorder rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accentCyan transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Employee Type
              </label>
              <select
                value={employeeType}
                onChange={(e) => setEmployeeType(e.target.value)}
                className="w-full bg-[#151d30] border border-darkBorder rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-accentCyan transition-all duration-300 h-[46px]"
              >
                <option className="bg-[#151d30]" value="Fleet Manager">Fleet Manager</option>
                <option className="bg-[#151d30]" value="Financial Analyst">Financial Analyst</option>
                <option className="bg-[#151d30]" value="Dispatcher">Dispatcher</option>
                <option className="bg-[#151d30]" value="Safety Officer">Safety Officer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@transitops.com"
                className="w-full bg-white/5 border border-darkBorder rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition-all duration-300"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-darkBorder rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition-all duration-300"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accentCyan to-accentGreen text-darkBg hover:shadow-glow font-bold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Login Selector */}
        <div className="mt-8 pt-6 border-t border-darkBorder text-center">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">Quick Credential Selections</p>
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => fillCredentials('analyst')}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs text-accentCyan border border-accentCyan/20 rounded-lg transition-all"
            >
              Financial Analyst
            </button>
            <button
              onClick={() => fillCredentials('admin')}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs text-accentGreen border border-accentGreen/20 rounded-lg transition-all"
            >
              System Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
