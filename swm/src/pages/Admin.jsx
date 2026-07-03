import React, { useState, useEffect } from 'react';
import { Users, Trash2, UserCheck, AlertCircle, CheckCircle, MapPin, Clock, UserPlus } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../services/api';
import AdminLayout from '../layouts/AdminLayout';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [kpi, setKpi] = useState({ activeComplaints: 0, resolvedToday: 0, binsNearFull: 0, workersOnDuty: 0 });
  const [complaints, setComplaints] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, analyticsRes, complaintsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/analytics'),
        api.get('/complaints'), // For deleting and assignment
      ]);

      setUsers(usersRes.data.data || []);
      const d = analyticsRes.data.data || {};
      setKpi({
        activeComplaints: d.activeComplaints ?? 0,
        resolvedToday:    d.resolvedToday    ?? 0,
        binsNearFull:     d.binsNearFull     ?? 0,
        workersOnDuty:    d.workersOnDuty    ?? 0,
      });
      setComplaints(complaintsRes.data.data?.items || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignWorker = async (complaintId) => {
    const workerId = selectedWorker[complaintId];
    if (!workerId) {
      return;
    }

    try {
      await api.post('/admin/assign-worker', { complaintId, workerId });
      fetchData(); // Refresh
      setSelectedWorker((prev) => ({ ...prev, [complaintId]: '' }));
    } catch (error) {
      console.error('Error assigning worker:', error);
    }
  };

  const workerUsers = users.filter((user) => user.role === 'worker');


  const deleteComplaint = async (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await api.delete(`/admin/complaints/${id}`);
        fetchData(); // Refresh
      } catch (error) {
        console.error('Error deleting complaint:', error);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Panel" subtitle="Smart Waste Management">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const STATUS_STYLE = {
    pending:     'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    assigned:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
    in_progress: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    resolved:    'bg-green-500/10 text-green-400 border-green-500/20',
    cleaned:     'bg-green-500/10 text-green-400 border-green-500/20',
    closed:      'bg-slate-700/10 text-slate-400 border-slate-700/20',
    rejected:    'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <AdminLayout title="Admin Panel" subtitle="Smart Waste Management">
      <div className="space-y-8">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[1.5rem] p-6 shadow-xl hover:shadow-2xl transition-all hover:bg-slate-900 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all">
              <AlertCircle size={20} />
            </div>
            <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg',
              kpi.activeComplaints > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
            )}>
              {kpi.activeComplaints > 0 ? 'Needs Action' : 'All Clear'}
            </span>
          </div>
          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Active Complaints</h4>
          <p className="text-3xl font-black text-rose-400">{kpi.activeComplaints}</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[1.5rem] p-6 shadow-xl hover:shadow-2xl transition-all hover:bg-slate-900 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-900 transition-all">
              <CheckCircle size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              Today
            </span>
          </div>
          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Resolved Today</h4>
          <p className="text-3xl font-black text-emerald-400">{kpi.resolvedToday}</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[1.5rem] p-6 shadow-xl hover:shadow-2xl transition-all hover:bg-slate-900 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
              <Trash2 size={20} />
            </div>
            <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg',
              kpi.binsNearFull > 0 ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'
            )}>
              {kpi.binsNearFull > 0 ? 'Urgent' : 'OK'}
            </span>
          </div>
          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Bins Near Full</h4>
          <p className="text-3xl font-black text-orange-400">{kpi.binsNearFull}</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[1.5rem] p-6 shadow-xl hover:shadow-2xl transition-all hover:bg-slate-900 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400">
              Registered
            </span>
          </div>
          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Workers on Duty</h4>
          <p className="text-3xl font-black text-blue-400">{kpi.workersOnDuty}</p>
        </div>
      </div>

      {/* Users Panel */}
      <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Registered Users</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{users.length} total accounts</p>
          </div>
          <UserPlus size={18} className="text-slate-500" />
        </div>
        <div className="divide-y divide-white/5">
          {users.map(u => (
            <div key={u._id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-black text-sm text-white">
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
              </div>
              <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
                u.role === 'admin'   ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                u.role === 'worker'  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                'bg-slate-700/10 text-slate-400 border-slate-700/20'
              )}>
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Complaints Management Panel */}
      <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold text-white tracking-tight">Complaints Management</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Assign workers and manage complaint lifecycle</p>
        </div>
        <div className="divide-y divide-white/5">
          {complaints.length === 0 ? (
            <div className="py-16 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">
              No complaints found
            </div>
          ) : complaints.map(complaint => (
            <div key={complaint._id} className="p-6 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{complaint.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {complaint.type && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                        {complaint.type.replace('_', ' ')}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                      <Clock size={10} />{new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                    {complaint.location?.coordinates && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                        <MapPin size={10} />
                        {complaint.location.coordinates[1].toFixed(3)}, {complaint.location.coordinates[0].toFixed(3)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
                    STATUS_STYLE[complaint.status] || 'bg-slate-700/10 text-slate-400 border-slate-700/20'
                  )}>
                    {complaint.status}
                  </span>
                  <button
                    onClick={() => deleteComplaint(complaint._id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Assign Worker */}
              <div className="flex items-center gap-3">
                {complaint.assignedWorker ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-bold text-blue-400">
                    <UserCheck size={14} />
                    Assigned to {complaint.assignedWorker.name || 'Worker'}
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedWorker[complaint._id] || ''}
                      onChange={e => setSelectedWorker(prev => ({ ...prev, [complaint._id]: e.target.value }))}
                      className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition-colors"
                    >
                      <option value="">Select worker to assign</option>
                      {workerUsers.map(w => (
                        <option key={w._id} value={w._id}>{w.name} ({w.email})</option>
                      ))}
                    </select>
                    <button
                      onClick={() => assignWorker(complaint._id)}
                      disabled={!selectedWorker[complaint._id]}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl transition-colors uppercase tracking-widest"
                    >
                      Assign
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;