import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socket = io('/'); // Adjust URL if needed
      socket.emit('join-user-room', user.id);

      socket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};