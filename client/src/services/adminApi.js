import axios from 'axios';

// For production on Railway
const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.origin === 'https://ingenious-laughter-production.up.railway.app' 
    ? '/api' 
    : 'http://localhost:5000/api');

console.log('🚀 Frontend API URL:', API_URL);
console.log('🌐 Current origin:', window.location.origin);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Create a separate instance for file uploads with multipart/form-data
const uploadApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor for regular API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Request interceptor for upload API
uploadApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - let browser set it with boundary
    console.log(`📤 UPLOAD ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Upload request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Response interceptor for upload API
uploadApi.interceptors.response.use(
  (response) => {
    console.log(`✅ UPLOAD ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Upload response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ============ PRODUCT MANAGEMENT ============
export const adminProductApi = {
  // Get all products with filters
  getAllProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get product by ID
  getProductById: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  // Create product
  createProduct: async (productData) => {
    console.log('🌐 API Call: Creating product');
    console.log('📦 Product data being sent:', JSON.stringify(productData, null, 2));
    console.log('🖼️ Images in request:', productData.images);
    
    // Ensure images are in the correct format for Cloudinary
    const formattedData = {
      ...productData,
      images: Array.isArray(productData.images) ? productData.images.map(img => {
        // If image is a string URL, convert to object format
        if (typeof img === 'string') {
          return {
            url: img,
            public_id: img.split('/').pop().split('.')[0], // Extract filename without extension
            alt: productData.name || 'Product image'
          };
        }
        // If it's already an object with Cloudinary fields
        if (img.url && img.public_id) {
          return img;
        }
        // If it's an object with only url
        if (img.url) {
          return {
            url: img.url,
            public_id: img.url.split('/').pop().split('.')[0],
            alt: img.alt || productData.name || 'Product image'
          };
        }
        return img;
      }) : []
    };
    
    console.log('🔄 Formatted product data:', formattedData);
    
    try {
      const response = await api.post('/products', formattedData);
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update product
updateProduct: async (productId, productData) => {
  const response = await api.put(`/products/${productId}`, productData);
  return response.data;
},

  // Delete product
  deleteProduct: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  // Upload product images to Cloudinary - CORRECTED ENDPOINT
  uploadImages: async (formData) => {
    console.log('📤 Uploading images to Cloudinary...');
    console.log('📁 FormData entries:', formData.getAll('images'));
    
    try {
      // Use the upload API instance with proper FormData handling
      const response = await uploadApi.post('/upload/cloudinary', formData);
      console.log('✅ Cloudinary upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Cloudinary upload error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  createProductReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  // Update product review
  updateProductReview: async (productId, reviewId, reviewData) => {
    const response = await api.put(`/products/${productId}/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete product review
  deleteProductReview: async (productId, reviewId) => {
    const response = await api.delete(`/products/${productId}/reviews/${reviewId}`);
    return response.data;
  },

  // Get brands
  getBrands: async () => {
    const response = await api.get('/products/brands');
    return response.data;
  },

  // Get categories from products aggregation
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },
};

// ============ CATEGORY MANAGEMENT ============
// In adminApi.js - Update the category management section
export const adminCategoryApi = {
  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    try {
      const response = await api.get(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Create category
  createCategory: async (categoryData) => {
    try {
      console.log('📤 Creating category with data:', categoryData);
      
      // Prepare category data with required fields
      const dataToSend = {
        name: categoryData.name,
        description: categoryData.description || '',
        image: categoryData.image || '',
        parentCategory: categoryData.parentCategory || null,
        order: categoryData.order || 0,
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true
      };
      
      console.log('📤 Sending category data:', dataToSend);
      
      const response = await api.post('/categories', dataToSend);
      console.log('✅ Category created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating category:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update category
  updateCategory: async (categoryId, categoryData) => {
    try {
      console.log('📝 Updating category:', categoryId, categoryData);
      const response = await api.put(`/categories/${categoryId}`, categoryData);
      console.log('✅ Category updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    try {
      console.log('🗑️ Deleting category:', categoryId);
      const response = await api.delete(`/categories/${categoryId}`);
      console.log('✅ Category deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Get category tree
  getCategoryTree: async () => {
    try {
      const response = await api.get('/categories/tree');
      return response.data;
    } catch (error) {
      console.error('Error fetching category tree:', error);
      throw error;
    }
  },
};

// ============ USER MANAGEMENT ============
export const adminUserApi = {
  // Get all users with pagination
  getAllUsers: async (page = 1, limit = 10) => {
    const response = await api.get(`/auth/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/auth/admin/users/${userId}`);
    return response.data;
  },

  // Create user
  createUser: async (userData) => {
    const response = await api.post('/auth/admin/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await api.put(`/auth/admin/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/auth/admin/users/${userId}`);
    return response.data;
  },

  // Get admin stats
  getAdminStats: async () => {
    const response = await api.get('/auth/admin/stats');
    return response.data;
  },
};

// ============ ORDER MANAGEMENT ============
export const adminOrderApi = {
  // Get all orders with filters
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/orders?${queryString}`);
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId, statusData) => {
    const response = await api.put(`/orders/${orderId}/status`, statusData);
    return response.data;
  },

  // Mark order as delivered
  markAsDelivered: async (orderId) => {
    const response = await api.put(`/orders/${orderId}/deliver`);
    return response.data;
  },

  // Get order stats
  getOrderStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data;
  },
};

// ============ DASHBOARD STATS ============
export const adminDashboardApi = {
  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const [userStats, orderStats] = await Promise.all([
        api.get('/auth/admin/stats'),
        api.get('/orders/stats'),
      ]);
      
      return {
        users: userStats.data,
        orders: orderStats.data,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
};

// ============ CLOUDINARY HELPER FUNCTIONS ============
export const cloudinaryHelpers = {
  // Get Cloudinary image URL with transformations
  getImageUrl: (imageObj, width = 800, height = 600) => {
    if (!imageObj) {
      return 'https://via.placeholder.com/300x300?text=No+Image';
    }
    
    // If imageObj is a string, return it directly
    if (typeof imageObj === 'string') {
      return imageObj;
    }
    
    // If imageObj has a URL, return it
    if (imageObj.url) {
      return imageObj.url;
    }
    
    // If imageObj has a public_id, construct Cloudinary URL
    if (imageObj.public_id) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dr1rajqzy';
      const transformations = `c_fill,w_${width},h_${height},q_auto,f_auto`;
      return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${imageObj.public_id}`;
    }
    
    return 'https://via.placeholder.com/300x300?text=No+Image';
  },

  // Get thumbnail URL
  getThumbnailUrl: (imageObj, width = 300, height = 300) => {
    return cloudinaryHelpers.getImageUrl(imageObj, width, height);
  },

  // Extract public_id from Cloudinary URL
  extractPublicId: (cloudinaryUrl) => {
    if (!cloudinaryUrl) return null;
    
    try {
      const url = new URL(cloudinaryUrl);
      const pathParts = url.pathname.split('/');
      
      // Find the upload folder and get everything after it
      const uploadIndex = pathParts.indexOf('upload');
      if (uploadIndex !== -1) {
        // Join all parts after 'upload' and remove file extension
        const publicIdWithExt = pathParts.slice(uploadIndex + 2).join('/');
        return publicIdWithExt.replace(/\.[^/.]+$/, ''); // Remove file extension
      }
    } catch (error) {
      console.warn('Error extracting public_id from URL:', cloudinaryUrl);
    }
    
    return null;
  },
};

export default api;