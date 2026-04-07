import { Notification } from '../models/Notification.js';
import { getSocket } from './socket.service.js';

export async function sendNotification(userId, message) {
  const notification = await Notification.create({
    user: userId,
    message,
    status: 'unread',
  });

  const io = getSocket();
  if (io) {
    io.to(`user:${userId}`).emit('notification', {
      id: notification._id,
      message,
      createdAt: notification.createdAt,
    });
  }

  return notification;
}
