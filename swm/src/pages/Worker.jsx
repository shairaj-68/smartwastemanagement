import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, MapPin, AlertCircle, Trash2, Navigation, Play, CheckSquare, Camera, Recycle, CalendarClock, BarChart2, Wrench, XCircle, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../services/api';
import AdminLayout from '../layouts/AdminLayout';

const Worker = () => {
  const [complaints, setComplaints] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('complaints');
  const [binUpdating, setBinUpdating] = useState(null);
  const [complaintUpdating, setComplaintUpdating] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAssignedComplaints();
    fetchAssignedBins();
  }, []);

  const fetchAssignedComplaints = async () => {
    try {
      const response = await api.get('/workers/assigned-complaints');
      setComplaints(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assigned complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedBins = async () => {
    try {
      const response = await api.get('/workers/assigned-bins');
      setBins(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assigned bins:', error);
    }
  };

  const updateStatus = async (id, status) => {
    setComplaintUpdating(id);
    try {
      await api.patch(`/workers/complaints/${id}/status`, { status });
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      const label = { in_progress: 'In Progress', resolved: 'Resolved', pending: 'Pending' }[status] || status;
      showToast(`Complaint marked as ${label}`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update complaint', 'error');
    } finally {
      setComplaintUpdating(null);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateBinStatus = async (id, status) => {
    setBinUpdating(id);
    try {
      await api.patch(`/workers/bins/${id}/status`, { status });
      setBins(prev => prev.map(b => b._id === id ? { ...b, status, ...(status === 'collected' ? { lastCollected: new Date().toISOString() } : {}) } : b));
      showToast(status === 'collected' ? 'Bin marked as collected!' : `Bin status updated to ${status}`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update bin status', 'error');
    } finally {
      setBinUpdating(null);
    }
  };

  const getTaskStats = () => {
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending' || c.status === 'assigned' || c.status === 'reported').length,
      active: complaints.filter(c => c.status === 'in_progress').length,
      completed: complaints.filter(c => c.status === 'resolved' || c.status === 'cleaned').length,
    };
  };

  const getBinStats = () => {
    return {
      total: bins.length,
      pending: bins.filter(b => b.status === 'active' || b.status === 'full').length,
      collected: bins.filter(b => b.status === 'collected').length,
    };
  };

  const stats = getTaskStats();
  const binStats = getBinStats();

  if (loading) {
    return (
      <AdminLayout title="Worker Tasks" subtitle="EcoClean Smart Waste">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Worker Tasks" subtitle="EcoClean Smart Waste">
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-sm shadow-2xl border transition-all',
          toast.type === 'error'
            ? 'bg-red-500/20 border-red-500/30 text-red-400'
            : 'bg-green-500/20 border-green-500/30 text-green-400'
        )}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.message}
        </div>
      )}
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-slate-900/40 border border-white/5 rounded-xl">
        <button
          onClick={() => setActiveTab('complaints')}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all',
            activeTab === 'complaints' 
              ? 'bg-emerald-500 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          Complaint Tasks
        </button>
        <button
          onClick={() => setActiveTab('bins')}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all',
            activeTab === 'bins' 
              ? 'bg-emerald-500 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          Bin Collections
        </button>
      </div>

      {/* Stats Dashboard */}
      {activeTab === 'complaints' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Total Tasks</p>
            <p className="text-2xl font-black text-white flex items-center gap-2">
              <Trash2 size={20} className="text-emerald-400" />
              {stats.total}
            </p>
          </div>
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Pending</p>
            <p className="text-2xl font-black text-yellow-400 flex items-center gap-2">
              <Clock size={20} />
              {stats.pending}
            </p>
          </div>
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">In Progress</p>
            <p className="text-2xl font-black text-blue-400 flex items-center gap-2">
              <Play size={20} />
              {stats.active}
            </p>
          </div>
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Completed</p>
            <p className="text-2xl font-black text-green-400 flex items-center gap-2">
              <CheckCircle size={20} />
              {stats.completed}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Total Bins</p>
            <p className="text-2xl font-black text-white flex items-center gap-2">
              <Recycle size={20} className="text-emerald-400" />
              {binStats.total}
            </p>
          </div>
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Needs Collection</p>
            <p className="text-2xl font-black text-yellow-400 flex items-center gap-2">
              <Clock size={20} />
              {binStats.pending}
            </p>
          </div>
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Collected</p>
            <p className="text-2xl font-black text-green-400 flex items-center gap-2">
              <CheckCircle size={20} />
              {binStats.collected}
            </p>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {activeTab === 'complaints' ? (
        <div className="grid gap-4">
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
            <div 
              key={complaint._id} 
              className={cn(
                "bg-slate-900/40 border rounded-2xl overflow-hidden transition-all",
                complaint.status === 'in_progress' ? 'border-blue-500/30 shadow-lg shadow-blue-500/10' : 'border-white/5',
                "hover:border-emerald-500/30"
              )}
            >
              {/* Card Header */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0",
                          complaint.status === 'pending' || complaint.status === 'assigned' ? 'bg-yellow-500/20' :
                          complaint.status === 'in_progress' ? 'bg-blue-500/20' :
                          complaint.status === 'resolved' || complaint.status === 'cleaned' ? 'bg-green-500/20' : 'bg-slate-700/20'
                        )}>
                          <Trash2 size={18} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{complaint.description}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-slate-500 font-semibold">Waste Collection Task</p>
                            {complaint.type && (
                              <span className="px-2 py-0.5 bg-slate-800 border border-white/10 rounded text-xs font-bold text-slate-300 capitalize">
                                {complaint.type.replace('_', ' ')}
                              </span>
                            )}
                            {complaint.user?.name && (
                              <span className="text-xs text-emerald-400 font-semibold">by {complaint.user.name}</span>
                            )}
                          </div>
                        </div>
                    </div>

                    {/* Location & Schedule */}
                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Location</p>
                          <p className="text-white font-semibold">
                            {complaint.location?.coordinates 
                              ? `${complaint.location.coordinates[1].toFixed(4)}, ${complaint.location.coordinates[0].toFixed(4)}`
                              : 'Location not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Clock size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Assigned</p>
                          <p className="text-white font-semibold">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 whitespace-nowrap',
                    complaint.status === 'pending' || complaint.status === 'assigned' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    complaint.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    complaint.status === 'resolved' || complaint.status === 'cleaned' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-700/20 text-slate-400 border-slate-700/30'
                  )}>
                    {complaint.status === 'pending' ? 'Pending' :
                     complaint.status === 'assigned' ? 'Assigned' :
                     complaint.status === 'in_progress' ? 'In Progress' :
                     complaint.status === 'resolved' || complaint.status === 'cleaned' ? 'Resolved' : complaint.status}
                  </span>
                </div>

                {/* Task Details */}
                <button
                  onClick={() => setExpandedTask(expandedTask === complaint._id ? null : complaint._id)}
                  className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  {expandedTask === complaint._id ? '▼' : '▶'} View Collection Details
                </button>
              </div>

              {/* Expanded Details */}
              {expandedTask === complaint._id && (
                <div className="px-6 pb-6 space-y-4 border-t border-white/5">
                  {/* Collection Instructions */}
                  <div className="bg-slate-950/50 rounded-lg p-4 space-y-3 border border-white/5">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckSquare size={16} className="text-emerald-400" />
                      Collection Instructions
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold mt-0.5">1.</span>
                        <span>Visit the designated bin location</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold mt-0.5">2.</span>
                        <span>Empty the waste collection bin completely</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold mt-0.5">3.</span>
                        <span>Inspect bin for damage or maintenance needs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold mt-0.5">4.</span>
                        <span>Take evidence photo and mark as completed</span>
                      </li>
                    </ul>
                  </div>

                  {/* Complaint Image if available */}
                  {complaint.imageUrl && (
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                        <Camera size={16} className="text-blue-400" />
                        Reported Issue Photo
                      </h4>
                      <img 
                        src={complaint.imageUrl} 
                        alt="Waste Issue" 
                        className="w-full max-h-40 object-cover rounded-lg border border-white/5"
                      />
                    </div>
                  )}

                  {/* Navigation Hint */}
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <Navigation size={16} className="text-emerald-400 flex-shrink-0" />
                    <p className="text-sm text-emerald-300">
                      <span className="font-semibold">Tap coordinates above</span> to navigate with your device GPS
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-slate-950/20 border-t border-white/5 flex gap-2 flex-wrap">
                {(complaint.status === 'pending' || complaint.status === 'assigned' || complaint.status === 'reported') && (
                  <button
                    onClick={() => updateStatus(complaint._id, 'in_progress')}
                    disabled={complaintUpdating === complaint._id}
                    className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {complaintUpdating === complaint._id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                    Start Working
                  </button>
                )}
                {complaint.status === 'in_progress' && (
                  <button
                    onClick={() => updateStatus(complaint._id, 'resolved')}
                    disabled={complaintUpdating === complaint._id}
                    className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-400 disabled:opacity-60 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {complaintUpdating === complaint._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    Mark Resolved
                  </button>
                )}
                {(complaint.status === 'resolved' || complaint.status === 'cleaned') && (
                  <div className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 font-bold rounded-lg flex items-center justify-center gap-2 text-sm border border-green-500/20">
                    <CheckCircle size={14} />
                    Resolved
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-slate-500">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold">No assigned tasks</p>
            <p className="text-sm mt-2">You'll see your collection tasks here once assigned</p>
          </div>
        )}
      </div>
      ) : (
        <div className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Recycle size={20} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Collect Waste from Assigned Bins</p>
              <p className="text-xs text-slate-400">Visit designated bins and empty them according to schedule</p>
            </div>
          </div>

          {bins.length > 0 ? (
            bins.map((bin) => (
              <div
                key={bin._id}
                className={cn(
                  'bg-slate-900/40 border rounded-2xl overflow-hidden transition-all',
                  bin.status === 'collected' ? 'border-green-500/30 shadow-lg shadow-green-500/10' :
                  bin.status === 'full' ? 'border-red-500/30 shadow-lg shadow-red-500/10' : 'border-white/5',
                  'hover:border-emerald-500/30'
                )}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0',
                          bin.status === 'full' ? 'bg-red-500/20' :
                          bin.status === 'collected' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                        )}>
                          <Recycle size={18} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Bin {bin.binId}</h3>
                          {bin.area && <p className="text-xs text-emerald-400 font-semibold">{bin.area}</p>}
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Location</p>
                            <p className="text-white font-semibold text-xs">
                              {bin.location?.coordinates
                                ? `${bin.location.coordinates[1].toFixed(4)}, ${bin.location.coordinates[0].toFixed(4)}`
                                : 'Not set'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <CalendarClock size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Schedule</p>
                            <p className="text-white font-semibold text-xs capitalize">
                              {bin.schedule?.frequency || 'daily'} @ {bin.schedule?.preferredTime || '09:00'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <BarChart2 size={15} className="text-orange-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Capacity</p>
                            <p className={cn(
                              'font-semibold text-xs',
                              bin.capacity >= 80 ? 'text-red-400' : bin.capacity >= 50 ? 'text-yellow-400' : 'text-green-400'
                            )}>{bin.capacity ?? 100}%</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Clock size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Last Collected</p>
                            <p className="text-white font-semibold text-xs">
                              {bin.lastCollected ? new Date(bin.lastCollected).toLocaleDateString() : 'Never'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 whitespace-nowrap',
                      bin.status === 'active' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      bin.status === 'full' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      bin.status === 'maintenance' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      bin.status === 'collected' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      'bg-slate-700/20 text-slate-400 border-slate-700/30'
                    )}>
                      {bin.status === 'active' ? 'Pending' :
                       bin.status === 'full' ? 'Full' :
                       bin.status === 'maintenance' ? 'Maintenance' :
                       bin.status === 'collected' ? 'Collected' : bin.status}
                    </span>
                  </div>

                  <button
                    onClick={() => setExpandedTask(expandedTask === bin._id ? null : bin._id)}
                    className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    {expandedTask === bin._id ? '▼' : '▶'} Collection Steps
                  </button>
                </div>

                {expandedTask === bin._id && (
                  <div className="px-6 pb-6 space-y-4 border-t border-white/5 pt-4">
                    <div className="bg-slate-950/50 rounded-lg p-4 space-y-3 border border-white/5">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <CheckSquare size={16} className="text-emerald-400" />
                        Steps to Empty This Bin
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-400">
                        {[
                          'Navigate to the bin location using the coordinates above',
                          'Empty the waste collection bin completely into the collection vehicle',
                          'Inspect the bin for damage or maintenance needs',
                          'Replace the bin liner if applicable',
                          'Mark the bin as collected once done',
                        ].map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold mt-0.5">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <Navigation size={16} className="text-emerald-400 flex-shrink-0" />
                      <p className="text-sm text-emerald-300">
                        <span className="font-semibold">Tap coordinates</span> to open in your device GPS navigator
                      </p>
                    </div>
                  </div>
                )}

                <div className="px-6 py-4 bg-slate-950/20 border-t border-white/5">
                  {bin.status === 'collected' ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 font-bold rounded-lg text-sm border border-green-500/20">
                        <CheckCircle size={14} />
                        Collected — {bin.lastCollected ? new Date(bin.lastCollected).toLocaleString() : 'Just now'}
                      </div>
                      <button
                        onClick={() => updateBinStatus(bin._id, 'active')}
                        disabled={binUpdating === bin._id}
                        className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => updateBinStatus(bin._id, 'collected')}
                        disabled={binUpdating === bin._id}
                        className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-400 disabled:opacity-60 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        {binUpdating === bin._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        Mark as Collected
                      </button>
                      {bin.status !== 'full' && (
                        <button
                          onClick={() => updateBinStatus(bin._id, 'full')}
                          disabled={binUpdating === bin._id}
                          className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-60 text-red-400 font-bold rounded-lg transition-colors flex items-center gap-2 text-sm border border-red-500/20"
                        >
                          <XCircle size={14} />
                          Mark Full
                        </button>
                      )}
                      {bin.status !== 'maintenance' && (
                        <button
                          onClick={() => updateBinStatus(bin._id, 'maintenance')}
                          disabled={binUpdating === bin._id}
                          className="px-4 py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 disabled:opacity-60 text-yellow-400 font-bold rounded-lg transition-colors flex items-center gap-2 text-sm border border-yellow-500/20"
                        >
                          <Wrench size={14} />
                          Maintenance
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-500">
              <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">No assigned bins</p>
              <p className="text-sm mt-2">You'll see your scheduled bin collections here once assigned</p>
            </div>
          )}
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default Worker;