import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['reported', 'assigned', 'in_progress', 'cleaned', 'closed', 'rejected'],
      default: 'reported',
      index: true,
    },
    assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

complaintSchema.index({ location: '2dsphere' });

export const Complaint = mongoose.model('Complaint', complaintSchema);
