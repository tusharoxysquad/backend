const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

/**
 * Upload a file buffer to Cloudinary
 * @param {Express.Multer.File} file - multer file object (memory storage)
 * @param {string} folder - Cloudinary folder name
 * @returns {{ imageUrl: string, publicId: string }}
 */
const uploadImage = (file, folder = 'uploads') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ imageUrl: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(file.buffer).pipe(stream);
  });
};

const uploadImageFromUrl = async (url, folder = 'uploads') => {
  const result = await cloudinary.uploader.upload(url, { folder, resource_type: 'image' });
  return { imageUrl: result.secure_url, publicId: result.public_id };
};

/**
 * Delete an image from Cloudinary by publicId
 * @param {string} publicId
 */
const deleteImage = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, uploadImageFromUrl, deleteImage };
