import multer from 'multer';
import cloudinaryPackage from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

const cloudinary = cloudinaryPackage.v2;

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dr1rajqzy',
  api_key: process.env.CLOUDINARY_API_KEY || '262126185646844',
  api_secret: process.env.CLOUDINARY_API_SECRET || '6mf1GbLRWK8D0pQEyn3EoJedSuw',
});

// Verify configuration
console.log('🔧 Cloudinary Configuration:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'dr1rajqzy');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '⚠️ Using default');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '⚠️ Using default');

// Use memory storage so we can upload buffers directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype) return cb(new Error('File has no mimetype'), false);
  
  // Allowed image types
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF)'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Max 5 files at once
  },
});

// Helper to upload a buffer to Cloudinary and return the upload result
export const uploadToCloudinary = (fileBuffer, folder = 'beautybloom/products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'webp' }
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('✅ Image deleted from Cloudinary:', publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Upload multiple images
export const uploadMultipleToCloudinary = async (files, folder = 'beautybloom/products') => {
  try {
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file.buffer, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

// Generate Cloudinary URL with transformations
export const getCloudinaryUrl = (publicId, transformations = []) => {
  if (!publicId) return '';
  
  const defaultTransformations = [
    { quality: 'auto:good', fetch_format: 'auto' }
  ];
  
  const allTransformations = [...transformations, ...defaultTransformations];
  
  return cloudinary.url(publicId, {
    transformation: allTransformations
  });
};

export default cloudinary;