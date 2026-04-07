import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Clock, MapPin, AlertCircle, RefreshCw, Search, CheckCircle2, Timer, Briefcase } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ACTIVE_STATUSES = new Set(['assigned', 'in_progress']);

const Worker = () => {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [onDuty, setOnDuty] = useState(true);
  const isAdminView = user?.role === 'admin';

  const fetchAssignedComplaints = async () => {
    try {
      setError('');
      const response = await api.get(isAdminView ? '/complaints' : '/workers/assigned-complaints');
      const payload = response.data?.data;
      const items = Array.isArray(payload) ? payload : (payload?.items || []);
      setComplaints(items);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Error fetching task center data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/workers/complaints/${id}/status`, { status });
      fetchAssignedComplaints();
    } catch (updateError) {
      setError(updateError.response?.data?.message || 'Error updating task status');
    }
  };

  const filteredComplaints = useMemo(() => {
    let items = [...complaints];

    if (statusFilter !== 'all') {
      items = items.filter((item) => item.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      items = items.filter((item) => {
        const idValue = item._id || '';
        const descriptionValue = item.description || '';
        const locationValue = item.location?.coordinates
          ? `${item.location.coordinates[1]}, ${item.location.coordinates[0]}`
          : '';

        return (
          idValue.toLowerCase().includes(search)
          || descriptionValue.toLowerCase().includes(search)
          || locationValue.toLowerCase().includes(search)
        );
      });
    }

    items.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();

      if (sortBy === 'oldest') return aTime - bTime;
      if (sortBy === 'priority') {
        const order = { assigned: 1, in_progress: 2, cleaned: 3, closed: 4 };
        return (order[a.status] || 99) - (order[b.status] || 99);
      }
      return bTime - aTime;
    });

    return items;
  }, [complaints, searchTerm, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const assignedToday = complaints.filter((item) => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);
      const now = new Date();
      return itemDate.toDateString() === now.toDateString();
    }).length;

    const inProgress = complaints.filter((item) => item.status === 'in_progress').length;
    const completedToday = complaints.filter((item) => item.status === 'cleaned').length;
    const atRisk = complaints.filter((item) => {
      if (!ACTIVE_STATUSES.has(item.status)) return false;
      if (!item.createdAt) return false;
      return Date.now() - new Date(item.createdAt).getTime() > 1000 * 60 * 60 * 24;
    }).length;

    return {
      assignedToday,
      inProgress,
      completedToday,
      atRisk,
    };
  }, [complaints]);

  const recentActivity = useMemo(() => {
    return [...complaints]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
      .slice(0, 6)
      .map((item) => ({
        id: item._id,
        citizenName: item.user?.name || 'Citizen',
        status: item.status,
        updatedAt: item.updatedAt || item.createdAt,
      }));
  }, [complaints]);

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden">
      <Sidebar role={user?.role || 'worker'} onLogout={logout} />

      <main className="flex-1 min-w-0 transition-all duration-300 lg:px-8 py-6">
        <div className="px-6 md:px-0">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="rounded-[2rem] border border-white/5 bg-slate-900/40 p-6 md:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_28%)] pointer-events-none" />
              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Worker Task Center</h1>
                  <p className="mt-2 text-sm md:text-base text-slate-400">Track assigned pickups, update progress, and close collection jobs in real time.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={fetchAssignedComplaints}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-bold text-slate-200 hover:border-emerald-500/30 hover:text-emerald-300"
                  >
                    <RefreshCw size={14} />
                    {isAdminView ? 'Refresh tasks' : 'Refresh assignments'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnDuty((prev) => !prev)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${
                      onDuty
                        ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : 'border border-white/10 bg-slate-950/60 text-slate-400'
                    }`}
                  >
                    <Briefcase size={14} />
                    {onDuty ? 'On Duty' : 'Off Duty'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title={isAdminView ? 'Tasks Today' : 'Assigned Today'} value={stats.assignedToday} icon={<Clock size={16} className="text-cyan-400" />} />
              <StatCard title="In Progress" value={stats.inProgress} icon={<Timer size={16} className="text-blue-400" />} />
              <StatCard title="Completed Today" value={stats.completedToday} icon={<CheckCircle2 size={16} className="text-emerald-400" />} />
              <StatCard title="SLA At Risk" value={stats.atRisk} icon={<AlertCircle size={16} className="text-rose-400" />} />
            </div>

            <section className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-5 md:p-6 shadow-xl backdrop-blur-sm">
              <h2 className="text-xl font-black text-white mb-4">{isAdminView ? 'Activity Across Workers' : 'Worker Activity'}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="rounded-xl border border-white/5 bg-slate-950/55 p-4">
                      <p className="text-sm font-bold text-white">Task #{activity.id?.slice(-6)} • {activity.citizenName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-emerald-400">Status: {activity.status}</p>
                      <p className="mt-2 text-xs text-slate-500">Updated: {activity.updatedAt ? new Date(activity.updatedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/20 p-6 text-center text-slate-500 md:col-span-2">
                    No activity yet.
                  </div>
                )}
              </div>
            </section>

            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 shadow-xl backdrop-blur-sm">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="relative">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by ticket ID or location"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-emerald-500/30"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/30"
                >
                  <option value="all">All statuses</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="cleaned">Cleaned</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/30"
                >
                  <option value="newest">Sort: Newest first</option>
                  <option value="oldest">Sort: Oldest first</option>
                  <option value="priority">Sort: Priority first</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
            )}

            {loading ? (
              <div className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-8 text-center text-slate-400">Loading task queue...</div>
            ) : (
              <div className="grid gap-4">
                {filteredComplaints.map((complaint) => (
                  <div key={complaint._id} className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-5 md:p-6 shadow-xl backdrop-blur-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
                            {complaint.status}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Ticket #{complaint._id?.slice(-6)}</span>
                        </div>
                        <h3 className="text-lg font-black text-white">{complaint.description}</h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-emerald-400" />
                            {complaint.location?.coordinates ? `${complaint.location.coordinates[1]}, ${complaint.location.coordinates[0]}` : 'Location not specified'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-cyan-400" />
                            {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'Unknown date'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {complaint.status === 'assigned' && (
                          <button
                            onClick={() => updateStatus(complaint._id, 'in_progress')}
                            className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-400"
                          >
                            Start Task
                          </button>
                        )}
                        {complaint.status === 'in_progress' && (
                          <button
                            onClick={() => updateStatus(complaint._id, 'cleaned')}
                            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                          >
                            Mark Collected
                          </button>
                        )}
                      </div>
                    </div>

                    {complaint.imageUrl && (
                      <img
                        src={complaint.imageUrl}
                        alt="Complaint"
                        className="mt-4 h-20 w-20 rounded-xl object-cover ring-1 ring-white/10"
                      />
                    )}
                  </div>
                ))}

                {filteredComplaints.length === 0 && (
                  <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-900/30 py-14 text-center text-slate-500">
                    <AlertCircle size={44} className="mx-auto mb-3 opacity-70" />
                    {isAdminView ? 'No tasks right now.' : 'No assigned tasks right now.'}
                  </div>
                )}
              </div>
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

export default Worker;
