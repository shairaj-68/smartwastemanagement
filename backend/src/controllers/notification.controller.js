import { Notification } from '../models/Notification.js';

export async function listNotifications(req, res) {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100);
  return res.status(200).json({ status: 'success', data: notifications });
}

export async function markRead(req, res) {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { status: 'read' }
  );
  return res.status(200).json({ status: 'success', message: 'Marked as read' });
}

export async function markAllRead(req, res) {
  await Notification.updateMany({ user: req.user._id, status: 'unread' }, { status: 'read' });
  return res.status(200).json({ status: 'success', message: 'All marked as read' });
}
