import React from 'react';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ children, activeTab, onTabChange, onLogout, user }) => {
  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100">
      <Sidebar 
        role={user?.role || 'citizen'} 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        onLogout={onLogout}
      />
      <main className="flex-1 min-w-0 transition-all duration-300 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;