import { useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { cn } from '../utils/cn';

const AdminLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30 overflow-hidden">

      {/* Fixed Left Sidebar */}
      <Sidebar role={user?.role || 'citizen'} onLogout={logout} />

      {/* Right column: navbar + scrollable content */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">

        {/* Top Navbar — stays fixed at top */}
        <header className="flex-shrink-0 z-20 flex items-center justify-between gap-4 px-6 lg:px-8 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5">

          {/* Page title */}
          <div className="space-y-0.5">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium tracking-wide hidden sm:block">
                {subtitle} — <span className="text-emerald-500/80 uppercase font-black tracking-widest text-[10px]">Live</span>
              </p>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">

            {/* Search */}
            <div className="relative hidden lg:block group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search..."
                className="bg-slate-900/50 border border-white/5 rounded-xl text-sm pl-9 pr-4 py-2 w-52 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-900 transition-all placeholder:text-slate-600 font-medium"
              />
            </div>

            {/* Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2.5 bg-slate-900/50 border border-white/5 rounded-xl hover:bg-slate-900 hover:border-emerald-500/20 transition-all group"
            >
              <Bell size={18} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="h-8 w-px bg-white/5" />

            {/* Role badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                {user?.role || 'citizen'}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
