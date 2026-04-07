import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trash2, Lock, User, Mail, ShieldCheck, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans transition-all duration-700">
      {/* Left Decoration (Enterprise Identity) */}
      <div className="hidden lg:flex flex-col justify-between w-1/3 p-12 bg-gradient-to-tr from-emerald-700 to-emerald-950 relative overflow-hidden group">
        <div className="z-10">
          <Link to="/login" className="inline-flex items-center gap-2 text-emerald-100/50 hover:text-white mb-10 transition-colors uppercase font-black text-[10px] tracking-widest group/back">
             <ArrowLeft size={16} className="group-hover/back:-translate-x-1 transition-transform" />
             Back to Auth
          </Link>
          <div className="flex items-center gap-3 mb-10">
             <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
               <Trash2 size={24} className="stroke-[2.5]" />
             </div>
             <span className="font-black text-2xl text-white tracking-tight">EcoClean</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4 drop-shadow-2xl">
            A Greener Future, <br />Powered by Data.
          </h2>
          <p className="text-emerald-100/60 font-medium max-w-sm">
            Become a part of the enterprise network and help build a sustainable environment for the next generation.
          </p>
        </div>
        
        <div className="z-10 bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] mt-auto shadow-2xl relative group-hover:scale-[1.02] transition-transform">
           <div className="flex items-center gap-4 mb-6">
             <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={28} />
             </div>
             <div>
                <p className="text-white font-black text-lg tracking-tight">Certified Network</p>
                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] leading-none mt-1">Enterprise Grade Security</p>
             </div>
           </div>
           <p className="text-slate-400 text-xs font-semibold leading-relaxed">Your data is fully encrypted and managed under ISO smart city standards. Join the secure alliance of eco-conscious professionals.</p>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-[80px] animate-[pulse_6s_infinite]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-black/40 rounded-full blur-[100px] translate-y-1/2 translate-x-1/3"></div>
      </div>

      {/* Right Registration Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 sm:px-12 md:px-20 relative">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
               <Trash2 size={20} />
           </div>
           <span className="font-black text-white text-lg tracking-tight">EcoClean</span>
        </div>

        <div className="w-full max-w-lg space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white tracking-tighter">New Alliance</h1>
            <p className="text-slate-500 font-medium">Configure your profile for the enterprise suite access.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="relative group">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                 <input 
                  type="text" 
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all text-white placeholder:text-slate-600 shadow-sm shadow-black/20"
                  required
                 />
               </div>

               <div className="relative group">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                 <input 
                  type="email" 
                  name="email"
                  placeholder="Enterprise Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all text-white placeholder:text-slate-600 shadow-sm shadow-black/20"
                  required
                 />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Proposed Network Role</label>
              <div className="grid grid-cols-3 gap-3">
                {['admin', 'worker', 'citizen'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r })}
                    className={cn(
                      "py-2.5 px-4 rounded-xl border text-[10px] font-black transition-all",
                      formData.role === r 
                        ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                        : "bg-slate-900 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300 shadow-sm"
                    )}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input 
                type="password" 
                name="password"
                placeholder="Master Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all text-white placeholder:text-slate-600 shadow-sm shadow-black/20"
                required
              />
            </div>

            <div className="flex items-start gap-3 text-[11px] font-bold text-slate-500 px-1 pt-2 select-none group">
               <input 
                type="checkbox" 
                id="terms" 
                className="w-4 h-4 rounded bg-slate-900 border-white/5 text-emerald-500 focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer mt-0.5" 
                required
               />
               <label htmlFor="terms" className="leading-relaxed cursor-pointer group-hover:text-slate-300 transition-colors">
                  I accept the <Link to="#" className="text-emerald-500 underline underline-offset-2 hover:text-emerald-400">Enterprise Access Protocols</Link> and data management policies of the system.
               </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/10 transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <span className="relative z-10 uppercase tracking-[0.2em] text-xs">{loading ? 'Creating Profile...' : 'Finalize Profile'}</span>
              <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" size={18} />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
          </form>

          <p className="text-center text-slate-600 font-semibold text-sm pt-4">
            Already part of the network?{' '}
            <Link to="/login" className="text-white hover:text-emerald-400 font-black underline underline-offset-4 decoration-2 decoration-emerald-500 transition-all">Authenticate Profile</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
