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

/**
 * Upload a document (PDF, DOC, DOCX, PPT, PPTX) buffer to Cloudinary
 * @param {Express.Multer.File} file - multer file object (memory storage)
 * @param {string} folder - Cloudinary folder name
 * @returns {{ fileName: string, originalName: string, fileUrl: string, fileSize: number, mimeType: string, publicId: string }}
 */
const uploadDocument = (file, folder = 'documents') => {
  const ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
  const baseName = file.originalname.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const publicId = `${folder}/${baseName}_${Date.now()}${ext}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: 'raw', use_filename: false },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          fileName: result.public_id.split('/').pop(),
          originalName: file.originalname,
          fileUrl: result.secure_url,
          fileSize: file.size,
          mimeType: file.mimetype,
          publicId: result.public_id,
        });
      }
    );
    Readable.from(file.buffer).pipe(stream);
  });
};

/**
 * Delete a raw file (document) from Cloudinary by publicId
 * @param {string} publicId
 */
const deleteDocument = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
};

module.exports = { uploadImage, uploadImageFromUrl, deleteImage, uploadDocument, deleteDocument };
