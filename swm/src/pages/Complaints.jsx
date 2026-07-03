import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchComplaints = useCallback(async () => {
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const response = await api.get('/complaints', { params });
      setComplaints(response.data.data.items || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const statusColors = {
    reported: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    assigned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    in_progress: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    cleaned: 'bg-green-500/10 text-green-400 border-green-500/20',
    closed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const summary = useMemo(() => {
    const total = complaints.length;
    const inProgress = complaints.filter((item) => item.status === 'assigned' || item.status === 'in_progress').length;
    const completed = complaints.filter((item) => item.status === 'cleaned' || item.status === 'closed').length;
    return { total, inProgress, completed };
  }, [complaints]);

  const workerActivity = useMemo(() => {
    return complaints
      .filter((item) => item.assignedWorker)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
      .slice(0, 6);
  }, [complaints]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden">
        <Sidebar role={user?.role || 'citizen'} onLogout={logout} />
        <main className="flex-1 min-w-0 transition-all duration-300 lg:px-8 py-6">
          <div className="px-6 md:px-0">
            <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center rounded-[2rem] border border-white/5 bg-slate-900/40 text-slate-400 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em]">
                <AlertCircle size={16} className="text-emerald-400" />
                Loading complaints
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden">
      <Sidebar role={user?.role || 'citizen'} onLogout={logout} />
      <main className="flex-1 min-w-0 transition-all duration-300 lg:px-8 py-6">
      <div className="px-6 md:px-0">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-white/5 bg-slate-900/40 p-6 md:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_28%)] pointer-events-none" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">
                Live operations
              </span>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Complaints</h1>
                <p className="mt-2 max-w-xl text-sm md:text-base text-slate-400">
                  Monitor reported issues, track collection progress, and keep every request in the same operational view as the dashboard.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/create-complaint')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-black text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20"
            >
              <Plus size={16} />
              New Complaint
            </button>
          </div>
        </div>
      

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-sm shadow-xl">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Filter</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="min-w-[220px] rounded-xl border border-white/5 bg-slate-950/70 px-4 py-2.5 text-sm font-medium text-white outline-none transition-colors focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10"
          >
            <option value="all">All Status</option>
            <option value="reported">Reported</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="cleaned">Cleaned</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InfoCard title="Work Given" value={summary.total} />
          <InfoCard title="Work In Progress" value={summary.inProgress} />
          <InfoCard title="Work Done By Worker" value={summary.completed} />
        </section>

        <section className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-5 md:p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-xl font-black text-white mb-4">Worker Activity On My Requests</h2>
          <div className="space-y-3">
            {workerActivity.map((item) => (
              <div key={item._id} className="rounded-xl border border-white/5 bg-slate-950/55 p-4">
                <p className="text-sm font-bold text-white">Ticket #{item._id?.slice(-6)} • {item.status}</p>
                <p className="mt-1 text-xs text-slate-400">Worker: {item.assignedWorker?.name || 'Assigned'}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-emerald-400">Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            ))}
            {workerActivity.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/20 p-6 text-center text-slate-500">No worker activity yet.</div>
            )}
          </div>
        </section>

        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <div
              key={complaint._id}
              className="group rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-6 shadow-xl transition-all hover:border-emerald-500/20 hover:bg-slate-900/70 hover:shadow-2xl backdrop-blur-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={cn(
                      'inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]',
                      statusColors[complaint.status] || 'bg-slate-800/80 text-slate-300 border-white/5'
                    )}>
                      {complaint.status}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Complaint #{complaint._id?.slice(-6)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                      {complaint.description}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-400" />
                        {complaint.location?.coordinates ? `${complaint.location.coordinates[1]}, ${complaint.location.coordinates[0]}` : 'Location not specified'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-cyan-400" />
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {complaint.imageUrl && (
                  <img
                    src={complaint.imageUrl}
                    alt="Complaint"
                    className="h-24 w-24 rounded-2xl object-cover ring-1 ring-white/5 shadow-lg shadow-black/20"
                  />
                )}
              </div>
            </div>
          ))}
          {complaints.length === 0 && (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-900/30 py-16 text-center text-slate-500 backdrop-blur-sm">
              <AlertCircle size={48} className="mx-auto mb-4 text-emerald-400/70" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">No complaints found</p>
              <p className="mt-2 text-sm text-slate-500">Try another filter or create a new complaint to populate the feed.</p>
            </div>
          )}
        </div>
      </div>
      </div>
      </main>
    </div>
  );
};

const InfoCard = ({ title, value }) => (
  <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 shadow-xl backdrop-blur-sm">
    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{title}</p>
    <p className="mt-2 text-2xl font-black text-white">{value}</p>
  </div>
);

InfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default Complaints;