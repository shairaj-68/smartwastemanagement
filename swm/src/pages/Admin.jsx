import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Users, BarChart3, UserCheck, Shield, ClipboardList, Activity, Trash2, UserRoundCheck, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ACTIVE_STATUSES = new Set(['reported', 'assigned', 'in_progress']);
const RESOLVED_STATUSES = new Set(['cleaned', 'closed']);

const Admin = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [selectedWorkers, setSelectedWorkers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setError('');
      const [usersRes, analyticsRes, complaintsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/analytics'),
        api.get('/complaints', { params: { limit: 100 } }),
      ]);

      setUsers(usersRes.data.data || []);
      setAnalytics(analyticsRes.data.data || {});
      setComplaints(complaintsRes.data.data.items || []);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const assignWorker = async (complaintId, workerId) => {
    try {
      await api.post('/admin/assign-worker', { complaintId, workerId });
      fetchData();
    } catch (assignError) {
      setError(assignError.response?.data?.message || 'Error assigning worker');
    }
  };

  const deleteComplaint = async (id) => {
    if (globalThis.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await api.delete(`/admin/complaints/${id}`);
        fetchData();
      } catch (deleteError) {
        setError(deleteError.response?.data?.message || 'Error deleting complaint');
      }
    }
  };

  const workers = useMemo(() => users.filter((item) => item.role === 'worker'), [users]);

  const metrics = useMemo(() => {
    const totalComplaints = analytics.totalComplaints || complaints.length;
    const openComplaints = complaints.filter((item) => ACTIVE_STATUSES.has(item.status)).length;
    const resolvedComplaints = complaints.filter((item) => RESOLVED_STATUSES.has(item.status)).length;
    const completionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;
    const unassigned = complaints.filter((item) => !item.assignedWorker).length;

    return {
      totalUsers: analytics.totalUsers || users.length || 0,
      totalComplaints,
      openComplaints,
      completionRate,
      activeWorkers: (analytics.usersByRole || []).find((item) => item._id === 'worker')?.count || workers.length,
      unassigned,
    };
  }, [analytics, complaints, users, workers]);

  const workerStats = useMemo(() => {
    return workers.map((worker) => {
      const activeCount = complaints.filter((item) => {
        const assignedId = typeof item.assignedWorker === 'string' ? item.assignedWorker : item.assignedWorker?._id;
        return assignedId === (worker.id || worker._id) && ACTIVE_STATUSES.has(item.status);
      }).length;

      return {
        ...worker,
        activeCount,
      };
    });
  }, [workers, complaints]);

  const activityFeed = useMemo(() => {
    return [...complaints]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
      .slice(0, 10)
      .map((item) => ({
        id: item._id,
        citizen: item.user?.name || 'Citizen',
        worker: item.assignedWorker?.name || 'Unassigned',
        status: item.status,
        updatedAt: item.updatedAt || item.createdAt,
      }));
  }, [complaints]);

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden">
      <Sidebar role={user?.role || 'admin'} onLogout={logout} />

      <main className="flex-1 min-w-0 transition-all duration-300 lg:px-8 py-6">
        <div className="px-6 md:px-0">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="rounded-[2rem] border border-white/5 bg-slate-900/40 p-6 md:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_28%)] pointer-events-none" />
              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Admin Command Center</h1>
                  <p className="mt-2 text-sm md:text-base text-slate-400">Monitor platform activity, assign workforce, and enforce service quality.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={fetchData}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-bold text-slate-200 hover:border-emerald-500/30 hover:text-emerald-300"
                  >
                    <RefreshCw size={14} />
                    Refresh Data
                  </button>
                  <button type="button" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-400">
                    Export Report
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StatCard title="Total Users" value={metrics.totalUsers} icon={<Users size={16} className="text-emerald-400" />} />
              <StatCard title="Total Complaints" value={metrics.totalComplaints} icon={<ClipboardList size={16} className="text-cyan-400" />} />
              <StatCard title="Open Complaints" value={metrics.openComplaints} icon={<Activity size={16} className="text-rose-400" />} />
              <StatCard title="Completion Rate" value={`${metrics.completionRate}%`} icon={<BarChart3 size={16} className="text-blue-400" />} />
              <StatCard title="Active Workers" value={metrics.activeWorkers} icon={<UserCheck size={16} className="text-green-400" />} />
              <StatCard title="Unassigned Tickets" value={metrics.unassigned} icon={<Shield size={16} className="text-yellow-300" />} />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
            )}

            {loading ? (
              <div className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-8 text-center text-slate-400">Loading admin panel...</div>
            ) : (
              <>
                <section className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-5 md:p-6 shadow-xl backdrop-blur-sm">
                  <h2 className="text-xl font-black text-white mb-4">Complaint Operations</h2>
                  <div className="space-y-3">
                    {complaints.map((complaint) => (
                      <div key={complaint._id} className="rounded-xl border border-white/5 bg-slate-950/55 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1">Ticket #{complaint._id?.slice(-6)}</p>
                            <p className="text-sm md:text-base font-bold text-white">{complaint.description}</p>
                            <p className="mt-1 text-xs text-slate-400">Status: {complaint.status}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={selectedWorkers[complaint._id] || ''}
                              onChange={(event) => setSelectedWorkers((prev) => ({ ...prev, [complaint._id]: event.target.value }))}
                              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            >
                              <option value="">Select worker</option>
                              {workers.map((worker) => (
                                <option key={worker.id || worker._id} value={worker.id || worker._id}>{worker.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => assignWorker(complaint._id, selectedWorkers[complaint._id])}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-400 disabled:opacity-50"
                              disabled={!selectedWorkers[complaint._id]}
                            >
                              <UserRoundCheck size={12} />
                              Assign
                            </button>
                            <button
                              onClick={() => deleteComplaint(complaint._id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-400"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {complaints.length === 0 && (
                      <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/20 p-6 text-center text-slate-500">No complaints found.</div>
                    )}
                  </div>
                </section>

                <section className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-5 md:p-6 shadow-xl backdrop-blur-sm">
                  <h2 className="text-xl font-black text-white mb-4">Workforce</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {workerStats.map((worker) => (
                      <div key={worker.id || worker._id} className="rounded-xl border border-white/5 bg-slate-950/55 p-4">
                        <p className="text-sm font-bold text-white">{worker.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{worker.email}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-emerald-400">Active tasks: {worker.activeCount}</p>
                      </div>
                    ))}
                    {workerStats.length === 0 && (
                      <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/20 p-6 text-center text-slate-500 md:col-span-2">No workers found.</div>
                    )}
                  </div>
                </section>

                <section className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-5 md:p-6 shadow-xl backdrop-blur-sm">
                  <h2 className="text-xl font-black text-white mb-4">Activity Monitor</h2>
                  <div className="space-y-3">
                    {activityFeed.map((activity) => (
                      <div key={activity.id} className="rounded-xl border border-white/5 bg-slate-950/55 p-4">
                        <p className="text-sm font-bold text-white">Ticket #{activity.id?.slice(-6)} • {activity.status}</p>
                        <p className="mt-1 text-xs text-slate-400">Citizen: {activity.citizen} • Worker: {activity.worker}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-emerald-400">Updated: {activity.updatedAt ? new Date(activity.updatedAt).toLocaleString() : 'N/A'}</p>
                      </div>
                    ))}
                    {activityFeed.length === 0 && (
                      <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/20 p-6 text-center text-slate-500">No activity found.</div>
                    )}
                  </div>
                </section>

                <section className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-5 md:p-6 shadow-xl backdrop-blur-sm">
                  <h2 className="text-xl font-black text-white mb-4">Governance Controls</h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <button type="button" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:border-emerald-500/30">Manage users</button>
                    <button type="button" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:border-emerald-500/30">Audit logs</button>
                    <button type="button" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:border-emerald-500/30">Broadcast notice</button>
                    <button type="button" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm font-bold text-slate-200 hover:border-emerald-500/30">System health</button>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 shadow-xl backdrop-blur-sm">
    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
      {icon}
    </div>
    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{title}</p>
    <p className="mt-2 text-2xl font-black text-white">{value}</p>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
};

export default Admin;
