import { Notification } from '../models/Notification.js';

export async function listNotifications(req, res) {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  return res.status(200).json({
    status: 'success',
    data: notifications,
  });
}
