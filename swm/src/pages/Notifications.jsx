import React, { useEffect, useMemo, useState } from 'react';
import { Bell, AlertCircle, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

const Notifications = () => {
  const { user, logout } = useAuth();
  const { notifications: liveNotifications } = useNotifications();
  const [savedNotifications, setSavedNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        const response = await api.get('/notifications');
        if (!cancelled) {
          setSavedNotifications(response.data.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Unable to load notifications');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, []);

  const mergedNotifications = useMemo(() => {
    const liveMapped = (liveNotifications || []).map((item) => ({
      _id: item.id || item._id,
      message: item.message,
      status: item.status || 'unread',
      createdAt: item.createdAt,
      source: 'live',
    }));

    const combined = [...liveMapped, ...(savedNotifications || [])];
    const seen = new Set();

    return combined
      .filter((item) => {
        const key = item._id || `${item.message}-${item.createdAt}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [liveNotifications, savedNotifications]);

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden">
      <Sidebar role={user?.role || 'citizen'} onLogout={logout} />

      <main className="flex-1 min-w-0 transition-all duration-300 lg:px-8 py-6">
        <div className="px-6 md:px-0">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="rounded-[2rem] border border-white/5 bg-slate-900/40 p-6 md:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_28%)] pointer-events-none" />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Notifications</h1>
                  <p className="mt-2 text-sm md:text-base text-slate-400">Real-time alerts and recent system updates for your account.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
                  <Bell size={14} />
                  {mergedNotifications.length} total
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {loading && (
                <div className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 px-5 py-4 text-sm text-slate-400">Loading notifications...</div>
              )}

              {!loading && mergedNotifications.length === 0 && (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-900/30 py-14 text-center text-slate-500">
                  <Bell size={40} className="mx-auto mb-3 text-slate-500" />
                  No notifications yet.
                </div>
              )}

              {mergedNotifications.map((notification) => (
                <div key={notification._id || `${notification.message}-${notification.createdAt}`} className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-5 shadow-xl backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {notification.status === 'read' ? (
                        <CheckCircle2 size={18} className="text-emerald-400" />
                      ) : (
                        <AlertCircle size={18} className="text-cyan-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm md:text-base text-slate-100">{notification.message}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
