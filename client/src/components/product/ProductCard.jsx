import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { FaStar, FaShoppingCart, FaHeart, FaTag, FaImage } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  if (!product || !product._id) {
    return null;
  }

  useEffect(() => {
    // Construct image URL when component mounts or product changes
    const url = constructImageUrl();
    setImageUrl(url);
    setImageError(false);
  }, [product]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Adding to cart:', product._id, product.name);
    
    dispatch(addToCart({ 
      product: product,
      quantity: 1
    }));
    
    toast.success('Added to cart! 🛒', {
      duration: 2000,
      icon: '🛒'
    });
  };

  // ProductCard.jsx - Updated for Cloudinary
  const constructImageUrl = () => {
    console.log('Product image data:', {
      images: product.images,
      image: product.image,
      public_id: product.images?.[0]?.public_id
    });

    // 1. Try Cloudinary URL from images array first
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      
      // If it's already a full Cloudinary URL
      if (firstImage.url && firstImage.url.includes('cloudinary.com')) {
        console.log('Using Cloudinary URL:', firstImage.url);
        return firstImage.url;
      }
      
      // If it's an object with url property (any URL)
      if (firstImage.url) {
        return firstImage.url;
      }
      
      // If images[0] is directly a string URL
      if (typeof firstImage === 'string') {
        return firstImage;
      }
      
      // If we have a public_id but no URL, construct Cloudinary URL
      if (firstImage.public_id) {
        const cloudName = 'dr1rajqzy'; // Your Cloudinary cloud name
        // Remove any leading slash if exists
        const publicId = firstImage.public_id.startsWith('/') 
          ? firstImage.public_id.substring(1) 
          : firstImage.public_id;
        
        // Construct Cloudinary URL with your specific dimensions
        const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_872,h_1000,c_fill,q_auto,f_auto/${publicId}`;
        console.log('Generated Cloudinary URL:', cloudinaryUrl);
        return cloudinaryUrl;
      }
    }

    // 2. Try direct image property (backward compatibility)
    if (product.image) {
      // Check if it's already a full URL
      if (product.image.includes('http')) {
        return product.image;
      }
      
      // If it looks like a public_id (not a full URL)
      const cloudName = 'dr1rajqzy';
      const publicId = product.image.startsWith('/') 
        ? product.image.substring(1) 
        : product.image;
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_872,h_1000,c_fill,q_auto,f_auto/${publicId}`;
    }

    // 3. Fallback to a nice placeholder
    return getBeautyPlaceholder();
  };

  // Create a beauty-themed placeholder
  const getBeautyPlaceholder = () => {
    const beautyColors = [
      { bg: 'FFB6C1', text: '💄' }, // Light Pink
      { bg: 'E6E6FA', text: '🌸' }, // Lavender
      { bg: 'FFE4E1', text: '💋' }, // Misty Rose
      { bg: 'F0F8FF', text: '✨' }, // Alice Blue
      { bg: 'FFF0F5', text: '🦋' }, // Lavender Blush
      { bg: 'F5FFFA', text: '🌿' }, // Mint Cream
    ];
    
    const colorSet = beautyColors[Math.floor(Math.random() * beautyColors.length)];
    const text = product?.name?.substring(0, 2).toUpperCase() || 'BS'; // Beauty Store
    
    // Create SVG placeholder
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23${colorSet.bg}'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='72' fill='%23${getContrastColor(colorSet.bg)}'%3E${colorSet.text}%3C/text%3E%3Ctext x='50%25' y='60%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='24' fill='%23${getContrastColor(colorSet.bg)}'%3E${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;
  };

  // Helper to get contrasting text color
  const getContrastColor = (hexcolor) => {
    // If it's a 3-digit hex, expand it
    if (hexcolor.length === 3) {
      hexcolor = hexcolor.split('').map(c => c + c).join('');
    }
    
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark
    return luminance > 0.5 ? '000000' : 'ffffff';
  };

  // Calculate prices safely
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const originalPrice = product.discountPrice > 0 ? product.price : null;
  const discountPercentage = product.discountPrice > 0 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div 
      className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product._id}`} className="block">
        {/* Product Image Container */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 h-48 sm:h-56">
          {/* Loading skeleton */}
          {!imageUrl && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
          )}
          
          {/* Fallback icon if image fails */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
              <div className="text-center">
                <FaImage className="text-gray-400 text-4xl mx-auto mb-2" />
                <span className="text-xs text-gray-500">Loading Image...</span>
              </div>
            </div>
          )}
          
          {/* Actual Image */}
          {imageUrl && !imageError && (
            <img
              src={imageUrl}
              alt={product.name || 'Product'}
              className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
              loading="lazy"
              onError={() => {
                console.error('Failed to load image:', imageUrl);
                setImageError(true);
              }}
              onLoad={() => {
                setImageError(false);
              }}
            />
          )}
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              <FaTag className="inline mr-1" />
              {discountPercentage}% OFF
            </div>
          )}
          
          {/* New Product Badge */}
          {product.isNew && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
              NEW
            </div>
          )}
          
          {/* Stock Status Overlay */}
          <div className={`absolute bottom-0 left-0 right-0 p-2 text-xs font-medium text-center transition-all duration-300 transform ${
            product.stock > 10 
              ? 'bg-green-500/90 text-white' 
              : product.stock > 0 
                ? 'bg-yellow-500/90 text-white' 
                : 'bg-red-500/90 text-white'
          } ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            {product.stock > 10 
              ? 'In Stock' 
              : product.stock > 0 
                ? `Only ${product.stock} left` 
                : 'Out of Stock'}
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 truncate">
          {product.brand || 'Premium Brand'}
        </div>
        
        {/* Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name || 'Product Name'}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`text-xs sm:text-sm ${
                  i < Math.floor(product.rating || 0)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 fill-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-xs text-gray-600">
            ({product.numReviews || 0} reviews)
          </span>
        </div>
        
        {/* Price hidden from customers — ask on WhatsApp instead. Off badge above still shows discount. */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
            💬 Ask for Price
          </span>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 mobile-tap-target shadow-md hover:shadow-lg ${
            product.stock === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 active:scale-95'
          }`}
        >
          <FaShoppingCart className={product.stock === 0 ? 'opacity-50' : 'animate-bounce'} />
          <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
        
        {/* Category */}
        {product.category && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              {product.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;