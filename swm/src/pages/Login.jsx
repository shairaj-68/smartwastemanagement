import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trash2, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans">
      {/* Left Decoration (Enterprise Identity) */}
      <div className="hidden lg:flex flex-col justify-between w-1/3 p-12 bg-gradient-to-br from-emerald-600 to-emerald-950 relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-3 mb-10 group">
             <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
               <Trash2 size={24} className="stroke-[2.5]" />
             </div>
             <span className="font-black text-2xl text-white tracking-tight">EcoClean</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4 drop-shadow-2xl">
            Smarter Cities, <br />Greener Futures.
          </h2>
          <p className="text-emerald-100/60 font-medium max-w-sm">
            Join the enterprise network to manage waste efficiently using real-time data and AI-driven insights.
          </p>
        </div>
        
        <div className="z-10 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl mt-auto">
           <div className="flex -space-x-2 mb-4">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-8 h-8 rounded-full border-2 border-emerald-700 bg-emerald-500 overflow-hidden flex items-center justify-center text-[10px] font-bold text-white uppercase italic">U{i}</div>
             ))}
             <div className="w-8 h-8 rounded-full border-2 border-emerald-700 bg-emerald-400 flex items-center justify-center text-[8px] font-black text-emerald-900">+42k</div>
           </div>
           <p className="text-white text-xs font-bold uppercase tracking-widest leading-relaxed">Trusted by 42,000+ Smart Citizens across the globe</p>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 sm:px-12 md:px-20 relative">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
               <Trash2 size={20} />
           </div>
           <span className="font-black text-white text-lg tracking-tight">EcoClean</span>
        </div>

        <div className="w-full max-w-md space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white tracking-tighter">System Access</h1>
            <p className="text-slate-500 font-medium">Please authenticate to continue to the control center.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-4">
               <div className="relative group">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                 <input 
                  type="email" 
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all text-white placeholder:text-slate-600"
                  required
                 />
               </div>

               <div className="relative group">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                 <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all text-white placeholder:text-slate-600"
                  required
                 />
               </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded bg-slate-900 border-white/5 text-emerald-500 focus:ring-0 focus:ring-offset-0 transition-all" />
                  <span className="group-hover:text-slate-300 transition-colors">Keep Session Active</span>
               </label>
               <Link to="#" className="text-emerald-500 hover:text-emerald-400 decoration-2 underline-offset-4 hover:underline transition-all uppercase tracking-widest text-[9px]">Recovery Access?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/10 transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <span className="relative z-10 uppercase tracking-[0.2em] text-xs">{loading ? 'Authenticating...' : 'Authorize Login'}</span>
              <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" size={18} />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
          </form>

          <p className="text-center text-slate-600 font-semibold text-sm">
            Not part of the network?{' '}
            <Link to="/register" className="text-white hover:text-emerald-400 font-black underline underline-offset-4 decoration-2 decoration-emerald-500 transition-all">Join the League</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
