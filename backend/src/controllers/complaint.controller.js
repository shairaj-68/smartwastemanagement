import { Complaint } from '../models/Complaint.js';
import { User } from '../models/User.js';
import { uploadImageBuffer } from '../services/cloudinary.service.js';
import { sendNotification } from '../services/notification.service.js';

export async function submitComplaint(req, res) {
  const complaint = await Complaint.create({
    user: req.user._id,
    type: req.body.type || 'other',
    description: req.body.description,
    location: {
      type: 'Point',
      coordinates: req.body.coordinates,
    },
    status: 'pending',
  });

  // Notify all admins about new complaint
  const admins = await User.find({ role: 'admin' }).select('_id');
  await Promise.all(
    admins.map(admin =>
      sendNotification(
        admin._id,
        `New complaint submitted: "${complaint.description.slice(0, 60)}" [${complaint.type}]`,
        'warning'
      )
    )
  );

  return res.status(201).json({
    status: 'success',
    message: 'Complaint submitted',
    data: complaint,
  });
}

export async function getComplaintById(req, res) {
  const complaint = await Complaint.findById(req.params.id)
    .populate('user', 'name email role')
    .populate('assignedWorker', 'name email role');

  if (!complaint) {
    return res.status(404).json({ status: 'error', message: 'Complaint not found' });
  }

  if (req.user.role === 'citizen' && complaint.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ status: 'error', message: 'Not allowed to access this complaint' });
  }

  return res.status(200).json({
    status: 'success',
    data: complaint,
  });
}

export async function listComplaints(req, res) {
  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.user.role === 'citizen') {
    query.user = req.user._id;
  }
  if (req.user.role === 'worker') {
    query.assignedWorker = req.user._id;
  }

  const [items, total] = await Promise.all([
    Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email role')
      .populate('assignedWorker', 'name email role'),
    Complaint.countDocuments(query),
  ]);

  return res.status(200).json({
    status: 'success',
    data: {
      items,
      page,
      limit,
      total,
    },
  });
}

export async function updateComplaintStatus(req, res) {
  const complaint = await Complaint.findById(req.params.id).populate('user', '_id name');
  if (!complaint) {
    return res.status(404).json({ status: 'error', message: 'Complaint not found' });
  }

  const prevStatus = complaint.status;
  complaint.status = req.body.status;
  if (req.body.status === 'in_progress' && !complaint.assignedWorker) {
    complaint.assignedWorker = req.user._id;
  }
  await complaint.save();

  const statusLabel = { in_progress: 'In Progress', resolved: 'Resolved', pending: 'Pending' }[complaint.status] || complaint.status;
  const workerName = req.user.name || 'A worker';

  // Notify citizen
  if (complaint.user?._id) {
    await sendNotification(
      complaint.user._id,
      `Your complaint "${complaint.description.slice(0, 50)}" is now ${statusLabel} — updated by ${workerName}`,
      complaint.status === 'resolved' || complaint.status === 'cleaned' ? 'info' : 'info'
    );
  }

  // Notify admins
  const admins = await User.find({ role: 'admin' }).select('_id');
  await Promise.all(
    admins.map(admin =>
      sendNotification(
        admin._id,
        `Complaint status changed from ${prevStatus} → ${complaint.status} by ${workerName}`,
        'info'
      )
    )
  );

  return res.status(200).json({
    status: 'success',
    message: 'Complaint status updated',
    data: complaint,
  });
}

export async function uploadComplaintImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'Image file is required' });
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ status: 'error', message: 'Complaint not found' });
  }

  if (req.user.role === 'citizen' && complaint.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ status: 'error', message: 'Not allowed to upload for this complaint' });
  }

  try {
    const uploadResult = await uploadImageBuffer(req.file.buffer, 'smart-waste/complaints');
    complaint.imageUrl = uploadResult.secure_url;
    complaint.imagePublicId = uploadResult.public_id;
    await complaint.save();

    return res.status(200).json({
      status: 'success',
      message: 'Image uploaded',
      data: {
        complaintId: complaint._id,
        imageUrl: complaint.imageUrl,
      },
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Image upload failed. Complaint was created but image could not be uploaded.' 
    });
  }
}

export async function listNearbyComplaints(req, res) {
  const { lng, lat, radiusKm } = req.query;

  const items = await Complaint.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: radiusKm * 1000,
      },
    },
  })
    .limit(100)
    .populate('user', 'name email role')
    .populate('assignedWorker', 'name email role');

  return res.status(200).json({
    status: 'success',
    data: {
      count: items.length,
      items,
    },
  });
}
