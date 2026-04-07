import React, { useState, useEffect } from 'react';
import { Users, BarChart3, Trash2, UserCheck, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../services/api';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, analyticsRes, complaintsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/analytics'),
        api.get('/complaints'), // For deleting
      ]);
      setUsers(usersRes.data.data || []);
      setAnalytics(analyticsRes.data.data || {});
      setComplaints(complaintsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignWorker = async (complaintId, workerId) => {
    try {
      await api.post('/admin/assign-worker', { complaintId, workerId });
      fetchData(); // Refresh
    } catch (error) {
      console.error('Error assigning worker:', error);
    }
  };

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
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-slate-500">Manage users, analytics, and system operations</p>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users size={24} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Total Users</h3>
          </div>
          <p className="text-3xl font-black text-emerald-400">{analytics.totalUsers || 0}</p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={24} className="text-blue-400" />
            <h3 className="text-lg font-bold text-white">Total Complaints</h3>
          </div>
          <p className="text-3xl font-black text-blue-400">{analytics.totalComplaints || 0}</p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck size={24} className="text-green-400" />
            <h3 className="text-lg font-bold text-white">Active Workers</h3>
          </div>
          <p className="text-3xl font-black text-green-400">{analytics.activeWorkers || 0}</p>
        </div>
      </div>

      {/* Users */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Users</h2>
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-white font-bold">{user.name}</p>
                <p className="text-slate-400 text-sm">{user.email} - {user.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complaints Management */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Complaints Management</h2>
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-white font-bold">{complaint.description}</p>
                  <p className="text-slate-400 text-sm">Status: {complaint.status}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => assignWorker(complaint.id, 'worker-id')} // Need to select worker
                    className="px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded hover:bg-blue-400"
                  >
                    Assign Worker
                  </button>
                  <button
                    onClick={() => deleteComplaint(complaint.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded hover:bg-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;