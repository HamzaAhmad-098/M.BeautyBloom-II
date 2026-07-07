import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'User',
    },
    name: { 
      type: String, 
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    brand: { 
      type: String, 
      required: [true, 'Brand is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      // NO ENUM - allows any category value from your Category collection
    },
    subCategory: { 
      type: String,
      trim: true
    },
    price: { 
      type: Number, 
      required: [true, 'Price is required'],
      default: 0,
      min: [0, 'Price cannot be negative']
    },
    discountPrice: { 
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      default: 0,
      validate: {
        validator: function(value) {
          // Discount price should be less than regular price if set
          return !value || value === 0 || value < this.price;
        },
        message: 'Discount price must be less than regular price'
      }
    },
    countInStock: { 
      type: Number, 
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    stock: { 
      type: Number, 
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    sold: { 
      type: Number, 
      default: 0,
      min: [0, 'Sold quantity cannot be negative']
    },
    description: { 
      type: String, 
      default: '',
      trim: true
    },

    // Images array - Cloudinary compatible
    images: {
      type: [
        {
          url: { 
            type: String, 
            required: false 
          },
          public_id: { 
            type: String, 
            required: false 
          },
          file_id: { 
            type: String, 
            required: false 
          },
          alt: { 
            type: String, 
            required: false,
            default: 'Product image'
          },
        },
      ],
      default: [],
      required: false,
    },

    numReviews: { 
      type: Number, 
      default: 0,
      min: [0, 'Number of reviews cannot be negative']
    },
    rating: { 
      type: Number, 
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    reviews: [reviewSchema],
    tags: [{ 
      type: String,
      trim: true
    }],
    isFeatured: { 
      type: Boolean, 
      default: false 
    },
    isNew: { 
      type: Boolean, 
      default: true 
    },
    variants: [{ 
      name: { 
        type: String,
        trim: true
      }, 
      price: {
        type: Number,
        min: 0
      }, 
      stock: {
        type: Number,
        min: 0,
        default: 0
      }, 
      sku: {
        type: String,
        trim: true
      }
    }],
    weight: { 
      type: String,
      trim: true
    },
    expiryDate: { 
      type: Date 
    },
    
    // Additional cosmetics-specific fields
    ingredients: {
      type: String,
      trim: true,
      default: ''
    },
    howToUse: {
      type: String,
      trim: true,
      default: ''
    },
    benefits: {
      type: [String],
      default: []
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    shippingClass: {
      type: String,
      default: 'standard',
      trim: true
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNew: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ sold: -1 });

// Virtual for checking if product is in stock
productSchema.virtual('inStock').get(function() {
  return (this.stock > 0 || this.countInStock > 0);
});

// Virtual for getting effective price (discount or regular)
productSchema.virtual('effectivePrice').get(function() {
  return (this.discountPrice > 0) ? this.discountPrice : this.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.discountPrice > 0 && this.price > 0) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Recalculate rating and numReviews on save
productSchema.pre('save', function (next) {
  if (this.reviews && this.reviews.length > 0) {
    this.numReviews = this.reviews.length;
    this.rating =
      this.reviews.reduce((acc, item) => item.rating + acc, 0) /
      this.reviews.length;
  } else {
    this.numReviews = 0;
    this.rating = 0;
  }
  
  // Sync stock and countInStock if one is updated
  if (this.isModified('stock') && !this.isModified('countInStock')) {
    this.countInStock = this.stock;
  } else if (this.isModified('countInStock') && !this.isModified('stock')) {
    this.stock = this.countInStock;
  }
  
  next();
});

// Method to update rating (can be called manually)
productSchema.methods.updateRating = function() {
  if (this.reviews && this.reviews.length > 0) {
    this.numReviews = this.reviews.length;
    this.rating =
      this.reviews.reduce((acc, item) => item.rating + acc, 0) /
      this.reviews.length;
  } else {
    this.numReviews = 0;
    this.rating = 0;
  }
};

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
export default Product;