import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Clock, AlertCircle, CheckCircle, User, Zap } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../services/api';
import AdminLayout from '../layouts/AdminLayout';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/complaints', { params });
      const complaintData = response.data.data;
      setComplaints(Array.isArray(complaintData) ? complaintData : complaintData?.items || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending:     { bg: 'bg-yellow-500/10', text: 'text-yellow-400',  border: 'border-yellow-500/20',  label: 'Pending' },
    reported:    { bg: 'bg-yellow-500/10', text: 'text-yellow-400',  border: 'border-yellow-500/20',  label: 'Submitted' },
    assigned:    { bg: 'bg-blue-500/10',   text: 'text-blue-400',    border: 'border-blue-500/20',    label: 'Assigned' },
    in_progress: { bg: 'bg-purple-500/10', text: 'text-purple-400',  border: 'border-purple-500/20',  label: 'In Progress' },
    resolved:    { bg: 'bg-green-500/10',  text: 'text-green-400',   border: 'border-green-500/20',   label: 'Resolved' },
    cleaned:     { bg: 'bg-green-500/10',  text: 'text-green-400',   border: 'border-green-500/20',   label: 'Completed' },
    closed:      { bg: 'bg-slate-500/10',  text: 'text-slate-400',   border: 'border-slate-500/20',   label: 'Closed' },
    rejected:    { bg: 'bg-red-500/10',    text: 'text-red-400',     border: 'border-red-500/20',     label: 'Rejected' },
  };

  const getProgressPercentage = (status) => ({
    pending: 10, reported: 25, assigned: 50, in_progress: 75,
    resolved: 100, cleaned: 100, closed: 100, rejected: 0,
  }[status] ?? 0);

  const complaintStats = {
    total: complaints.length,
    resolved: complaints.filter(c => ['resolved', 'cleaned', 'closed'].includes(c.status)).length,
    pending: complaints.filter(c => ['pending', 'reported', 'assigned'].includes(c.status)).length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
  };

  if (loading) {
    return (
      <AdminLayout title="Complaints" subtitle="EcoClean Smart Waste">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Complaints" subtitle="EcoClean Smart Waste">
    <div className="space-y-8">
      {/* Action bar */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => navigate('/create-complaint')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors"
        >
          <Plus size={16} />
          Report New Issue
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Total Requests</p>
          <p className="text-2xl font-black text-white">{complaintStats.total}</p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Resolved</p>
          <p className="text-2xl font-black text-green-400">{complaintStats.resolved}</p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">In Progress</p>
          <p className="text-2xl font-black text-purple-400">{complaintStats.inProgress}</p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Awaiting Action</p>
          <p className="text-2xl font-black text-yellow-400">{complaintStats.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-white text-sm"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="reported">Submitted (legacy)</option>
          <option value="assigned">Assigned</option>
          <option value="cleaned">Completed</option>
        </select>
      </div>

      {/* Complaints List */}
      <div className="grid gap-4">
        {complaints.length > 0 ? (
          complaints.map((complaint) => {
            const statusInfo = statusColors[complaint.status] || statusColors.reported;
            const progress = getProgressPercentage(complaint.status);
            return (
              <div key={complaint._id} className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/20 transition-all">
                {/* Card Header with Status */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{complaint.description}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        {complaint.type && (
                          <span className="px-2 py-0.5 bg-slate-800 border border-white/10 rounded-lg text-xs font-bold text-slate-300 capitalize">
                            {complaint.type.replace('_', ' ')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="flex-shrink-0" />
                          {complaint.location?.coordinates 
                            ? `${complaint.location.coordinates[1].toFixed(4)}, ${complaint.location.coordinates[0].toFixed(4)}` 
                            : 'Location not specified'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="flex-shrink-0" />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={cn(
                      'px-4 py-2 rounded-xl text-xs font-bold border flex-shrink-0 whitespace-nowrap',
                      statusInfo.bg,
                      statusInfo.text,
                      statusInfo.border
                    )}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 font-semibold">Resolution Progress</p>
                      <p className="text-xs font-bold text-emerald-400">{progress}%</p>
                    </div>
                    <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Assigned Worker Info */}
                {complaint.assignedWorker && (
                  <div className="px-6 pb-6 pt-0">
                    <div className="bg-slate-800/20 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <User size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 font-semibold">Assigned Worker</p>
                        <p className="text-sm font-bold text-white truncate">{complaint.assignedWorker.name}</p>
                      </div>
                      <Zap size={16} className="text-emerald-400 flex-shrink-0" />
                    </div>
                  </div>
                )}

                {/* Image Preview */}
                {complaint.imageUrl && (
                  <div className="px-6 pb-6 pt-0">
                    <img 
                      src={complaint.imageUrl} 
                      alt="Complaint" 
                      className="w-full max-h-48 object-cover rounded-lg border border-white/5" 
                    />
                  </div>
                )}

                {/* Status Timeline Info */}
                <div className="px-6 py-4 bg-slate-950/20 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      {['resolved', 'cleaned', 'closed'].includes(complaint.status) ? (
                        <><CheckCircle size={14} className="text-green-400" /><span>Request completed</span></>
                      ) : complaint.status === 'in_progress' ? (
                        <><Zap size={14} className="text-purple-400 animate-pulse" /><span>Worker is actively working on this</span></>
                      ) : complaint.status === 'assigned' ? (
                        <><AlertCircle size={14} className="text-blue-400" /><span>Worker has been assigned</span></>
                      ) : (
                        <><Clock size={14} className="text-yellow-400" /><span>Waiting to be assigned a worker</span></>
                      )}
                    </div>
                    <span className="text-slate-600">ID: {complaint._id?.slice(-6)}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 text-slate-500">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold">No requests found</p>
            <p className="text-sm mt-2">Click "Report New Issue" to submit your first waste collection complaint</p>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
};

export default Complaints;