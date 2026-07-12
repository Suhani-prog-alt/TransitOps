import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Truck, CheckSquare, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Safety Officer');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || 'Invalid credentials.';
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans">
      
      {/* Left Side - Info Panel */}
      <div className="w-1/2 bg-[#d8dce3] p-12 flex flex-col relative">
        <div className="mt-10 ml-10">
          <div className="w-12 h-12 bg-blue-600/80 rounded-md grid grid-cols-4 grid-rows-4 gap-0.5 p-1 mb-4">
             {/* Simple grid pattern for the logo approximation */}
             {[...Array(16)].map((_, i) => <div key={i} className="bg-[#d8dce3]/30 rounded-[1px]"></div>)}
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">TransitOps</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Smart Transport Operations Platform</p>

          <div className="mt-24 space-y-3">
            <h2 className="text-lg font-bold text-slate-800 mb-4">One login, four roles:</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Fleet Manager
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Dispatcher
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Safety Officer
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Financial Analyst
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 bg-[#141414] p-12 flex items-center justify-center relative">
        
        {/* Absolute positioned error toast simulation */}
        {error && (
          <div className="absolute right-8 top-1/3 border border-dashed border-red-500/50 bg-[#1f1616] p-4 rounded-md max-w-[200px]">
            <p className="text-xs text-slate-400 font-mono mb-2">Error state</p>
            <div className="flex items-start gap-2 text-red-400 text-sm font-medium">
              <XCircle size={16} className="shrink-0 mt-0.5" />
              <p>{error} Account locked after 5 failed attempts.</p>
            </div>
          </div>
        )}

        <div className="w-full max-w-md ml-8">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-100">Sign in to your account</h2>
            <p className="text-sm text-slate-400 mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="safety@transitops.com" 
                className="bg-transparent border-slate-700 text-white placeholder:text-slate-600 h-11 focus-visible:ring-blue-600 focus-visible:border-blue-600"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="bg-transparent border-slate-700 text-white placeholder:text-slate-600 h-11 focus-visible:ring-blue-600 focus-visible:border-blue-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role (RBAC)</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex h-11 w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 appearance-none"
              >
                <option value="Fleet Manager" className="bg-slate-900">Fleet Manager</option>
                <option value="Dispatcher" className="bg-slate-900">Dispatcher</option>
                <option value="Safety Officer" className="bg-slate-900">Safety Officer</option>
                <option value="Financial Analyst" className="bg-slate-900">Financial Analyst</option>
              </select>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                 {/* Custom checkbox to match the green check in mockup */}
                 <div className="w-4 h-4 border border-slate-500 rounded-sm flex items-center justify-center group-hover:border-slate-400">
                    <CheckSquare size={14} className="text-green-500 opacity-80" />
                 </div>
                 <span className="text-sm text-slate-300">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11 mt-2">
              Sign In
            </Button>
          </form>

          <div className="mt-12 space-y-2">
            <p className="text-xs text-slate-400 mb-3">Access is scoped by role after login:</p>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li><span className="text-slate-500 mr-1">•</span> Fleet Manager <span className="mx-1">→</span> Fleet, Maintenance</li>
              <li><span className="text-slate-500 mr-1">•</span> Dispatcher <span className="mx-1">→</span> Dashboard, Trips</li>
              <li><span className="text-slate-500 mr-1">•</span> Safety Officer <span className="mx-1">→</span> Drivers, Compliance</li>
              <li><span className="text-slate-500 mr-1">•</span> Financial Analyst <span className="mx-1">→</span> Fuel & Expenses, Analytics</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
