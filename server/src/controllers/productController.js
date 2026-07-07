import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';


// ... existing imports ...

// @desc    Update a review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
const updateProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to update this review');
  }

  review.rating = rating;
  review.comment = comment;
  review.updatedAt = Date.now();

  // Recalculate product rating
  product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
  product.numReviews = product.reviews.length;

  await product.save();
  
  res.json({ 
    message: 'Review updated successfully',
    review,
    productRating: product.rating,
    numReviews: product.numReviews
  });
});

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to delete this review');
  }

  // Remove the review
  product.reviews.pull({ _id: req.params.reviewId });

  // Recalculate product rating
  if (product.reviews.length > 0) {
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
  } else {
    product.rating = 0;
  }
  
  product.numReviews = product.reviews.length;

  await product.save();
  
  res.json({ 
    message: 'Review deleted successfully',
    productRating: product.rating,
    numReviews: product.numReviews
  });
});


// @desc    Get products (paginated & filterable)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 20;
  const page = Number(req.query.pageNumber) || 1;
  
  // Extract all filter parameters
  const keyword = req.query.keyword
    ? {
        name: { $regex: req.query.keyword, $options: 'i' },
      }
    : {};
  
  const category = req.query.category;
  const brand = req.query.brand; // comma-separated string
  const minPrice = req.query.minPrice;
  const maxPrice = req.query.maxPrice;
  const rating = req.query.rating;
  const sort = req.query.sort || 'newest';

  // Build query object
  let query = { ...keyword };

  // Add category filter
  if (category && category.trim() !== '') {
    query.category = { $regex: category, $options: 'i' };
  }

  // Add brand filter (can be multiple brands)
  if (brand && brand.trim() !== '') {
    const brandsArray = brand.split(',');
    query.brand = { $in: brandsArray.map(b => new RegExp(b.trim(), 'i')) };
  }

  // Add price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice && !isNaN(minPrice)) {
      query.price.$gte = Number(minPrice);
    }
    if (maxPrice && !isNaN(maxPrice)) {
      query.price.$lte = Number(maxPrice);
    }
  }

  // Add rating filter
  if (rating && !isNaN(rating)) {
    query.rating = { $gte: Number(rating) };
  }

  console.log('Database Query:', JSON.stringify(query, null, 2));

  const count = await Product.countDocuments(query);
  
  // Sort options
  let sortOption = {};
  switch (sort) {
    case 'price-low':
      sortOption = { price: 1 };
      break;
    case 'price-high':
      sortOption = { price: -1 };
      break;
    case 'rating':
      sortOption = { rating: -1 };
      break;
    case 'popular':
      sortOption = { numReviews: -1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const products = await Product.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort(sortOption);

  res.json({ 
    products, 
    page, 
    pages: Math.ceil(count / pageSize),
    total: count 
  });
});
// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  console.log('📦 Creating product - Request body:', JSON.stringify(req.body, null, 2));
  console.log('👤 User:', req.user?._id);

  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const {
    name,
    price,
    description,
    images,
    brand,
    category,
    countInStock,
    stock,
    discountPrice,
    isFeatured,
    isNew,
    variants,
    subCategory,
    tags,
    weight,
    expiryDate,
  } = req.body || {};

  console.log('📝 Raw images received:', images);
  console.log('📝 Images type:', typeof images);
  console.log('📝 Is Array:', Array.isArray(images));

  // Validate required fields
  if (!name || !price || !brand || !category) {
    console.error('❌ Validation failed - missing required fields');
    res.status(400);
    throw new Error('name, price, brand and category are required');
  }

  // Process images - ensure they're in the correct format
  let processedImages = [];
  
  if (images) {
    if (Array.isArray(images)) {
      processedImages = images.map((img) => {
        // If img is already an object with url and public_id (from Cloudinary)
        if (typeof img === 'object' && img !== null) {
          return {
            url: img.url || img.secure_url || '',
            public_id: img.public_id || '',
            alt: img.alt || name || ''
          };
        }
        // If img is a string URL
        if (typeof img === 'string') {
          return {
            url: img,
            public_id: '',
            alt: name || ''
          };
        }
        return null;
      }).filter(img => img !== null && img.url); // Remove null and empty URLs
    } else if (typeof images === 'string') {
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) {
          processedImages = parsed.map(img => ({
            url: img.url || img.secure_url || (typeof img === 'string' ? img : ''),
            public_id: img.public_id || '',
            alt: img.alt || name || ''
          })).filter(img => img.url);
        }
      } catch (e) {
        // If not JSON, treat as comma-separated URLs
        processedImages = images.split(',')
          .map(url => url.trim())
          .filter(url => url)
          .map(url => ({ url, public_id: '', alt: name || '' }));
      }
    }
  }

  console.log('🖼️  Processed images:', processedImages);
  console.log('🖼️  Image count:', processedImages.length);

  const productData = {
    name: name.trim(),
    price: Number(price),
    user: req.user._id,
    images: processedImages,
    brand: brand.trim(),
    category,
    subCategory: subCategory || undefined,
    countInStock: countInStock !== undefined ? Number(countInStock) : (stock !== undefined ? Number(stock) : 0),
    stock: stock !== undefined ? Number(stock) : (countInStock !== undefined ? Number(countInStock) : 0),
    discountPrice: discountPrice !== undefined && discountPrice > 0 ? Number(discountPrice) : undefined,
    isFeatured: !!isFeatured,
    isNew: isNew !== undefined ? !!isNew : true,
    variants: Array.isArray(variants) ? variants : [],
    tags: Array.isArray(tags) ? tags : [],
    description: description ? description.trim() : '',
    weight,
    expiryDate,
  };

  console.log('💾 Final product data to save:', JSON.stringify(productData, null, 2));

  try {
    const product = new Product(productData);
    const createdProduct = await product.save();
    
    console.log('✅ Product saved to database:', {
      id: createdProduct._id,
      name: createdProduct.name,
      imageCount: createdProduct.images?.length || 0,
      images: createdProduct.images
    });
    
    res.status(201).json(createdProduct);
  } catch (saveError) {
    console.error('❌ Error saving product to database:', saveError);
    console.error('Error details:', saveError.message);
    if (saveError.errors) {
      console.error('Validation errors:', saveError.errors);
    }
    res.status(400);
    throw new Error(saveError.message || 'Failed to save product');
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    images,
    brand,
    category,
    countInStock,
    discountPrice,
    isFeatured,
    isNew,
    variants,
    subCategory,
    tags,
    weight,
    expiryDate,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Store old images for deletion
    const oldImages = product.images || [];
    
    product.name = name || product.name;
    product.price = price !== undefined ? price : product.price;
    product.description = description || product.description;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.subCategory = subCategory || product.subCategory;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
    product.isFeatured = isFeatured !== undefined ? !!isFeatured : product.isFeatured;
    product.isNew = isNew !== undefined ? !!isNew : product.isNew;
    product.variants = variants || product.variants;
    product.tags = tags || product.tags;
    product.weight = weight || product.weight;
    product.expiryDate = expiryDate || product.expiryDate;

    if (images && Array.isArray(images)) {
      const currentPublicIds = (product.images || []).map((i) => i.public_id).filter(Boolean);
      const newPublicIds = images.map((i) => i.public_id).filter(Boolean);

      // Delete removed images from Cloudinary
      const toDelete = currentPublicIds.filter((id) => id && !newPublicIds.includes(id));
      for (const publicId of toDelete) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (err) {
          console.error('Cloudinary delete error', publicId, err.message || err);
        }
      }

      product.images = images.map((i) => ({ 
        url: i.url || i.secure_url || '', 
        public_id: i.public_id || '', 
        alt: i.alt || name || product.name || '' 
      }));
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Delete images from Cloudinary
    if (product.images && product.images.length) {
      for (const img of product.images) {
        if (img.public_id) {
          try {
            await deleteFromCloudinary(img.public_id);
          } catch (err) {
            console.error('Cloudinary delete error', img.public_id, err.message || err);
          }
        }
      }
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
      verifiedPurchase: false,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});
// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(5);
  res.json(products);
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true });
  res.json(products);
});

// @desc    Get new arrivals
// @route   GET /api/products/new
// @access  Public
const getNewProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isNew: true }).sort({ createdAt: -1 }).limit(8);
  res.json(products);
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const products = await Product.find({ category: req.params.category });
  res.json(products);
});

// @desc    Get unique brands
// @route   GET /api/products/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand');
  res.json(brands);
});

// @desc    Get categories with counts
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.json(categories);
});

// ... existing exports, add the new functions ...
export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  updateProductReview,  // Add this
  deleteProductReview,  // And this
  getTopProducts,
  getFeaturedProducts,
  getNewProducts,
  getProductsByCategory,
  getBrands,
  getCategories,
};