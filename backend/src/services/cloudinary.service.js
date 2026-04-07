import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageBuffer(buffer, folder = 'smart-waste') {
  if (!env.nodeEnv || !process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary is not configured');
  }

  const base64 = buffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64}`;

  return cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
  });
}

export async function deleteCloudinaryAsset(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}
