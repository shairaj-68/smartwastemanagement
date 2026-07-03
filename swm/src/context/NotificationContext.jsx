import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  useEffect(() => {
    if (!user) return;

    // Fetch existing notifications
    api.get('/notifications').then(res => {
      setNotifications(res.data.data || []);
    }).catch(() => {});

    // Connect socket
    const socket = io('http://localhost:5000', { withCredentials: true });
    socket.emit('join-user-room', user._id || user.id);

    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => socket.disconnect();
  }, [user]);

  const markRead = useCallback(async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' } : n));
  }, []);

  const markAllRead = useCallback(async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
