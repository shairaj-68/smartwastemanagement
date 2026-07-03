import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts'
import { AlertCircle, CheckCircle, Trash2, Users, MapPin, Clock, Zap } from 'lucide-react'
import { cn } from './utils/cn'
import AdminLayout from './layouts/AdminLayout'
import api from './services/api'

function App() {
  const navigate = useNavigate()
  const [kpi, setKpi] = useState({ activeComplaints: 0, resolvedToday: 0, binsNearFull: 0, workersOnDuty: 0 })
  const [recentComplaints, setRecentComplaints] = useState([])
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    api.get('/admin/analytics').then(r => {
      const d = r.data.data || {}
      setKpi({
        activeComplaints: d.activeComplaints ?? 0,
        resolvedToday:    d.resolvedToday    ?? 0,
        binsNearFull:     d.binsNearFull     ?? 0,
        workersOnDuty:    d.workersOnDuty    ?? 0,
      })
      // Build chart from complaintsByStatus
      const statusMap = {}
      ;(d.complaintsByStatus || []).forEach(s => { statusMap[s._id] = s.count })
      setChartData([
        { name: 'Pending',     value: statusMap['pending']     || 0 },
        { name: 'Assigned',    value: statusMap['assigned']    || 0 },
        { name: 'In Progress', value: statusMap['in_progress'] || 0 },
        { name: 'Resolved',    value: (statusMap['resolved'] || 0) + (statusMap['cleaned'] || 0) },
        { name: 'Closed',      value: statusMap['closed']      || 0 },
      ])
    }).catch(() => {})

    api.get('/complaints', { params: { limit: 5 } }).then(r => {
      setRecentComplaints(r.data.data?.items || [])
    }).catch(() => {})
  }, [])

  const STATUS_STYLE = {
    pending:     'bg-yellow-500/10 text-yellow-400',
    assigned:    'bg-blue-500/10 text-blue-400',
    in_progress: 'bg-purple-500/10 text-purple-400',
    resolved:    'bg-green-500/10 text-green-400',
    cleaned:     'bg-green-500/10 text-green-400',
    closed:      'bg-slate-700/10 text-slate-400',
    rejected:    'bg-red-500/10 text-red-400',
  }

  return (
    <AdminLayout title="Dashboard" subtitle="EcoClean Smart Waste">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Active Complaints"
            value={kpi.activeComplaints}
            icon={<AlertCircle size={20} />}
            iconBg="bg-rose-500/10"
            iconColor="text-rose-400"
            iconHover="group-hover:bg-rose-500"
            badge={kpi.activeComplaints > 0 ? 'Needs Action' : 'All Clear'}
            badgeColor={kpi.activeComplaints > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}
            valueColor="text-rose-400"
          />
          <KpiCard
            title="Resolved Today"
            value={kpi.resolvedToday}
            icon={<CheckCircle size={20} />}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-400"
            iconHover="group-hover:bg-emerald-500 group-hover:text-slate-900"
            badge="Today"
            badgeColor="bg-emerald-500/10 text-emerald-400"
            valueColor="text-emerald-400"
          />
          <KpiCard
            title="Bins Near Full"
            value={kpi.binsNearFull}
            icon={<Trash2 size={20} />}
            iconBg="bg-orange-500/10"
            iconColor="text-orange-400"
            iconHover="group-hover:bg-orange-500 group-hover:text-white"
            badge={kpi.binsNearFull > 0 ? 'Urgent' : 'OK'}
            badgeColor={kpi.binsNearFull > 0 ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}
            valueColor="text-orange-400"
          />
          <KpiCard
            title="Workers on Duty"
            value={kpi.workersOnDuty}
            icon={<Users size={20} />}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-400"
            iconHover="group-hover:bg-blue-500 group-hover:text-white"
            badge="Registered"
            badgeColor="bg-blue-500/10 text-blue-400"
            valueColor="text-blue-400"
          />
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

          {/* Complaints by Status Chart */}
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Complaints Overview</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Live breakdown by status</p>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                Live
              </span>
            </div>
            <div className="h-[260px]">
              {chartData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#cg)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-sm font-bold uppercase tracking-widest">
                  No complaint data yet
                </div>
              )}
            </div>
            {/* Status legend */}
            <div className="flex flex-wrap gap-3 mt-4">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-70" />
                  {d.name}: <span className="text-white font-black">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Complaints Feed */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col">
            <h3 className="text-lg font-bold text-white tracking-tight mb-6 flex items-center gap-2">
              Recent Complaints
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </h3>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {recentComplaints.length > 0 ? recentComplaints.map(c => (
                <div key={c._id} className="group cursor-pointer" onClick={() => navigate('/complaints')}>
                  <div className="flex items-start gap-3">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black',
                      STATUS_STYLE[c.status] || 'bg-slate-800 text-slate-400'
                    )}>
                      {c.user?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                        {c.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <MapPin size={10} className="text-slate-600" />
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
                          {c.location?.coordinates
                            ? `${c.location.coordinates[1].toFixed(3)}, ${c.location.coordinates[0].toFixed(3)}`
                            : 'No location'}
                        </span>
                      </div>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex-shrink-0',
                      STATUS_STYLE[c.status] || 'bg-slate-800 text-slate-400'
                    )}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 ml-12 text-[10px] text-slate-600 font-bold">
                    <Clock size={9} />
                    {new Date(c.createdAt).toLocaleString()}
                  </div>
                </div>
              )) : (
                <div className="flex-1 flex items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest">
                  No complaints yet
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/complaints')}
              className="w-full py-3 mt-6 bg-slate-800/50 hover:bg-emerald-500 hover:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 hover:border-emerald-500 flex items-center justify-center gap-2"
            >
              <Zap size={12} /> View All Complaints
            </button>
          </div>
        </div>
      </AdminLayout>
  )
}

export default App

function KpiCard({ title, value, icon, iconBg, iconColor, iconHover, badge, badgeColor, valueColor }) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[1.5rem] p-6 shadow-xl hover:shadow-2xl transition-all hover:bg-slate-900 group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl transition-all shadow-lg', iconBg, iconColor, iconHover)}>
          {icon}
        </div>
        <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg', badgeColor)}>
          {badge}
        </span>
      </div>
      <h4 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{title}</h4>
      <p className={cn('text-3xl font-black', valueColor)}>{value}</p>
    </div>
  )
}
