import { Complaint } from '../models/Complaint.js';
import { User } from '../models/User.js';
import { getAnalyticsSummary } from '../services/analytics.service.js';
import { sendNotification } from '../services/notification.service.js';

export async function assignWorker(req, res) {
  const { complaintId, workerId } = req.body;

  const [complaint, worker] = await Promise.all([
    Complaint.findById(complaintId),
    User.findById(workerId),
  ]);

  if (!complaint) {
    return res.status(404).json({ status: 'error', message: 'Complaint not found' });
  }
  if (!worker || worker.role !== 'worker') {
    return res.status(400).json({ status: 'error', message: 'Invalid worker' });
  }

  complaint.assignedWorker = worker._id;
  complaint.status = 'assigned';
  await complaint.save();

  await Promise.all([
    sendNotification(worker._id, `You have been assigned complaint ${complaint._id}`),
    sendNotification(complaint.user, `Your complaint has been assigned to a worker`),
  ]);

  return res.status(200).json({
    status: 'success',
    message: 'Worker assigned successfully',
    data: complaint,
  });
}

export async function manageUsers(req, res) {
  const users = await User.find().select('-password -refreshTokenHash').sort({ createdAt: -1 });
  return res.status(200).json({
    status: 'success',
    data: users,
  });
}

export async function viewAnalytics(req, res) {
  const summary = await getAnalyticsSummary();
  return res.status(200).json({
    status: 'success',
    data: summary,
  });
}

export async function deleteComplaint(req, res) {
  const complaint = await Complaint.findByIdAndDelete(req.params.id);
  if (!complaint) {
    return res.status(404).json({ status: 'error', message: 'Complaint not found' });
  }

  return res.status(200).json({
    status: 'success',
    message: 'Complaint deleted',
  });
}
