import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import Sidebar from './components/Sidebar'
import { LineChart, Line, Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Legend } from 'recharts'
import { TrendingUp, Users, AlertCircle, ShoppingBag, Search, Bell, LoaderCircle } from 'lucide-react'
import { cn } from './utils/cn'
import { useAuth } from './context/AuthContext'
import api from './services/api'
import './App.css'

const roleLabelMap = {
  citizen: 'Citizen',
  worker: 'Worker',
  admin: 'Admin',
}

function App() {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [recentComplaints, setRecentComplaints] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        if (!user) return

        if (user.role === 'admin') {
          const [analyticsResponse, complaintsResponse, usersResponse] = await Promise.all([
            api.get('/admin/analytics'),
            api.get('/complaints', { params: { limit: 5 } }),
            api.get('/admin/users'),
          ])

          if (cancelled) return

          setAnalytics({
            ...analyticsResponse.data.data,
            totalUsers: usersResponse.data.data.length,
          })
          setRecentComplaints(complaintsResponse.data.data.items || [])
          return
        }

        if (user.role === 'worker') {
          const [assignedResponse, complaintsResponse] = await Promise.all([
            api.get('/workers/assigned-complaints'),
            api.get('/complaints', { params: { limit: 5 } }),
          ])

          if (cancelled) return

          setAnalytics({
            totalComplaints: assignedResponse.data.data.length,
            totalUsers: 0,
            activeWorkers: 1,
            complaintsByStatus: [],
            usersByRole: [],
          })
          setRecentComplaints(assignedResponse.data.data.length > 0 ? assignedResponse.data.data : complaintsResponse.data.data.items || [])
          return
        }

        const complaintsResponse = await api.get('/complaints', { params: { limit: 5 } })

        if (cancelled) return

        setAnalytics({
          totalComplaints: complaintsResponse.data.data.total || 0,
          totalUsers: 1,
          activeWorkers: 0,
          complaintsByStatus: [],
          usersByRole: [],
        })
        setRecentComplaints(complaintsResponse.data.data.items || [])
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load backend data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [user])

  const chartData = useMemo(() => {
    const now = new Date()
    const points = []
    const complaintCounts = new Map()

    ;(recentComplaints || []).forEach((complaint) => {
      if (!complaint.createdAt) return
      const key = new Date(complaint.createdAt).toLocaleDateString('en-CA')
      complaintCounts.set(key, (complaintCounts.get(key) || 0) + 1)
    })

    const usersTotal = Number(analytics?.totalUsers || 0)

    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date(now)
      day.setDate(now.getDate() - offset)
      const key = day.toLocaleDateString('en-CA')

      points.push({
        name: day.toLocaleDateString(undefined, { weekday: 'short' }),
        complaints: complaintCounts.get(key) || 0,
        users: usersTotal,
      })
    }

    return points
  }, [recentComplaints, analytics])

  const totalComplaints = analytics?.totalComplaints ?? recentComplaints.length
  const activeWorkers = analytics?.activeWorkers ?? 0
  const efficiency = totalComplaints > 0 ? Math.min(99.2, 80 + totalComplaints) : 0

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

            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-xs font-black text-emerald-400 uppercase tracking-tighter">
                  {roleLabelMap[user?.role] || 'Citizen'} Access
               </span>
            </div>
          </div>
        </header>

        {error && (
          <div className="mx-6 md:mx-0 mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {loading && (
          <div className="mx-6 md:mx-0 mb-6 flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
            <LoaderCircle className="animate-spin" size={16} />
            Connecting to backend and loading live data...
          </div>
        )}

        {/* Hero Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 md:px-0">
          <StatCard title="Total Complaints" value={String(totalComplaints)} change="Live backend" icon={<TrendingUp size={20} />} trend="up" />
          <StatCard title="Active Workers" value={String(activeWorkers)} icon={<Users size={20} />} change="From analytics" trend="up" />
          <StatCard title="Pending Requests" value={String(recentComplaints.filter((item) => item.status === 'reported' || item.status === 'assigned').length)} icon={<AlertCircle size={20} />} change="Current queue" trend="down" />
          <StatCard title="System Efficiency" value={`${efficiency.toFixed(1)}%`} icon={<ShoppingBag size={20} />} change="Backend driven" trend="neutral" />
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

          {/* Complaints by Status Chart */}
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Complaints vs Users</h3>
                <p className="text-xs text-slate-500 font-medium">Last 7 days complaint trend with user volume reference</p>
              </div>
              <div className="flex gap-2">
                 <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Live</button>
                 <button className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">History</button>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                Live
              </span>
            </div>
            <div className="h-[300px] w-full">
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis allowDecimals={false} stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}
                      labelStyle={{ color: '#cbd5e1' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="complaints" name="Complaints" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="users" name="Users" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
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
              Recent Alerts
              {' '}
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            </h3>
            <div className="space-y-5 flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-hide">
              {recentComplaints && recentComplaints.length > 0 ? (
                recentComplaints.map((item) => (
                  <div key={item._id || item.id} className="group cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-lg",
                          item.status === 'reported' || item.status === 'assigned' ? "bg-rose-500/10 text-rose-500" : "bg-slate-800 text-slate-400"
                        )}>
                          {item.user?.name?.[0] || item.user?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors uppercase tracking-tight ">{item.user?.name || item.user || 'Unknown user'}</p>
                          <p className="text-[10px] text-slate-500 font-bold tracking-wider">{item.location?.coordinates ? `${item.location.coordinates[1]}, ${item.location.coordinates[0]}` : 'Location not provided'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-600 font-black">{item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                    </div>
                    <div className="mt-2 text-[10px] bg-slate-800/50 rounded-md px-2 py-1 inline-block text-slate-500 font-bold uppercase tracking-[0.1em]">Ticket #{item._id || item.id}</div>
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

function StatCard({ title, value, change, icon, trend }) {
  let trendClass = 'bg-slate-800 text-slate-500'

  if (trend === 'up') {
    trendClass = 'bg-emerald-500/10 text-emerald-400'
  } else if (trend === 'down') {
    trendClass = 'bg-rose-500/10 text-rose-500'
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[1.5rem] p-6 shadow-xl hover:shadow-2xl transition-all hover:bg-slate-900 group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl transition-all shadow-lg', iconBg, iconColor, iconHover)}>
          {icon}
        </div>
        <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg', trendClass)}>
          {change}
        </span>
      </div>
      <h4 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{title}</h4>
      <p className={cn('text-3xl font-black', valueColor)}>{value}</p>
    </div>
  )
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  change: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']).isRequired,
}


