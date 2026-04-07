import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts'
import { TrendingUp, Users, AlertCircle, ShoppingBag, Search, Bell } from 'lucide-react'
import { cn } from './utils/cn'
import { useAuth } from './context/AuthContext'
import './App.css'

const data = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 200 },
  { name: 'Thu', value: 278 },
  { name: 'Fri', value: 189 },
  { name: 'Sat', value: 239 },
  { name: 'Sun', value: 349 },
]

const recentComplaints = [
  { id: '1092', user: 'Sarah J.', status: 'High', loc: 'Downtown Area', time: '12m ago' },
  { id: '1093', user: 'Mike R.', status: 'Medium', loc: 'West Side', time: '45m ago' },
  { id: '1094', user: 'Linda P.', status: 'Low', loc: 'Park Circle', time: '2h ago' },
]

function App() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden">
      <Sidebar 
        role={user?.role || 'citizen'} 
        onLogout={logout}
      />
      
      <main className="flex-1 min-w-0 transition-all duration-300 lg:px-8 py-6">
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 md:px-0 mb-8 sticky top-6 z-10 transition-all">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white capitalize bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 font-medium tracking-wide">
              EcoClean Enterprise Suite v1.2.4 — <span className="text-emerald-500/80 uppercase font-black tracking-widest text-[10px] ml-1">Real-time sync</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
               <input 
                type="text" 
                placeholder="Global Search..."
                className="bg-slate-900/50 border border-white/5 rounded-xl text-sm pl-10 pr-4 py-2.5 w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-900 transition-all placeholder:text-slate-600 font-medium"
               />
            </div>
            
            <button className="p-2.5 bg-slate-900/50 border border-white/5 rounded-xl hover:bg-slate-900 hover:border-emerald-500/20 transition-all group">
              <Bell size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </button>

            <div className="h-10 w-[1px] bg-white/5 mx-2" />

            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-xs font-black text-emerald-400 uppercase tracking-tighter">
                  {user?.role || 'citizen'}-Enterprise Access
               </span>
            </div>
          </div>
        </header>

        {/* Hero Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 md:px-0">
          <StatCard title="Total Waste Collected" value="124.8 T" change="+12.4%" icon={<TrendingUp size={20} />} trend="up" />
          <StatCard title="Active Workers" value="48" icon={<Users size={20} />} change="+2 today" trend="up" />
          <StatCard title="Pending Requests" value="12" icon={<AlertCircle size={20} />} change="-5 since 1h" trend="down" />
          <StatCard title="System Efficiency" value="98.2%" icon={<ShoppingBag size={20} />} change="+0.4%" trend="neutral" />
        </div>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 px-6 md:px-0">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-lg font-bold text-white tracking-tight">Collection Velocity</h3>
                 <p className="text-xs text-slate-500 font-medium">Daily performance metrics across all zones</p>
              </div>
              <div className="flex gap-2">
                 <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Live</button>
                 <button className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">History</button>
              </div>
            </div>
            <div className="h-[300px] w-full">
              {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 font-medium italic">
                  Waiting for collection data...
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] p-8 shadow-2xl overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold text-white tracking-tight mb-6 flex items-center gap-2">
              Recent Alerts
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            </h3>
            <div className="space-y-5 flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-hide">
              {recentComplaints && recentComplaints.length > 0 ? (
                recentComplaints.map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-lg",
                          item.status === 'High' ? "bg-rose-500/10 text-rose-500" : "bg-slate-800 text-slate-400"
                        )}>
                          {item.user?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors uppercase tracking-tight ">{item.user}</p>
                          <p className="text-[10px] text-slate-500 font-bold tracking-wider">{item.loc}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-600 font-black">{item.time}</span>
                    </div>
                    <div className="mt-2 text-[10px] bg-slate-800/50 rounded-md px-2 py-1 inline-block text-slate-500 font-bold uppercase tracking-[0.1em]">Ticket #{item.id}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-600 text-xs font-bold uppercase tracking-widest italic">
                  No active alerts
                </div>
              )}
            </div>
            <button className="w-full py-4 mt-6 bg-slate-800/50 hover:bg-emerald-500 hover:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 hover:border-emerald-500">
               Audit logs
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App

function StatCard({ title, value, change, icon, trend }) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[1.5rem] p-6 shadow-xl hover:shadow-2xl transition-all hover:bg-slate-900 group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-900 transition-all shadow-lg shadow-emerald-500/5">
          {icon}
        </div>
        <span className={cn(
          "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-400" : 
          trend === 'down' ? "bg-rose-500/10 text-rose-500" : "bg-slate-800 text-slate-500"
        )}>
          {change}
        </span>
      </div>
      <div>
        <h4 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{title}</h4>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  )
}


