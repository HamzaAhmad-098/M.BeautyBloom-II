import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload, uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// All routes require admin access
router.use(protect, admin);

// Upload route for Cloudinary - ADMIN VERSION
router.post('/upload/images', upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
    }

    console.log(`📤 Processing ${files.length} image(s) for Cloudinary upload...`);
    
    // Upload all files at once
    const uploadResults = await uploadMultipleToCloudinary(files, 'beautybloom/products');
    
    // Return proper format for Cloudinary
    const images = uploadResults.map(result => ({
      url: result.secure_url || result.url,
      public_id: result.public_id,
      asset_id: result.asset_id,
      width: result.width,
      height: result.height,
      format: result.format,
      created_at: result.created_at,
      alt: result.original_filename || ''
    }));
    
    console.log(`✅ Successfully uploaded ${images.length} image(s) to Cloudinary`);
    
    res.json({
      success: true,
      images: images,
      message: `Successfully uploaded ${images.length} image(s) to Cloudinary`,
    });
    
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error uploading images to Cloudinary' 
    });
  }
});

// Alternative: Single image upload endpoint
router.post('/upload/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    console.log('📤 Processing single image for Cloudinary upload...');
    
    // Upload single file to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'beautybloom/products');
    
    const image = {
      url: result.secure_url || result.url,
      public_id: result.public_id,
      asset_id: result.asset_id,
      width: result.width,
      height: result.height,
      format: result.format,
      created_at: result.created_at,
      alt: result.original_filename || ''
    };
    
    console.log('✅ Successfully uploaded image to Cloudinary:', image.public_id);
    
    res.json({
      success: true,
      image: image,
      message: 'Image uploaded successfully to Cloudinary',
    });
    
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error uploading image to Cloudinary' 
    });
  }
});

// Cloudinary status endpoint
router.get('/upload/cloudinary-status', (req, res) => {
  res.json({
    success: true,
    service: 'Cloudinary',
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dr1rajqzy',
    status: 'active',
    message: 'Cloudinary upload service is running'
  });
});

// Delete image from Cloudinary
router.delete('/upload/images/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Public ID is required' 
      });
    }

    const result = await deleteFromCloudinary(publicId);
    
    res.json({
      success: true,
      message: 'Image deleted from Cloudinary',
      result
    });
    
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error deleting image from Cloudinary' 
    });
  }
});

export default router;