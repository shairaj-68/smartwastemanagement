import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';
import { cn } from '../utils/cn';
import AdminLayout from '../layouts/AdminLayout';

const ROLE_STYLE = {
  admin:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  worker:  'bg-blue-500/10   text-blue-400   border-blue-500/20',
  citizen: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const Profile = () => {
  const { user, logout } = useAuth();

  const fields = [
    { icon: User,     label: 'Full Name',    value: user?.name  || '—' },
    { icon: Mail,     label: 'Email',        value: user?.email || '—' },
    { icon: Shield,   label: 'Role',         value: user?.role  || '—', isRole: true },
    { icon: Calendar, label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
  ];

  return (
    <AdminLayout title="Profile" subtitle="EcoClean Smart Waste">
      <div className="max-w-2xl space-y-6">

        {/* Avatar card */}
        <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] p-8 shadow-2xl flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-green-500/20 flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{user?.name || 'Unknown'}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{user?.email}</p>
            <span className={cn('inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border', ROLE_STYLE[user?.role] || ROLE_STYLE.citizen)}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Details panel */}
        <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-bold text-white tracking-tight">Account Details</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Your profile information</p>
          </div>
          <div className="divide-y divide-white/5">
            {fields.map(({ icon: Icon, label, value, isRole }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                  {isRole ? (
                    <span className={cn('inline-block mt-0.5 px-2 py-0.5 rounded-lg text-xs font-black uppercase tracking-widest border', ROLE_STYLE[value] || ROLE_STYLE.citizen)}>
                      {value}
                    </span>
                  ) : (
                    <p className="text-sm font-semibold text-white mt-0.5 truncate">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-3 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white font-bold rounded-xl transition-all text-sm"
        >
          <LogOut size={16} />
          Sign Out
        </button>

      </div>
    </AdminLayout>
  );
};

export default Profile;
