import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaUpload, FaTimes, FaSpinner } from 'react-icons/fa';
import { adminProductApi, adminCategoryApi } from '@/services/adminApi.js';
import { toast } from 'react-toastify';

const ProductForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState([]); // Now will be fetched from DB
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    brand: '',
    stock: '',
    isFeatured: false,
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    if (mode === 'edit' && id) {
      fetchProduct();
    }
  }, [mode, id]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await adminCategoryApi.getAllCategories();
      
      // Filter active categories only for product creation/editing
      const activeCategories = data
        .filter(cat => cat.isActive)
        .map(cat => ({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          isActive: cat.isActive
        }));
      
      setCategories(activeCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
      // Fallback to some default categories if fetch fails
      setCategories([
        'Skincare',
        'Makeup',
        'Haircare',
        'Fragrance',
        'Bath & Body',
        'Tools & Brushes'
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProduct = async () => {
  try {
    setLoading(true);
    const data = await adminProductApi.getProductById(id);
    setFormData({
      name: data.name || '',
      description: data.description || '',
      price: data.price ? String(data.price) : '', // Convert to string
      discountPrice: data.discountPrice ? String(data.discountPrice) : '', // Convert to string
      category: data.category?._id || data.category || '',
      brand: data.brand || '',
      stock: data.countInStock ? String(data.countInStock) : 
             data.stock ? String(data.stock) : '',
      isFeatured: data.isFeatured || false,
    });
    setImages(data.images || []);
  } catch (error) {
    console.error('Error fetching product:', error);
    toast.error('Failed to fetch product');
    navigate('/admin/products');
  } finally {
    setLoading(false);
  }
};

  const fetchBrands = async () => {
    try {
      const data = await adminProductApi.getBrands();
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  setUploading(true);
  try {
    const formDataObj = new FormData();
    files.forEach(file => {
      formDataObj.append('images', file);
    });

    console.log('📤 Uploading', files.length, 'image(s) to Cloudinary...');
    
    // Upload to Cloudinary via backend
    const response = await adminProductApi.uploadImages(formDataObj);
    console.log('✅ Cloudinary upload response:', response);
    
    // Handle the response format - assuming response.images contains Cloudinary image objects
    const newImages = response.images || response.data?.images || response;
    
    console.log('📸 New images received:', newImages);
    
    // Format images for product data
    const formattedImages = newImages.map(img => ({
      url: img.secure_url || img.url,
      public_id: img.public_id,
      alt: img.alt || formData.name || 'Product image'
    }));
    
    setImages(prev => [...prev, ...formattedImages]);
    
    toast.success(`${formattedImages.length} image(s) uploaded successfully`);
  } catch (error) {
    console.error('❌ Error uploading images:', error);
    const errorMsg = error.response?.data?.message || 
                    error.message || 
                    'Failed to upload images';
    toast.error(errorMsg);
  } finally {
    setUploading(false);
  }
};

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Form submitted');
    console.log('📝 Current form data:', formData);
    console.log('🖼️ Current images STATE:', images);
    
    // Validation - Brand is OPTIONAL, so removed from required validation
    if (!formData.name) {
      toast.error('Please enter product name');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    // Price validation - required
    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    // Validate discount price logic (if provided)
    if (formData.discountPrice && formData.discountPrice.trim() !== '') {
      const price = Number(formData.price);
      const discountPrice = Number(formData.discountPrice);
      
      if (discountPrice <= 0) {
        toast.error('Discount price must be greater than 0 Rs');
        return;
      }
      
      if (discountPrice >= price) {
        toast.error('Discount price must be less than the original price');
        return;
      }
    }

    setSaving(true);
    try {
      // Prepare product data - brand is optional, can be empty string
      const productData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        description: formData.description?.trim() || '',
        brand: formData.brand?.trim() || '', // Optional field
        category: formData.category,
        countInStock: formData.stock ? Number(formData.stock) : 0,
        stock: formData.stock ? Number(formData.stock) : 0,
        discountPrice: formData.discountPrice && formData.discountPrice.trim() !== '' 
          ? Number(formData.discountPrice) 
          : 0, // Send 0 if empty
        isFeatured: formData.isFeatured || false,
        isNew: mode === 'create',
        images: images,
      };

      console.log('📤 Sending product data:', productData);
      console.log('📤 Brand value:', productData.brand);

      let response;
      if (mode === 'create') {
        response = await adminProductApi.createProduct(productData);
        console.log('✅ Product created response:', response);
        toast.success('Product created successfully');
      } else {
        response = await adminProductApi.updateProduct(id, productData);
        console.log('✅ Product updated response:', response);
        toast.success('Product updated successfully');
      }
      
      // Navigate back to products list
      setTimeout(() => {
        navigate('/admin/products');
      }, 500);
      
    } catch (error) {
      console.error(`❌ Error ${mode === 'create' ? 'creating' : 'updating'} product:`, error);
      console.error('Error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          `Failed to ${mode === 'create' ? 'create' : 'update'} product`;
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  // Calculate discount percentage for display
  const calculateDiscountPercentage = () => {
    if (!formData.price || !formData.discountPrice || formData.discountPrice.trim() === '') {
      return 0;
    }
    const price = Number(formData.price);
    const discountPrice = Number(formData.discountPrice);
    if (price <= 0 || discountPrice <= 0 || discountPrice >= price) {
      return 0;
    }
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const discountPercentage = calculateDiscountPercentage();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/admin/products')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                type="button"
              >
                <FaArrowLeft className="mr-2" />
                Back to Products
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {mode === 'create' ? 'Add New Product' : 'Edit Product'}
              </h1>
              <p className="text-gray-600 mt-2">
                {mode === 'create' 
                  ? 'Add a new product to your store' 
                  : 'Update product information'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  {loadingCategories ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="flex items-center">
                        <FaSpinner className="animate-spin text-primary-500 mr-2" />
                        <span className="text-gray-500">Loading categories...</span>
                      </div>
                    </div>
                  ) : (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <option 
                            key={cat._id || cat.name} 
                            value={typeof cat === 'string' ? cat : cat.name}
                          >
                            {typeof cat === 'string' ? cat : cat.name}
                          </option>
                        ))
                      ) : (
                        // Fallback if no categories loaded
                        <>
                          <option value="Skincare">Skincare</option>
                          <option value="Makeup">Makeup</option>
                          <option value="Haircare">Haircare</option>
                          <option value="Fragrance">Fragrance</option>
                          <option value="Bath & Body">Bath & Body</option>
                          <option value="Tools & Brushes">Tools & Brushes</option>
                        </>
                      )}
                    </select>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Manage categories in the Categories section
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter product description"
                />
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Rs) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">Rs</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0.01"
                      step="0.01"
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Original price in Pakistani Rupees</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Price (Rs)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">Rs</span>
                    </div>
                    <input
                      type="number"
                      name="discountPrice"
                      value={formData.discountPrice}
                      onChange={handleInputChange}
                      min="0.01"
                      step="0.01"
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    {discountPercentage > 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                          {discountPercentage}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Optional - Must be less than original price
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    list="brands-list"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter brand name (optional)"
                  />
                  <datalist id="brands-list">
                    {brands.map((brand, idx) => (
                      <option key={idx} value={brand} />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">Optional field</p>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <>
                            <FaSpinner className="w-8 h-8 mb-4 text-primary-500 animate-spin" />
                            <p className="text-sm text-gray-500">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <FaUpload className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                {/* Image Preview */}
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={typeof image === 'string' ? image : (image.url || image.secure_url || image)}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=Image';
                        e.target.onerror = null; // Prevent infinite loop
                      }}
                      loading="lazy"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                disabled={saving || uploading || loadingCategories}
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    {mode === 'create' ? 'Create Product' : 'Update Product'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;