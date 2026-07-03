import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ['citizen', 'worker', 'admin'],
      default: 'citizen',
      index: true,
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    refreshTokenHash: { type: String, default: '', select: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = mongoose.model('User', userSchema);
