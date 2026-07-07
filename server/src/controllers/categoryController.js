import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

// @desc    Get all categories (including inactive for admin)
// @route   GET /api/admin/categories
// @access  Private/Admin
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({})
    .sort({ order: 1, name: 1 });
  
  res.json(categories);
});

// @desc    Get category by ID
// @route   GET /api/admin/categories/:id
// @access  Private/Admin
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  res.json(category);
});

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  console.log('📥 Admin create category request:', req.body);
  
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
  
  console.log('✅ Admin category created:', category);
  res.status(201).json(category);
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  console.log('📝 Admin update category:', req.params.id, req.body);
  
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const { name, description, image, parentCategory, order, isActive } = req.body;

  // Check if name already exists (excluding current category)
  if (name && name.trim() !== category.name) {
    const trimmedName = name.trim();
    
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      _id: { $ne: category._id }
    });
    
    if (existingCategory) {
      res.status(400);
      throw new Error('Category name already exists');
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
  console.log('✅ Admin category updated:', updatedCategory);
  res.json(updatedCategory);
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  console.log('🗑️ Admin delete category:', req.params.id);
  
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if category has products
  const productsCount = await Product.countDocuments({ category: category.name });
  
  if (productsCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category with ${productsCount} product(s). Delete products first or reassign them.`);
  }

  await category.deleteOne();
  console.log('✅ Admin category deleted:', category.name);
  res.json({ message: 'Category removed' });
});

// @desc    Get category statistics
// @route   GET /api/admin/categories/stats
// @access  Private/Admin
const getCategoryStats = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  
  // Get product counts for each category
  const productCounts = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    inactive: categories.filter(c => !c.isActive).length,
    productCounts: productCounts
  };
  
  res.json(stats);
});

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
};