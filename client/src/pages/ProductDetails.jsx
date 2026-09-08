import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { FaStar, FaShippingFast, FaShieldAlt, FaUndo, FaHeart, FaShareAlt, FaMinus, FaPlus, FaCheck, FaUser, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { analytics } from '@/utils/analytics';
const ProductDetails = () => {
  
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Helper function to construct Cloudinary image URL
  const constructImageUrl = (imageData) => {
    if (!imageData) {
      return 'https://via.placeholder.com/600';
    }

    if (typeof imageData === 'string') {
      if (imageData.includes('http')) {
        return imageData;
      }
      const cloudName = 'dr1rajqzy';
      const publicId = imageData.startsWith('/') ? imageData.substring(1) : imageData;
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_800,h_600,c_fill,q_auto,f_auto/${publicId}`;
    }

    if (imageData.url) {
      if (imageData.url.includes('cloudinary.com')) {
        return imageData.url;
      }
      if (imageData.url.includes('http')) {
        return imageData.url;
      }
    }

    if (imageData.public_id) {
      const cloudName = 'dr1rajqzy';
      const publicId = imageData.public_id.startsWith('/') 
        ? imageData.public_id.substring(1) 
        : imageData.public_id;
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_800,h_600,c_fill,q_auto,f_auto/${publicId}`;
    }

    return 'https://via.placeholder.com/600';
  };

  // ProductDetails.jsx - Fix the useEffect dependency array

useEffect(() => {
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      const productData = response.data;
      
      // Handle stock field properly
      if (productData.countInStock !== undefined) {
        productData.stock = productData.countInStock;
      } else if (productData.stock !== undefined) {
        productData.stock = productData.stock;
      } else {
        productData.stock = 0;
      }
      
      productData.countInStock = productData.stock;
      
      setProduct(productData);
      setReviews(productData.reviews || []);
      
      // Check if user has already reviewed this product
      if (userInfo) {
        const hasReviewed = productData.reviews?.some(
          review => review.user === userInfo._id || review.user?._id === userInfo._id
        );
        setUserHasReviewed(hasReviewed);
      }
      
      if (productData.variants && productData.variants.length > 0) {
        setSelectedVariant(productData.variants[0].name);
      }
      
      // Track product view AFTER setting product state
      if (productData) {
        analytics.trackProductView(productData);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Product not found');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [id, navigate, userInfo]); // REMOVED 'product' from dependencies to prevent infinite loop
  const handleAddToCart = () => {
    if (product.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }
    
    dispatch(addToCart({ 
      product,
      quantity,
      variant: selectedVariant 
    }));
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (product.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }
    dispatch(addToCart({
      product,
      quantity,
      variant: selectedVariant
    }));
    // Buy Now skips the cart page and goes straight to checkout,
    // where the order is saved and also sent to WhatsApp.
    navigate('/checkout');
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      if (quantity < product.stock) {
        setQuantity(quantity + 1);
      }
    } else {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Cosmetics Store`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Handle review form input changes
  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: name === 'rating' ? parseInt(value) : value,
    });
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!userInfo) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error('Please enter your review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (editingReview) {
        // Update existing review
        response = await axios.put(
          `/api/products/${id}/reviews/${editingReview._id}`,
          reviewForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('Review updated successfully!');
      } else {
        // Create new review
        response = await axios.post(
          `/api/products/${id}/reviews`,
          reviewForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('Review submitted successfully!');
      }
      
      // Refresh product data to get updated reviews
      const productResponse = await axios.get(`/api/products/${id}`);
      const updatedProduct = productResponse.data;
      
      // Update stock fields
      if (updatedProduct.countInStock !== undefined) {
        updatedProduct.stock = updatedProduct.countInStock;
      }
      updatedProduct.countInStock = updatedProduct.stock;
      
      setProduct(updatedProduct);
      setReviews(updatedProduct.reviews || []);
      setUserHasReviewed(true);
      setShowReviewForm(false);
      setEditingReview(null);
      setReviewForm({ rating: 5, comment: '' });
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Edit review
  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      comment: review.comment,
    });
    setShowReviewForm(true);
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/products/${id}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Review deleted successfully!');
      
      // Refresh product data
      const response = await axios.get(`/api/products/${id}`);
      const updatedProduct = response.data;
      
      // Update stock fields
      if (updatedProduct.countInStock !== undefined) {
        updatedProduct.stock = updatedProduct.countInStock;
      }
      updatedProduct.countInStock = updatedProduct.stock;
      
      setProduct(updatedProduct);
      setReviews(updatedProduct.reviews || []);
      setUserHasReviewed(false);
      
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  // Check if user can edit/delete review
  const canEditReview = (review) => {
    if (!userInfo) return false;
    return (
      review.user === userInfo._id || 
      review.user?._id === userInfo._id ||
      userInfo.isAdmin
    );
  };

  const features = [
    { icon: <FaShippingFast />, text: 'Free Shipping', subtext: 'On orders above Rs. 2000' },
    { icon: <FaShieldAlt />, text: '100% Authentic', subtext: 'Guaranteed genuine' },
    { icon: <FaUndo />, text: 'Easy Returns', subtext: '14-day return policy' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-[500px] rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Product not found</h2>
          <button
            onClick={() => navigate('/shop')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const originalPrice = product.discountPrice > 0 ? product.price : null;
  const discountPercentage = product.discountPrice > 0 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Calculate rating distribution
  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };
  
  reviews.forEach(review => {
    ratingDistribution[review.rating]++;
  });

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex text-sm">
            <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
            <span className="mx-2">/</span>
            <a href="/shop" className="text-gray-500 hover:text-gray-700">Shop</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{product.category}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-semibold truncate">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="sticky top-24">
              {/* Main Image */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
                <img
                  src={constructImageUrl(product.images?.[selectedImage])}
                  alt={product.name}
                  className="w-full h-[500px] object-contain p-8"
                />
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index
                          ? 'border-primary-500'
                          : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={constructImageUrl(img)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              {/* Brand & Name */}
              <div className="mb-4">
                <span className="text-sm text-gray-500 uppercase tracking-wider">
                  {product.brand}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  ({product.numReviews || 0} reviews)
                </span>
                <a 
                  href="#reviews-section" 
                  className="ml-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  See all reviews
                </a>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl font-bold text-gray-900">
                    Rs. {price?.toLocaleString()}
                  </span>
                  {originalPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        Rs. {originalPrice.toLocaleString()}
                      </span>
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Inclusive of all taxes</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="flex items-center text-green-600">
                    <FaCheck className="mr-2" />
                    <span className="font-medium">
                      {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left in stock`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <span className="font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Variant
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariant(variant.name)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedVariant === variant.name
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      disabled={quantity === 1}
                      className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <FaMinus />
                    </button>
                    <span className="px-6 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      disabled={quantity >= product.stock}
                      className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  Buy Now
                </button>
              </div>

              {/* Wishlist & Share */}
              <div className="flex space-x-3 mb-6">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${
                    isWishlisted
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <FaHeart className={`inline mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                  {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 font-medium transition-all"
                >
                  <FaShareAlt className="inline mr-2" />
                  Share
                </button>
              </div>

              {/* Features */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-3 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl text-primary-500 mb-2">{feature.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{feature.text}</div>
                      <div className="text-xs text-gray-500 mt-1">{feature.subtext}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs - Removed reviews from tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-12">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {['description', 'ingredients', 'how-to-use', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium capitalize whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Description</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                  
                  {product.benefits && product.benefits.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Key Benefits:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {product.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center">
                            <FaCheck className="text-green-500 mr-2" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">
                    {product.ingredients || 'Ingredient information not available.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'how-to-use' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">How to Use</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">
                    {product.howToUse || 'Usage instructions not available.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Shipping & Returns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-3">Shipping Information</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Free shipping on orders above Rs. 2000</li>
                      <li>• Standard shipping: Rs. 200</li>
                      <li>• Delivery within 3-7 business days</li>
                      <li>• Cash on Delivery available</li>
                      <li>• Same day delivery in major cities</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-3">Return Policy</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• 14-day return policy</li>
                      <li>• Products must be unopened and unused</li>
                      <li>• Original packaging required</li>
                      <li>• Free returns for damaged items</li>
                      <li>• Refund processed within 7 days</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Separate Reviews Section */}
        <div id="reviews-section" className="bg-white rounded-xl shadow-lg mb-12">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{product.rating?.toFixed(1)}</div>
                    <div className="flex items-center justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-lg ${
                            i < Math.floor(product.rating || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 fill-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-gray-600">
                    <div className="text-lg font-medium">{product.numReviews || 0} reviews</div>
                    <div className="text-sm">Based on customer feedback</div>
                  </div>
                </div>
              </div>
              
              {/* Write Review Button */}
              {userInfo && !userHasReviewed && !showReviewForm && !editingReview && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Write a Review
                </button>
              )}
            </div>

            {/* Rating Distribution */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const percentage = reviews.length > 0 ? (ratingDistribution[star] / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center">
                      <div className="flex items-center w-20">
                        <span className="text-sm font-medium text-gray-600 w-4">{star}</span>
                        <FaStar className="text-yellow-400 ml-2" />
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm text-gray-600">
                        {ratingDistribution[star]} ({percentage.toFixed(0)}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review Form */}
            {(showReviewForm || editingReview) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-semibold mb-4">
                  {editingReview ? 'Edit Your Review' : 'Write Your Review'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="text-2xl focus:outline-none"
                        >
                          <FaStar
                            className={star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-gray-600">
                        {reviewForm.rating} out of 5
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      name="comment"
                      value={reviewForm.comment}
                      onChange={handleReviewInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Share your experience with this product..."
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewForm.comment.trim()}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
                    </button>
                    <button
                      onClick={() => {
                        setShowReviewForm(false);
                        setEditingReview(null);
                        setReviewForm({ rating: 5, comment: '' });
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  All Reviews ({reviews.length})
                </h3>
                {reviews.length > 3 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                  </button>
                )}
              </div>
              
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {visibleReviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{review.name}</div>
                            <div className="flex items-center mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={`text-sm ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300 fill-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.verifiedPurchase && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      
                      {/* Review Actions */}
                      {canEditReview(review) && (
                        <div className="flex space-x-3 mt-3">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="text-sm text-red-600 hover:text-red-700 flex items-center"
                          >
                            <FaTrash className="mr-1" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No reviews yet</h4>
                  <p className="text-gray-600 mb-6">Be the first to share your thoughts about this product!</p>
                  {userInfo && !userHasReviewed && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Write the First Review
                    </button>
                  )}
                  {!userInfo && (
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Login to Write a Review
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ProductDetails;