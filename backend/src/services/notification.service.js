import { Notification } from '../models/Notification.js';
import { getSocket } from './socket.service.js';

export async function sendNotification(userId, message, type = 'info') {
  const notification = await Notification.create({
    user: userId,
    message,
    type,
    status: 'unread',
  });

  const io = getSocket();
  if (io) {
    io.to(`user:${userId}`).emit('notification', {
      _id: notification._id,
      message,
      type,
      status: 'unread',
      createdAt: notification.createdAt,
    });
  }

  return notification;
}
