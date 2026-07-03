import { Complaint } from '../models/Complaint.js';
import { Bin } from '../models/Bin.js';
import { User } from '../models/User.js';
import { sendNotification } from '../services/notification.service.js';

export async function viewAssignedComplaints(req, res) {
  const complaints = await Complaint.find({
    $or: [
      { assignedWorker: req.user._id },
      { status: 'pending' },
    ],
  })
    .sort({ createdAt: -1 })
    .populate('user', 'name email');

  return res.status(200).json({ status: 'success', data: complaints });
}

export async function updateCollectionStatus(req, res) {
  const complaint = await Complaint.findById(req.params.id).populate('user', '_id name');

  if (!complaint) {
    return res.status(404).json({ status: 'error', message: 'Complaint not found' });
  }

  const prevStatus = complaint.status;
  complaint.status = req.body.status;

  // Auto-assign worker when picking up a pending complaint
  if (!complaint.assignedWorker) {
    complaint.assignedWorker = req.user._id;
  }
  await complaint.save();

  const workerName = req.user.name || 'A worker';
  const snippet = complaint.description.slice(0, 50);

  // Notify citizen
  if (complaint.user?._id) {
    const isResolved = req.body.status === 'resolved' || req.body.status === 'cleaned';
    await sendNotification(
      complaint.user._id,
      isResolved
        ? `✅ Your complaint "${snippet}" has been resolved by ${workerName}`
        : `🔄 Your complaint "${snippet}" is now In Progress — ${workerName} is on it`,
      isResolved ? 'info' : 'info'
    );
  }

  // Notify admins
  const admins = await User.find({ role: 'admin' }).select('_id');
  await Promise.all(
    admins.map(admin =>
      sendNotification(
        admin._id,
        `Complaint "${snippet}" status: ${prevStatus} → ${complaint.status} by ${workerName}`,
        'info'
      )
    )
  );

  return res.status(200).json({
    status: 'success',
    message: 'Collection status updated',
    data: complaint,
  });
}

export async function viewAssignedBins(req, res) {
  const bins = await Bin.find({ assignedWorker: req.user._id })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    status: 'success',
    data: bins,
  });
}

export async function updateBinStatus(req, res) {
  const bin = await Bin.findById(req.params.id);

  if (!bin) {
    return res.status(404).json({ status: 'error', message: 'Bin not found' });
  }

  const isAssignedToWorker = bin.assignedWorker?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isAssignedToWorker && !isAdmin) {
    return res.status(403).json({ status: 'error', message: 'Bin not assigned to this worker' });
  }

  bin.status = req.body.status;
  if (req.body.status === 'collected') {
    bin.lastCollected = new Date();
  }
  await bin.save();

  return res.status(200).json({
    status: 'success',
    message: 'Bin status updated',
    data: bin,
  });
}
