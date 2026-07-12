import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Truck, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login, error: authError } = useContext(AuthContext);
  const [email, setEmail] = useState('dispatcher@transitops.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(email, password);
    setLoading(false);
    if (!success) {
      setError(authError || 'Invalid email or password');
    }
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    setError('');
    const success = await login('dispatcher@transitops.com', 'password123');
    setLoading(false);
    if (!success) {
      setError('Quick login failed. Please ensure database has been seeded.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b132b] px-4">
      <div className="relative w-full max-w-md bg-[#1c2541]/80 backdrop-blur-md border border-[#3a506b] p-8 rounded-2xl shadow-2xl animate-fade-in">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-[#5bc0be] to-[#3a506b] p-3 rounded-xl mb-3 shadow-lg shadow-[#5bc0be]/20">
            <Truck className="h-8 w-8 text-[#0b132b] font-bold" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">TRANSIT<span className="text-[#5bc0be]">OPS</span></h1>
          <p className="text-[#9ca3af] text-sm mt-1">Smart Transport Operations Platform</p>
        </div>

        {/* Error Alert */}
        {(error || authError) && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm p-3 rounded-lg flex items-center gap-2 mb-6">
            <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be] focus:border-transparent transition-all"
              placeholder="e.g. rohit@transitops.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0b132b] border border-[#3a506b] text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5bc0be] focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5bc0be] text-[#0b132b] font-semibold py-3 rounded-xl hover:bg-[#48a9a7] hover:scale-[1.01] transition-all cursor-pointer shadow-md shadow-[#5bc0be]/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-[#3a506b]/50"></div>
          <span className="flex-shrink mx-4 text-[#9ca3af] text-xs uppercase tracking-wider">Demo Access</span>
          <div className="flex-grow border-t border-[#3a506b]/50"></div>
        </div>

        <button
          onClick={handleQuickLogin}
          disabled={loading}
          className="w-full bg-[#1c2541] text-white border border-[#3a506b] font-medium py-3 rounded-xl hover:bg-[#3a506b]/50 transition-all cursor-pointer"
        >
          Quick Login as Dispatcher (Rohit)
        </button>

        <div className="text-center mt-6">
          <p className="text-xs text-[#9ca3af]">
            Dispatcher Mode: Default credentials seeded automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
