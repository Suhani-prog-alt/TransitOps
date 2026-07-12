import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Truck, ShieldAlert, ShieldCheck, UserPlus, LogIn } from 'lucide-react';

const Login = () => {
  const { login, register, error: authError } = useContext(AuthContext);
  
  // Auth Mode: 'signin' or 'signup'
  const [mode, setMode] = useState('signin');
  
  // Input Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Serves as the Employee ID (e.g. FA-1, D-1)
  const [role, setRole] = useState('Dispatcher');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'signin') {
      const result = await login(email, password);
      setLoading(false);
      if (!result.success) {
        setError(result.message || 'Invalid email or password');
      }
    } else {
      if (!name.trim()) {
        setError('Please specify an Employee ID / Name');
        setLoading(false);
        return;
      }
      
      const result = await register(name.trim(), email, password, role);
      setLoading(false);
      if (result.success) {
        setSuccess('Registration successful! Logging in...');
      } else {
        setError(result.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b132b] px-4 py-8">
      <div className="relative w-full max-w-md bg-[#1c2541]/80 backdrop-blur-md border border-[#3a506b] p-8 rounded-2xl shadow-2xl animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-tr from-[#5bc0be] to-[#3a506b] p-3 rounded-xl mb-3 shadow-lg shadow-[#5bc0be]/20">
            <Truck className="h-8 w-8 text-[#0b132b] font-bold" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">TRANSIT<span className="text-[#5bc0be]">OPS</span></h1>
          <p className="text-[#9ca3af] text-sm mt-1">Smart Transport Operations Platform</p>
        </div>

        {/* Modern Switcher Tabs */}
        <div className="grid grid-cols-2 bg-[#0b132b] p-1 rounded-xl mb-6 border border-[#3a506b]/40">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
              setSuccess('');
            }}
            className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              mode === 'signin' 
                ? 'bg-[#5bc0be] text-[#0b132b] shadow-md' 
                : 'text-[#9ca3af] hover:text-white'
            }`}
          >
            Sign In (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccess('');
            }}
            className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              mode === 'signup' 
                ? 'bg-[#5bc0be] text-[#0b132b] shadow-md' 
                : 'text-[#9ca3af] hover:text-white'
            }`}
          >
            Sign Up (Create Account)
          </button>
        </div>

        {/* Error Alert */}
        {(error || authError) && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs p-3.5 rounded-xl flex items-start gap-2 mb-5 animate-fade-in">
            <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
            <span>{error || authError}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-200 text-xs p-3.5 rounded-xl flex items-start gap-2 mb-5 animate-fade-in">
            <ShieldCheck className="h-4.5 w-4.5 text-green-400 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Forms Panel */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              {/* Role Selector Dropdown */}
              <div className="animate-fade-in">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9ca3af] mb-1">
                  Choose System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be] text-sm cursor-pointer"
                  required
                >
                  <option value="Dispatcher">Dispatcher (Operations)</option>
                  <option value="Fleet Manager">Fleet Manager (Assets)</option>
                  <option value="Safety Officer">Safety Officer (Compliance)</option>
                  <option value="Financial Analyst">Financial Analyst (Expenses)</option>
                </select>
              </div>

              {/* Employee ID */}
              <div className="animate-fade-in">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9ca3af] mb-1">
                  Employee ID / Name (e.g. FA-1, D-1, FM-1)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    role === 'Dispatcher' ? 'e.g. D-1' :
                    role === 'Fleet Manager' ? 'e.g. FM-1' :
                    role === 'Safety Officer' ? 'e.g. SO-1' : 'e.g. FA-1'
                  }
                  className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be] text-sm"
                  required
                />
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9ca3af] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === 'signin' ? 'e.g. analyst@transitops.com' : 'your@email.com'}
              className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be] text-sm"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9ca3af] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be] text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5bc0be] text-[#0b132b] font-bold py-2.5 rounded-xl hover:bg-[#48a9a7] hover:scale-[1.01] transition-all cursor-pointer shadow-md disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-4"
          >
            {mode === 'signin' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            <span>{loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Register & Log In'}</span>
          </button>
        </form>

        <div className="text-center mt-5 text-[10px] text-[#9ca3af]">
          {mode === 'signin' 
            ? 'Sign in with your seeded employee credentials.' 
            : 'Specify role and custom ID to create a new profile.'}
        </div>

      </div>
    </div>
  );
};

export default Login;
