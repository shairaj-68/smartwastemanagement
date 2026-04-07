import { v2 as cloudinary } from 'cloudinary';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MIME_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'image/avif': '.avif',
};

async function saveLocally(buffer, folder, mimeType = 'image/jpeg') {
  const extension = MIME_EXTENSIONS[mimeType] || '.jpg';
  const relativeDir = folder.split('/').filter(Boolean);
  const fileName = `${randomUUID()}${extension}`;
  const absoluteDir = path.join(process.cwd(), 'uploads', ...relativeDir);
  const absoluteFilePath = path.join(absoluteDir, fileName);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(absoluteFilePath, buffer);

  const publicPath = ['uploads', ...relativeDir, fileName].join('/');

  return {
    secure_url: `${env.serverUrl.replace(/\/$/, '')}/${publicPath}`,
    public_id: publicPath,
  };
}

export async function uploadImageBuffer(buffer, folder = 'smart-waste') {
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      const base64 = buffer.toString('base64');
      const dataUri = `data:image/jpeg;base64,${base64}`;

      return await cloudinary.uploader.upload(dataUri, {
        folder,
        resource_type: 'image',
      });
    } catch {
      // Fall back to local storage when Cloudinary credentials are missing or invalid.
    }
  }

  return saveLocally(buffer, folder);
}

export async function deleteCloudinaryAsset(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}
