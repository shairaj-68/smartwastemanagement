import React, { useMemo } from 'react';
import { Mail, Shield, CalendarClock, Phone, MapPinned } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();

  const joinedDate = useMemo(() => {
    if (!user?.createdAt) return 'Unknown';
    return new Date(user.createdAt).toLocaleDateString();
  }, [user?.createdAt]);

  const profileItems = [
    {
      label: 'Email',
      value: user?.email || 'Not available',
      icon: Mail,
    },
    {
      label: 'Role',
      value: user?.role || 'citizen',
      icon: Shield,
    },
    {
      label: 'Phone',
      value: user?.phone || 'Not set',
      icon: Phone,
    },
    {
      label: 'Address',
      value: user?.address || 'Not set',
      icon: MapPinned,
    },
    {
      label: 'Joined',
      value: joinedDate,
      icon: CalendarClock,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden">
      <Sidebar role={user?.role || 'citizen'} onLogout={logout} />

      <main className="flex-1 min-w-0 transition-all duration-300 lg:px-8 py-6">
        <div className="px-6 md:px-0">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="rounded-[2rem] border border-white/5 bg-slate-900/40 p-6 md:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_28%)] pointer-events-none" />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Profile</h1>
                  <p className="text-sm md:text-base text-slate-400">Account details and role information for your Smart Waste access.</p>
                </div>
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/20" />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/5 bg-slate-900/40 p-6 md:p-8 shadow-2xl backdrop-blur-sm">
              <div className="mb-6">
                <h2 className="text-xl font-black text-white">{user?.name || 'User'}</h2>
                <p className="text-sm uppercase tracking-[0.16em] text-emerald-400 mt-1">{user?.role || 'citizen'} account</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {profileItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                        <Icon size={16} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-100 break-words">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
