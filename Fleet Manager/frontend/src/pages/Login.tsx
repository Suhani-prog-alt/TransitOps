import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Truck, Mail, Lock, User, Globe } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('All Regions');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, region);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await login('rohit@transitops.com', 'admin123');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Demo login failed. Make sure database is seeded.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0B0F19] px-4 overflow-hidden">
      {/* Background ambient glows */}
      <div className="ambient-glow-blue" />
      <div className="ambient-glow-purple" />

      <div className="w-full max-w-md z-10">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue mb-3.5 shadow-lg shadow-blue-500/10">
            <Truck size={28} className="stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">TransitOps</h1>
          <p className="text-xs font-semibold text-brand-blue uppercase tracking-widest -mt-0.5">Fleet Management Control</p>
        </div>

        <Card className="glass-card p-8 rounded-3xl" hoverable={false}>
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {isRegister ? 'Create Fleet Manager Account' : 'Sign In to Portal'}
          </h2>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Rohit Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/[0.03] border border-white/5 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Assigned Region</label>
                  <div className="relative font-medium text-sm text-gray-300">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Globe size={16} />
                    </span>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0D1321] border border-white/5 rounded-xl text-gray-300 focus:outline-none focus:border-brand-blue transition-all duration-200 appearance-none"
                    >
                      <option value="All Regions">All Regions</option>
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="rohit@transitops.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/[0.03] border border-white/5 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/[0.03] border border-white/5 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all duration-200"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
              {isRegister ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#111928] px-2 text-gray-500 font-semibold">Demo Shortcut</span></div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleDemoLogin}
            className="w-full border-brand-blue/30 hover:border-brand-blue/60 text-brand-blue hover:bg-brand-blue/5"
            isLoading={isLoading}
          >
            Sign In as Rohit Sharma (Demo)
          </Button>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-gray-400 hover:text-white hover:underline transition-colors duration-150"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
