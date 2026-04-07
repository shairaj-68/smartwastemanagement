import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, MapPin, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../services/api';

const Worker = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedComplaints();
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

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/workers/complaints/${id}/status`, { status });
      fetchAssignedComplaints(); // Refresh list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Worker Dashboard</h1>
        <p className="text-slate-500">Manage your assigned waste collection tasks</p>
      </div>

      <div className="grid gap-4">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="bg-slate-900/40 border border-white/5 rounded-xl p-6">
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
              <div className="flex gap-2">
                {complaint.status === 'pending' && (
                  <button
                    onClick={() => updateStatus(complaint.id, 'in-progress')}
                    className="px-4 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-colors"
                  >
                    Start Task
                  </button>
                )}
                {complaint.status === 'in-progress' && (
                  <button
                    onClick={() => updateStatus(complaint.id, 'completed')}
                    className="px-4 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-400 transition-colors"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
            {complaint.image && (
              <img src={complaint.image} alt="Complaint" className="w-20 h-20 object-cover rounded-lg" />
            )}
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            No assigned tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default Worker;