import mongoose from 'mongoose';

const binSchema = new mongoose.Schema(
  {
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
    binId: { type: String, required: true, unique: true },
    capacity: { type: Number, default: 100 }, // percentage
    assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    schedule: {
      frequency: { type: String, enum: ['daily', 'weekly', 'biweekly'], default: 'daily' },
      preferredTime: { type: String, default: '09:00' }, // HH:MM format
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'full', 'collected'],
      default: 'active',
    },
    lastCollected: { type: Date, default: null },
    area: { type: String, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

binSchema.index({ location: '2dsphere' });
binSchema.index({ assignedWorker: 1, status: 1 });

export const Bin = mongoose.model('Bin', binSchema);