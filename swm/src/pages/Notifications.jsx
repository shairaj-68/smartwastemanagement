import React, { useState } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, AlertCircle, Clock, BellOff } from 'lucide-react';
import { cn } from '../utils/cn';
import { useNotifications } from '../context/NotificationContext';
import AdminLayout from '../layouts/AdminLayout';

const TYPE_CONFIG = {
  critical: { icon: AlertCircle,   color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    glow: 'shadow-red-500/10'    },
  warning:  { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', glow: 'shadow-yellow-500/10' },
  info:     { icon: Info,          color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   glow: 'shadow-blue-500/10'   },
};

const Notifications = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'unread'
    ? notifications.filter(n => n.status === 'unread')
    : notifications;

  return (
    <AdminLayout title="Notifications" subtitle="EcoClean Smart Waste">
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            Activity feed —{' '}
            <span className="text-emerald-500/80 uppercase font-black tracking-widest text-[10px] ml-1">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </span>
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 border border-white/5 rounded-xl hover:bg-slate-900 hover:border-emerald-500/20 text-sm font-bold text-slate-300 hover:text-white transition-all w-fit"
          >
            <CheckCheck size={16} className="text-emerald-400" />
            Mark all read
          </button>
        )}
      </div>

      {/* Stat cards — same pattern as dashboard StatCard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[1.5rem] p-6 shadow-xl hover:shadow-2xl transition-all hover:bg-slate-900 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-900 transition-all">
              <Bell size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-800 text-slate-500">
              Total
            </span>
          </div>
          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">All Notifications</h4>
          <p className="text-2xl font-black text-white">{notifications.length}</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[1.5rem] p-6 shadow-xl hover:shadow-2xl transition-all hover:bg-slate-900 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all">
              <AlertCircle size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-red-500/10 text-red-400">
              {unreadCount > 0 ? 'New' : 'Clear'}
            </span>
          </div>
          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Unread</h4>
          <p className="text-2xl font-black text-red-400">{unreadCount}</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[1.5rem] p-6 shadow-xl hover:shadow-2xl transition-all hover:bg-slate-900 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-900 transition-all">
              <CheckCheck size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              Done
            </span>
          </div>
          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Read</h4>
          <p className="text-2xl font-black text-emerald-400">{notifications.length - unreadCount}</p>
        </div>
      </div>

      {/* Main panel — matches dashboard card style */}
      <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">

        {/* Panel header with filter tabs */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Activity Feed</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Click a notification to mark it as read</p>
          </div>
          <div className="flex gap-1 p-1 bg-slate-950/50 border border-white/5 rounded-xl">
            {['all', 'unread'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all',
                  filter === f
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {f}
                {f === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px]">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notification list */}
        <div className="divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
              <BellOff size={40} className="mb-4 opacity-30" />
              <p className="font-black uppercase tracking-widest text-xs">No notifications</p>
            </div>
          ) : (
            filtered.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              const Icon = cfg.icon;
              const isUnread = n.status === 'unread';
              return (
                <div
                  key={n._id}
                  onClick={() => isUnread && markRead(n._id)}
                  className={cn(
                    'flex items-start gap-4 px-6 py-4 transition-all cursor-pointer group',
                    isUnread ? 'hover:bg-white/[0.03]' : 'opacity-50 hover:opacity-70'
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all group-hover:scale-110',
                    cfg.bg, `shadow-${cfg.glow}`
                  )}>
                    <Icon size={18} className={cfg.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-semibold leading-snug',
                      isUnread ? 'text-white' : 'text-slate-400'
                    )}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                      <Clock size={10} />
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Type badge + unread dot */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn(
                      'px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border',
                      cfg.bg, cfg.color, cfg.border
                    )}>
                      {n.type || 'info'}
                    </span>
                    {isUnread && (
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default Notifications;
