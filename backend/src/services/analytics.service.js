import { Complaint } from '../models/Complaint.js';
import { User } from '../models/User.js';

export async function getAnalyticsSummary() {
  const [complaintsByStatus, usersByRole, totalComplaints] = await Promise.all([
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Complaint.countDocuments(),
  ]);

  return {
    totalComplaints,
    complaintsByStatus,
    usersByRole,
  };
}
