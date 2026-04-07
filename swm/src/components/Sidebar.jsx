import React, { useState } from 'react';
import PropTypes from 'prop-types';
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

const menuGroups = [
  {
    title: 'MAIN',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'worker', 'citizen'] },
      { path: '/complaints', label: 'Complaints', icon: MessageSquare, roles: ['admin', 'citizen'] },
      { path: '/create-complaint', label: 'Create Complaint', icon: PlusSquare, roles: ['citizen'] },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { path: '/worker', label: 'Worker Tasks', icon: ClipboardList, roles: ['admin', 'worker'] },
      { path: '/admin', label: 'Admin Panel', icon: BarChart3, roles: ['admin'] },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'worker', 'citizen'] },
      { path: '/profile', label: 'Profile', icon: User, roles: ['admin', 'worker', 'citizen'] },
    ],
  },
];

function SidebarContent({ role, isCollapsed, onToggleCollapse, onNavigate, location, onLogout, closeMobile }) {
  return (
    <div className="flex flex-col min-h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out shadow-xl">
      <div className="flex items-center justify-between p-4 h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
            <Trash2 size={22} className="stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-black text-white tracking-tight leading-none text-lg">EcoClean</span>
              <span className="text-[10px] text-emerald-400 font-bold tracking-[0.2em] uppercase leading-none mt-1">Enterprise</span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
          type="button"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-2">
              {!isCollapsed && <h3 className="text-[11px] font-bold text-slate-500 px-3 tracking-[0.15em] mb-3">{group.title}</h3>}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        onNavigate(item.path);
                        closeMobile();
                      }}
                      className={cn(
                        'group flex items-center w-full rounded-xl transition-all duration-200 px-3 py-2.5 relative',
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white',
                      )}
                      title={isCollapsed ? item.label : ''}
                    >
                      <Icon
                        className={cn(
                          'flex-shrink-0 transition-all duration-300',
                          isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'group-hover:scale-110',
                          isCollapsed ? 'mx-auto' : 'mr-3',
                        )}
                        size={20}
                      />
                      {!isCollapsed && <span className="font-semibold text-sm tracking-wide">{item.label}</span>}
                      {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-l-full shadow-[0_0_12px_rgba(16,185,129,1)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 bg-slate-900/50 backdrop-blur-md">
        <div className={cn('flex items-center rounded-2xl bg-white/5 border border-white/5 transition-all', isCollapsed ? 'p-1 justify-center' : 'p-3')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-bold text-white shadow-lg">
            {role[0]}
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{role} Mode</p>
              <p className="text-[10px] text-slate-500 font-medium">Enterprise Access</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            type="button"
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
}

SidebarContent.propTypes = {
  role: PropTypes.string.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired }).isRequired,
  onLogout: PropTypes.func.isRequired,
  closeMobile: PropTypes.func.isRequired,
};

const Sidebar = ({ role = 'citizen', onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const closeMobile = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen((current) => !current)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-slate-900 rounded-xl shadow-2xl border border-white/5 text-white"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40 border-0 p-0"
        />
      )}

      <aside className={cn('hidden md:block self-stretch transition-all duration-500 ease-in-out', isCollapsed ? 'w-20' : 'w-72')}>
        <SidebarContent
          role={role}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((current) => !current)}
          onNavigate={(path) => navigate(path)}
          location={location}
          onLogout={onLogout}
          closeMobile={closeMobile}
        />
      </aside>

      <aside className={cn('md:hidden fixed inset-y-0 left-0 bg-slate-900 z-50 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) w-72 shadow-2xl', isMobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        <SidebarContent
          role={role}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((current) => !current)}
          onNavigate={(path) => {
            navigate(path);
            setIsMobileOpen(false);
          }}
          location={location}
          onLogout={onLogout}
          closeMobile={() => setIsMobileOpen(false)}
        />
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  role: PropTypes.string,
  onLogout: PropTypes.func.isRequired,
};

export default Sidebar;
