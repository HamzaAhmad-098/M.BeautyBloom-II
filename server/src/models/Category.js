import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Category name must be at least 2 characters long'],
      maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      unique: true,
      sparse: true, // This allows multiple null values but enforces uniqueness for non-null values
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      trim: true,
      default: ''
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save middleware to generate slug if not provided
categorySchema.pre('save', async function(next) {
  // Only generate slug if it's not already set or if name changed
  if (!this.slug || this.isModified('name')) {
    let slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    
    // If slug is empty after cleaning, generate a random one
    if (!slug || slug === '') {
      slug = `category-${Date.now()}`;
    }
    
    // Check for existing slug
    let slugExists = await this.constructor.findOne({ 
      slug, 
      _id: { $ne: this._id } 
    });
    
    // If slug exists, append timestamp
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }
    
    this.slug = slug;
  }
  
  next();
});

// Index for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ parentCategory: 1 });

// Virtual for getting products count (if needed)
categorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: 'name',
  foreignField: 'category',
  count: true
});

// Ensure virtuals are included in JSON
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;