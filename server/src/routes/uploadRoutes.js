import express from 'express';
import asyncHandler from 'express-async-handler';
import { upload, uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js'; // Add deleteFromCloudinary
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
router.post(
  '/',
  protect,
  admin,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    try {
      const result = await uploadToCloudinary(
        req.file.buffer,
        'beautybloom/uploads'
      );

      res.json({
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500);
      throw new Error('Failed to upload image');
    }
  })
);

// @desc    Upload multiple images to Cloudinary
// @route   POST /api/upload/multiple
// @access  Private/Admin
// Add this route to handle Cloudinary uploads from frontend
router.post(
  '/cloudinary',
  protect,
  admin,
  upload.array('images', 10),
  asyncHandler(async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error('No files uploaded');
      }

      console.log(`📤 Processing ${req.files.length} image(s) for Cloudinary...`);
      
      // Upload to Cloudinary
      const uploadPromises = req.files.map(file => 
        uploadToCloudinary(file.buffer, 'beautybloom/products')
      );
      
      const results = await Promise.all(uploadPromises);

      const images = results.map(result => ({
        url: result.secure_url,
        public_id: result.public_id,
        asset_id: result.asset_id,
        width: result.width,
        height: result.height,
        format: result.format,
        created_at: result.created_at,
        alt: result.original_filename || ''
      }));

      console.log(`✅ Uploaded ${images.length} image(s) to Cloudinary`);
      
      res.json({
        success: true,
        images: images,
        message: `Uploaded ${images.length} image(s) successfully`
      });
      
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      res.status(500);
      throw new Error('Failed to upload images to Cloudinary');
    }
  })
);

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private/Admin
router.delete(
  '/:publicId',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { publicId } = req.params;

    if (!publicId) {
      res.status(400);
      throw new Error('Public ID is required');
    }

    try {
      const result = await deleteFromCloudinary(publicId);
      res.json({ 
        success: true, 
        message: 'Image deleted successfully',
        result 
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500);
      throw new Error('Failed to delete image');
    }
  })
);

export default router;