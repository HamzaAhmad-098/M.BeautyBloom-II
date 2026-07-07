import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSpinner, FaSearch, FaSync, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { adminProductApi } from '@/services/adminApi.js';
import { toast } from 'react-toastify';
import axios from 'axios';

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(12); // Match backend pageSize
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      // If there's a search term, wait for user to stop typing
      const delayDebounceFn = setTimeout(() => {
        handleSearch(searchTerm);
      }, 500); // 500ms delay

      return () => clearTimeout(delayDebounceFn);
    } else {
      fetchProducts();
    }
  }, [currentPage, searchTerm]);

  // Fetch products with pagination
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 
        (window.location.origin.includes('mbeautybloom.shop')
          ? '/api' 
          : 'http://localhost:5000/api');
      
      const response = await axios.get(`${API_URL}/products`, {
        params: {
          pageNumber: currentPage,
          pageSize: pageSize,
          sort: 'newest' // Default sort for admin
        }
      });
      
      console.log('📦 Products response:', {
        page: currentPage,
        productsCount: response.data.products?.length || 0,
        totalPages: response.data.pages,
        total: response.data.total || response.data.count
      });
      
      const productsData = response.data.products || [];
      setProducts(productsData);
      setTotalProducts(response.data.total || response.data.count || 0);
      setTotalPages(response.data.pages || 1);
      setError(null);
      
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err.message || 'Failed to load products');
      toast.error('Failed to load products');
      
      // Fallback to the original API
      try {
        const data = await adminProductApi.getAllProducts();
        console.log('📦 Fallback: Fetched products from admin API:', data.length || 0);
        setProducts(data.products || data || []);
        setTotalProducts((data.products || data || []).length);
      } catch (fallbackErr) {
        console.error('❌ Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  // Handle search with server-side filtering
  const handleSearch = async (term) => {
    if (!term.trim()) {
      // If search term is empty, fetch all products
      setSearchTerm('');
      setCurrentPage(1);
      fetchProducts();
      return;
    }

    setIsSearching(true);
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 
        (window.location.origin.includes('mbeautybloom.shop')
          ? '/api' 
          : 'http://localhost:5000/api');
      
      // Use the keyword parameter for global search
      const response = await axios.get(`${API_URL}/products`, {
        params: {
          keyword: term,
          pageNumber: currentPage,
          pageSize: pageSize,
          sort: 'newest'
        }
      });
      
      console.log('🔍 Search results:', {
        term: term,
        productsCount: response.data.products?.length || 0,
        totalPages: response.data.pages,
        total: response.data.total || response.data.count
      });
      
      const productsData = response.data.products || [];
      setProducts(productsData);
      setTotalProducts(response.data.total || response.data.count || 0);
      setTotalPages(response.data.pages || 1);
      setError(null);
      
    } catch (err) {
      console.error('❌ Error searching products:', err);
      toast.error('Failed to search products');
      
      // Fallback to client-side search
      try {
        const data = await adminProductApi.getAllProducts();
        const allProducts = data.products || data || [];
        const filtered = allProducts.filter(product =>
          product.name?.toLowerCase().includes(term.toLowerCase()) ||
          product.brand?.toLowerCase().includes(term.toLowerCase()) ||
          product.category?.toLowerCase().includes(term.toLowerCase()) ||
          product.description?.toLowerCase().includes(term.toLowerCase()) ||
          (product.tags && Array.isArray(product.tags) && 
            product.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase())))
        );
        
        setProducts(filtered);
        setTotalProducts(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize));
      } catch (fallbackErr) {
        console.error('❌ Fallback search failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await adminProductApi.deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      setTotalProducts(prev => prev - 1);
      toast.success('Product deleted successfully');
      
      // If current page becomes empty after deletion, go to previous page
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const getImageUrl = (product) => {
    if (!product.images || product.images.length === 0) {
      return 'https://via.placeholder.com/300x300?text=No+Image';
    }

    const firstImage = product.images[0];

    // Use Cloudinary URL
    if (firstImage.url) {
      return firstImage.url;
    }

    // If we have a public_id but no URL, construct Cloudinary URL
    if (firstImage.public_id) {
      const cloudName = 'dr1rajqzy'; // Your Cloudinary cloud name
      // Remove any leading slash if exists
      const publicId = firstImage.public_id.startsWith('/') 
        ? firstImage.public_id.substring(1) 
        : firstImage.public_id;
      
      // Construct Cloudinary URL with your specific dimensions
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_400,c_fill,q_auto,f_auto/${publicId}`;
    }

    // Fallback for any other format
    return typeof firstImage === 'string' 
      ? firstImage 
      : 'https://via.placeholder.com/300x300?text=No+Image';
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Refresh all products
  const handleRefresh = () => {
    setCurrentPage(1);
    setSearchTerm('');
    fetchProducts();
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchProducts();
  };

  // Calculate displayed range
  const getDisplayRange = () => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalProducts);
    return { start, end };
  };

  const { start, end } = getDisplayRange();

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
          {isSearching && (
            <p className="text-sm text-gray-500 mt-2">Searching...</p>
          )}
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
            <p className="text-gray-600 mt-1">
              {totalProducts} total products • Showing {start}-{end} of {totalProducts}
              {searchTerm && ` • Searching for "${searchTerm}"`}
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              title="Refresh all products"
            >
              <FaSync className="mr-2" />
              Refresh
            </button>
            <button
              onClick={() => navigate('/admin/products/new')}
              className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="mb-6">
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, brand, category, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Current Page</p>
              <p className="text-2xl font-bold text-primary-600">{currentPage}/{totalPages}</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">
              {searchTerm ? `No products found for "${searchTerm}"` : 'No products found'}
            </p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Products Count */}
            <div className="mb-4">
              <p className="text-gray-600">
                Showing {products.length} products on page {currentPage} of {totalPages}
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                        e.target.onerror = null;
                      }}
                      loading="lazy"
                    />

                    {product.isFeatured && (
                      <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                    
                    {product.isNew && (
                      <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        New
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                    <p className="text-xs text-gray-400 mt-1">{product.category}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary-600">
                          Rs. {product.price?.toLocaleString()}
                        </span>
                        {product.discountPrice && product.discountPrice < product.price && (
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            Rs. {product.discountPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        product.countInStock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : product.countInStock > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {product.countInStock > 0 ? `Stock: ${product.countInStock}` : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Rating */}
                    {product.rating > 0 && (
                      <div className="mt-2 flex items-center">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="ml-1 text-sm text-gray-600">{product.rating?.toFixed(1)}</span>
                        <span className="ml-1 text-xs text-gray-400">({product.numReviews || 0} reviews)</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-600 mb-4 md:mb-0">
                  Page {currentPage} of {totalPages} • {totalProducts} total products
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <FaChevronLeft className="mr-2" />
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {/* Generate page buttons */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className={`w-10 h-10 rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-primary-500 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                    <FaChevronRight className="ml-2" />
                  </button>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <span className="text-sm text-gray-600">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="ml-2 border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="12">12</option>
                    <option value="24">24</option>
                    <option value="48">48</option>
                    <option value="96">96</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;