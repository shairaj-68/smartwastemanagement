import mongoose from 'mongoose';

const workerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    assignedArea: { type: String, default: '' },
    availabilityStatus: {
      type: String,
      enum: ['available', 'on_duty', 'off_duty'],
      default: 'available',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const WorkerProfile = mongoose.model('WorkerProfile', workerProfileSchema);
