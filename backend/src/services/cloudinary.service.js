import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageBuffer(buffer, folder = 'smart-waste') {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  
  // Check if Cloudinary is properly configured
  if (!cloudName || cloudName === 'Root' || cloudName === 'root') {
    throw new Error('Cloudinary is not properly configured. Please set a valid CLOUDINARY_CLOUD_NAME in .env');
  }

  try {
    const base64 = buffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64}`;

    return await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'image',
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    throw new Error(`Image upload failed: ${error.message}`);
  }
}

export async function deleteCloudinaryAsset(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
}
