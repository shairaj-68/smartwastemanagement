import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, MapPin, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../services/api';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/complaints', { params });
      setComplaints(response.data.data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'in-progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Complaints Management</h1>
          <p className="text-slate-500">Track and manage waste collection requests</p>
        </div>
        <button
          onClick={() => navigate('/create-complaint')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors"
        >
          <Plus size={16} />
          New Complaint
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Complaints List */}
      <div className="grid gap-4">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="bg-slate-900/40 border border-white/5 rounded-xl p-6 hover:border-emerald-500/20 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{complaint.description}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {complaint.location || 'Location not specified'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-bold border',
                statusColors[complaint.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
              )}>
                {complaint.status}
              </span>
            </div>
            {complaint.image && (
              <img src={complaint.image} alt="Complaint" className="w-20 h-20 object-cover rounded-lg" />
            )}
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            No complaints found
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;