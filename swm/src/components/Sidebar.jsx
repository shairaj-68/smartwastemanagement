import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  PlusSquare,
  ClipboardList,
  BarChart3,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '../utils/cn';

const MENU_GROUPS = [
  {
    title: 'MAIN',
    items: [
      { path: '/dashboard',        label: 'Dashboard',        icon: LayoutDashboard, roles: ['admin', 'worker', 'citizen'] },
      { path: '/complaints',       label: 'Complaints',       icon: MessageSquare,   roles: ['admin', 'citizen', 'worker'] },
      { path: '/create-complaint', label: 'Create Complaint', icon: PlusSquare,      roles: ['citizen', 'worker']          },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { path: '/worker', label: 'Worker Tasks', icon: ClipboardList, roles: ['admin', 'worker'] },
      { path: '/admin',  label: 'Admin Panel',  icon: BarChart3,     roles: ['admin']           },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'worker', 'citizen'] },
      { path: '/profile',       label: 'Profile',       icon: User, roles: ['admin', 'worker', 'citizen'] },
    ],
  },
];

const Sidebar = ({ role = 'citizen', onLogout }) => {
  const [isCollapsed, setIsCollapsed]   = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleNav = (path) => {
    navigate(path);
    if (window.innerWidth < 768) setIsMobileOpen(false);
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 shadow-xl">

      {/* ── Brand ── */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
            <Trash2 size={20} className="stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-black text-white tracking-tight text-lg">EcoClean</span>
              <span className="text-[10px] text-emerald-400 font-bold tracking-[0.2em] uppercase mt-1">Enterprise</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(c => !c)}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        {MENU_GROUPS.map((group) => {
          const visible = group.items.filter(item => item.roles.includes(role));
          if (!visible.length) return null;

          return (
            <div key={group.title}>
              {!isCollapsed && (
                <p className="text-[10px] font-black text-slate-600 px-3 tracking-[0.2em] uppercase mb-2">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {visible.map(({ path, label, icon: Icon }) => {
                  const isActive = location.pathname === path;
                  return (
                    <button
                      key={path}
                      onClick={() => handleNav(path)}
                      title={isCollapsed ? label : undefined}
                      className={cn(
                        'group relative flex items-center w-full rounded-xl px-3 py-2.5 transition-all duration-200',
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white',
                      )}
                    >
                      <Icon
                        size={20}
                        className={cn(
                          'flex-shrink-0 transition-all duration-200',
                          isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'group-hover:scale-110',
                          isCollapsed ? 'mx-auto' : 'mr-3',
                        )}
                      />
                      {!isCollapsed && (
                        <span className="font-semibold text-sm tracking-wide">{label}</span>
                      )}
                      {isActive && (
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-l-full shadow-[0_0_12px_rgba(16,185,129,1)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Profile footer ── */}
      <div className="p-4 border-t border-white/5 bg-slate-900/50 backdrop-blur-md">
        <div className={cn(
          'flex items-center rounded-2xl bg-white/5 border border-white/5 transition-all',
          isCollapsed ? 'p-1 justify-center' : 'p-3',
        )}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-black text-white text-sm shadow-lg flex-shrink-0">
            {role[0]?.toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-white capitalize truncate">{role}</p>
              <p className="text-[10px] text-slate-500 font-medium">Enterprise Access</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={onLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(o => !o)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-slate-900 rounded-xl shadow-2xl border border-white/5 text-white"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden md:block h-screen sticky top-0 transition-all duration-300 ease-in-out flex-shrink-0',
        isCollapsed ? 'w-[72px]' : 'w-64',
      )}>
        {content}
      </aside>

      {/* Mobile sidebar */}
      <aside className={cn(
        'md:hidden fixed inset-y-0 left-0 z-50 w-64 shadow-2xl transition-transform duration-300 ease-in-out',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        {content}
      </aside>
    </>
  );
};

export default Sidebar;
