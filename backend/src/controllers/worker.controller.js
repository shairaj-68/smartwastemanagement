import { Complaint } from '../models/Complaint.js';
import { sendNotification } from '../services/notification.service.js';

export async function viewAssignedComplaints(req, res) {
  const complaints = await Complaint.find({ assignedWorker: req.user._id })
    .sort({ createdAt: -1 })
    .populate('user', 'name email');

  return res.status(200).json({
    status: 'success',
    data: complaints,
  });
}

export async function updateCollectionStatus(req, res) {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ status: 'error', message: 'Complaint not found' });
  }

  const isAssignedToWorker = complaint.assignedWorker?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isAssignedToWorker && !isAdmin) {
    return res.status(403).json({ status: 'error', message: 'Complaint not assigned to this worker' });
  }

  complaint.status = req.body.status;
  await complaint.save();

  if (complaint.user) {
    await sendNotification(complaint.user, `Worker updated complaint to ${complaint.status}`);
  }

  return res.status(200).json({
    status: 'success',
    message: 'Collection status updated',
    data: complaint,
  });
}
