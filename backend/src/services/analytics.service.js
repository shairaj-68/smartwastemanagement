import { Complaint } from '../models/Complaint.js';
import { User } from '../models/User.js';
import { Bin } from '../models/Bin.js';

export async function getAnalyticsSummary() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    activeComplaints,
    resolvedToday,
    binsNearFull,
    workersOnDuty,
    totalComplaints,
    complaintsByStatus,
    usersByRole,
  ] = await Promise.all([
    Complaint.countDocuments({ status: { $in: ['pending', 'assigned', 'in_progress'] } }),
    Complaint.countDocuments({ status: { $in: ['resolved', 'cleaned'] }, updatedAt: { $gte: todayStart } }),
    Bin.countDocuments({ capacity: { $gte: 80 }, status: { $ne: 'collected' } }),
    User.countDocuments({ role: 'worker' }),
    Complaint.countDocuments(),
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
  ]);

  return {
    activeComplaints,
    resolvedToday,
    binsNearFull,
    workersOnDuty,
    totalComplaints,
    complaintsByStatus,
    usersByRole,
  };
}
