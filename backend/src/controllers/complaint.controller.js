import { Complaint } from '../models/Complaint.js';
import { uploadImageBuffer } from '../services/cloudinary.service.js';
import { sendNotification } from '../services/notification.service.js';

export async function submitComplaint(req, res) {
  const complaint = await Complaint.create({
    user: req.user._id,
    description: req.body.description,
    location: {
      type: 'Point',
      coordinates: req.body.coordinates,
    },
  });

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
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ status: 'error', message: 'Complaint not found' });
  }

  complaint.status = req.body.status;
  await complaint.save();

  if (complaint.user) {
    await sendNotification(complaint.user, `Complaint status updated to ${complaint.status}`);
  }

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
