import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/product/ProductCard';
import ProductFilter from '../components/product/ProductFilter';
import { FaFilter, FaTimes, FaSearch, FaSpinner, FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [filters, setFilters] = useState({
    category: '',
    brand: [],
    minPrice: '',
    maxPrice: '',
    rating: '',
    sort: 'newest',
    search: '',
  });

  // Listen for mobile filter close event
  useEffect(() => {
    const handleCloseFilters = () => {
      setShowFilters(false);
    };
    window.addEventListener('closeFilters', handleCloseFilters);
    return () => window.removeEventListener('closeFilters', handleCloseFilters);
  }, []);

  useEffect(() => {
    // Extract filters from URL
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const brand = searchParams.get('brand') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const rating = searchParams.get('rating') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = searchParams.get('page') || '1';

    setFilters({
      category,
      brand: brand ? brand.split(',') : [],
      minPrice,
      maxPrice,
      rating,
      sort,
      search,
    });
    setCurrentPage(parseInt(page));
  }, [location.search, searchParams]);

  // Fetch featured products when shop loads with no filters
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      // Only fetch featured products when no filters are active
      const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (key === 'sort') return false;
        if (Array.isArray(value)) return value.length > 0;
        return value !== '';
      });

      if (!hasActiveFilters) {
        setFeaturedLoading(true);
        try {
          const API_URL = import.meta.env.VITE_API_URL || 
            (window.location.origin.includes('mbeautybloom.shop')
              ? '/api' 
              : 'http://localhost:5000/api');
          
          const response = await axios.get(`${API_URL}/products/featured`);
          setFeaturedProducts(response.data || []);
        } catch (error) {
          console.error('Error fetching featured products:', error);
          setFeaturedProducts([]);
        } finally {
          setFeaturedLoading(false);
        }
      } else {
        setFeaturedProducts([]); // Clear featured products when filters are active
      }
    };

    fetchFeaturedProducts();
  }, [filters]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log('Fetching products with filters:', filters);
        
        const params = new URLSearchParams();
        
        // Add all filters to params
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('keyword', filters.search);
        if (filters.brand.length > 0) params.append('brand', filters.brand.join(','));
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.rating) params.append('rating', filters.rating);
        if (filters.sort) params.append('sort', filters.sort);
        params.append('pageNumber', currentPage);
        
        console.log('Request params:', params.toString());
        
        const API_URL = import.meta.env.VITE_API_URL || 
          (window.location.origin.includes('mbeautybloom.shop')
            ? '/api' 
            : 'http://localhost:5000/api');
        
        const response = await axios.get(`${API_URL}/products?${params}`);
        
        console.log('Products response:', {
          data: response.data,
          productsCount: response.data.products?.length || 0,
          totalPages: response.data.pages
        });
        
        // Handle response
        const productsData = response.data.products || [];
        setProducts(productsData);
        setTotalPages(response.data.pages || 1);
        
      } catch (error) {
        console.error('Error fetching products:', error);
        console.error('Error details:', error.response?.data || error.message);
        toast.error('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, currentPage]);

  // ADD THIS MISSING FUNCTION
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) params.set(key, value.join(','));
        } else {
          params.set(key, value);
        }
      }
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: [],
      minPrice: '',
      maxPrice: '',
      rating: '',
      sort: 'newest',
      search: '',
    });
    setSearchParams({});
    setCurrentPage(1);
  };

  // Check if no filters are active
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'sort') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== '';
  });

  // Count active filters for display
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sort') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== '';
  }).length;

  const fetchBrands = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 
        (window.location.origin.includes('mbeautybloom.shop')
          ? '/api' 
          : 'http://localhost:5000/api');
      
      const response = await axios.get(`${API_URL}/products/brands`);
      return response.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      return [];
    }
  };

  // Helper function to extract public_id from Cloudinary URL
  const extractPublicIdFromCloudinaryUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Find the upload folder and get everything after it
      const uploadIndex = pathParts.indexOf('upload');
      if (uploadIndex !== -1) {
        // Join all parts after 'upload' and remove file extension
        const publicIdWithExt = pathParts.slice(uploadIndex + 2).join('/');
        return publicIdWithExt.replace(/\.[^/.]+$/, '');
      }
    } catch (error) {
      console.warn('Error extracting public_id from URL:', url);
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {filters.category ? `${filters.category} Products` : 'All Products'}
          </h1>
          <p className="text-gray-600 mt-2">
            {loading ? 'Loading products...' : `${products.length} products found`}
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 bg-white px-4 py-3 rounded-lg shadow w-full hover:shadow-md transition-shadow mobile-tap-target"
            >
              {showFilters ? <FaTimes /> : <FaFilter />}
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              {activeFiltersCount > 0 && (
                <span className="ml-auto text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full font-semibold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
  
          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mb-6 animate-slide-in">
              <div className="bg-white rounded-lg shadow p-4">
                <ProductFilter
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                  isMobile={true}
                />
              </div>
            </div>
          )}
          
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <ProductFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <FaSearch className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
                  />
                </div>
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <span className="text-gray-600 hidden sm:block">Sort by:</span>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange({ sort: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Featured Products Section - Only show when no filters */}
            {!hasActiveFilters && featuredProducts.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaStar className="text-yellow-500" />
                    Featured Products
                    <FaStar className="text-yellow-500" />
                  </h2>
                  <span className="text-sm text-gray-500 bg-primary-50 px-3 py-1 rounded-full">
                    {featuredProducts.length} premium items
                  </span>
                </div>
                
                {featuredLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-10">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                      {featuredProducts.map((product) => (
                        <div key={product._id} className="transform transition-transform duration-300 hover:scale-[1.02]">
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                    <div className="text-center mb-8">
                      <div className="inline-block h-1 w-24 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mb-6 pt-4 border-t flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {filters.category}
                    <button
                      onClick={() => handleFilterChange({ category: '' })}
                      className="ml-2 hover:text-primary-900"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
                {filters.brand.map(brand => (
                  <span key={brand} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {brand}
                    <button
                      onClick={() => handleFilterChange({ brand: filters.brand.filter(b => b !== brand) })}
                      className="ml-2 hover:text-purple-900"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                ))}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {filters.minPrice && `Rs. ${filters.minPrice}`}
                    {filters.minPrice && filters.maxPrice && ' - '}
                    {filters.maxPrice && `Rs. ${filters.maxPrice}`}
                    <button
                      onClick={() => handleFilterChange({ minPrice: '', maxPrice: '' })}
                      className="ml-2 hover:text-green-900"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
                {filters.rating && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {filters.rating}★ & above
                    <button
                      onClick={() => handleFilterChange({ rating: '' })}
                      className="ml-2 hover:text-yellow-900"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-600 hover:text-gray-900 underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg h-64 sm:h-72 animate-pulse"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or search term. We might not have what you're looking for yet.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-colors mobile-tap-target"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-grid is-visible">
                  {products.map((product, idx) => (
                    <div
                      key={product._id || product.id}
                      className="shop-card-in"
                      style={{ animationDelay: `${Math.min(idx, 11) * 45}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 mobile-tap-target"
                      >
                        Previous
                      </button>
                      
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
                            className={`px-4 py-2 rounded-lg mobile-tap-target ${
                              currentPage === pageNum
                                ? 'bg-primary-500 text-white shadow-md'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 mobile-tap-target"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;