import express from 'express';
import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('order');
  res.json(categories);
}));

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
router.get('/tree', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('order');
  
  // Build category tree
  const categoryMap = {};
  const tree = [];
  
  categories.forEach(category => {
    categoryMap[category._id] = { ...category.toObject(), children: [] };
  });
  
  categories.forEach(category => {
    if (category.parentCategory && categoryMap[category.parentCategory]) {
      categoryMap[category.parentCategory].children.push(categoryMap[category._id]);
    } else {
      tree.push(categoryMap[category._id]);
    }
  });
  
  res.json(tree);
}));

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
router.get('/slug/:slug', asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  
  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
}));

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
  console.log('📥 Create category request received:', req.body);
  
  const { name, description, image, parentCategory, order, isActive } = req.body;
  
  // Validate required fields
  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Category name is required');
  }
  
  const trimmedName = name.trim();
  
  // Check if category already exists (case-insensitive)
  const existingCategory = await Category.findOne({ 
    name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } 
  });
  
  if (existingCategory) {
    res.status(400);
    throw new Error('Category with this name already exists');
  }
  
  // Generate slug from name
  let slug = trimmedName.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  
  if (!slug || slug === '') {
    slug = `category-${Date.now()}`;
  }
  
  // Check if slug already exists
  const slugExists = await Category.findOne({ slug });
  if (slugExists) {
    slug = `${slug}-${Date.now()}`;
  }
  
  // Create category
  const category = await Category.create({
    name: trimmedName,
    slug: slug,
    description: description?.trim() || '',
    image: image?.trim() || '',
    parentCategory: parentCategory || null,
    order: order || 0,
    isActive: isActive !== undefined ? isActive : true
  });
  
  console.log('✅ Category created:', category);
  res.status(201).json(category);
}));

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  console.log('📝 Update category request:', req.params.id, req.body);
  
  const { name, description, image, parentCategory, order, isActive } = req.body;
  
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Update fields
  if (name && name.trim() !== category.name) {
    const trimmedName = name.trim();
    
    // Check if new name already exists (excluding current category)
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      _id: { $ne: category._id }
    });
    
    if (existingCategory) {
      res.status(400);
      throw new Error('Category with this name already exists');
    }
    
    category.name = trimmedName;
    
    // Generate new slug when name changes
    let slug = trimmedName.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    
    if (!slug || slug === '') {
      slug = `category-${Date.now()}`;
    }
    
    // Check if new slug already exists (excluding current category)
    const slugExists = await Category.findOne({ slug, _id: { $ne: category._id } });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }
    
    category.slug = slug;
  }
  
  if (description !== undefined) category.description = description?.trim() || '';
  if (image !== undefined) category.image = image?.trim() || '';
  if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
  if (order !== undefined) category.order = order;
  if (isActive !== undefined) category.isActive = isActive;
  
  const updatedCategory = await category.save();
  console.log('✅ Category updated:', updatedCategory);
  res.json(updatedCategory);
}));

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  console.log('🗑️ Delete category request:', req.params.id);
  
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Check if category has products
  const Product = (await import('../models/Product.js')).default;
  const productsCount = await Product.countDocuments({ category: category.name });
  
  if (productsCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category with ${productsCount} products. Move products first.`);
  }
  
  await category.deleteOne();
  console.log('✅ Category deleted:', category.name);
  res.json({ message: 'Category removed' });
}));

// @desc    Fix categories with null slugs (TEMPORARY - REMOVE AFTER USE)
// @route   POST /api/categories/fix-null-slugs
// @access  Private/Admin
router.post('/fix-null-slugs', protect, admin, asyncHandler(async (req, res) => {
  const categories = await Category.find({ slug: null });
  
  if (categories.length === 0) {
    res.json({ message: 'No categories with null slug found' });
    return;
  }
  
  const results = [];
  
  for (const cat of categories) {
    let slug = cat.name.toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    
    if (!slug || slug === '') {
      slug = `category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Check if slug already exists
    let existing = await Category.findOne({ slug, _id: { $ne: cat._id } });
    let newSlug = slug;
    let counter = 1;
    
    while (existing) {
      newSlug = `${slug}-${counter}`;
      existing = await Category.findOne({ slug: newSlug, _id: { $ne: cat._id } });
      counter++;
    }
    
    cat.slug = newSlug;
    await cat.save();
    
    results.push({
      id: cat._id,
      name: cat.name,
      oldSlug: null,
      newSlug: newSlug
    });
  }
  
  res.json({
    message: `Fixed ${results.length} categories with null slugs`,
    results: results
  });
}));

export default router;