import { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaBox, FaImage, FaSpinner } from 'react-icons/fa';
import { adminCategoryApi, adminProductApi } from '@/services/adminApi.js';
import { toast } from 'react-toastify';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    isActive: true,
    image: '',
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminCategoryApi.getAllCategories();
      
      // Fetch product counts for each category
      const categoriesData = await adminProductApi.getCategories();
      
      // Merge category data with product counts
      const categoriesWithCounts = data.map(cat => {
        const productCount = categoriesData.find(c => c._id === cat.name)?.count || 0;
        return { ...cat, products: productCount };
      });
      
      setCategories(categoriesWithCounts);
      
      // Calculate stats
      setStats({
        total: categoriesWithCounts.length,
        active: categoriesWithCounts.filter(c => c.isActive).length,
        inactive: categoriesWithCounts.filter(c => !c.isActive).length,
        totalProducts: categoriesWithCounts.reduce((sum, cat) => sum + cat.products, 0),
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminCategoryApi.deleteCategory(id);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  // Update the handleAddCategory function in Categories.jsx
// In the handleAddCategory function, update with better error handling
const handleAddCategory = async () => {
  // Trim all inputs
  const trimmedName = newCategory.name?.trim() || '';
  const trimmedDescription = newCategory.description?.trim() || '';
  const trimmedImage = newCategory.image?.trim() || '';
  
  if (!trimmedName) {
    toast.error('Category name is required');
    return;
  }
  
  if (trimmedName.length < 2) {
    toast.error('Category name must be at least 2 characters');
    return;
  }
  
  try {
    console.log('🔄 Creating category...', {
      name: trimmedName,
      description: trimmedDescription,
      image: trimmedImage,
      isActive: newCategory.isActive
    });
    
    const categoryData = {
      name: trimmedName,
      description: trimmedDescription,
      image: trimmedImage,
      isActive: newCategory.isActive,
      parentCategory: null,
      order: 0
    };
    
    console.log('📤 Sending category data:', categoryData);
    
    const result = await adminCategoryApi.createCategory(categoryData);
    console.log('✅ Category created successfully:', result);
    
    toast.success('Category created successfully');
    
    // Reset form and close modal
    setNewCategory({ name: '', description: '', isActive: true, image: '' });
    setShowAddModal(false);
    
    // Refresh the list
    fetchCategories();
    
  } catch (error) {
    console.error('❌ Error creating category:', error);
    console.error('Error details:', error.response?.data);
    
    // Show detailed error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to create category';
    
    toast.error(`Error: ${errorMessage}`);
  }
};

// In the handleEditCategory function, add similar validation
const handleEditCategory = async () => {
  if (!editingCategory || !editingCategory.name?.trim()) {
    toast.error('Category name is required');
    return;
  }
  
  const trimmedName = editingCategory.name.trim();
  const trimmedDescription = editingCategory.description?.trim() || '';
  const trimmedImage = editingCategory.image?.trim() || '';
  
  if (trimmedName.length < 2) {
    toast.error('Category name must be at least 2 characters');
    return;
  }
  
  try {
    console.log('🔄 Updating category...', editingCategory);
    
    const categoryData = {
      name: trimmedName,
      description: trimmedDescription,
      image: trimmedImage,
      isActive: editingCategory.isActive,
      parentCategory: editingCategory.parentCategory || null,
      order: editingCategory.order || 0
    };
    
    const result = await adminCategoryApi.updateCategory(editingCategory._id, categoryData);
    console.log('✅ Category updated successfully:', result);
    
    toast.success('Category updated successfully');
    setEditingCategory(null);
    fetchCategories();
    
  } catch (error) {
    console.error('❌ Error updating category:', error);
    console.error('Error details:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to update category';
    
    toast.error(`Error: ${errorMessage}`);
  }
};
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
              <p className="text-gray-600 mt-2">Organize your products into categories</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
            >
              <FaPlus className="mr-2" />
              Add New Category
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div key={category._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                {/* Category Image */}
                <div className="h-48 overflow-hidden bg-gray-100">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=200&fit=crop';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaImage className="text-4xl text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Category Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{category.description || 'No description'}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <FaBox className="mr-2" />
                      <span className="text-sm">{category.products || 0} products</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setEditingCategory(category)}
                        className="text-blue-600 hover:text-blue-900 p-2"
                        title="Edit category"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:text-red-900 p-2"
                        title="Delete category"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-500">
              No categories found
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Total Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600 mt-1">Active Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{stats.totalProducts}</div>
              <div className="text-sm text-gray-600 mt-1">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.inactive}</div>
              <div className="text-sm text-gray-600 mt-1">Inactive Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Category</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Skincare"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"
                    placeholder="Describe this category..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={newCategory.image}
                    onChange={(e) => setNewCategory({...newCategory, image: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newCategory.isActive}
                    onChange={(e) => setNewCategory({...newCategory, isActive: e.target.value === 'true'})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Category</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Skincare"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingCategory.description}
                    onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"
                    placeholder="Describe this category..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={editingCategory.image || ''}
                    onChange={(e) => setEditingCategory({...editingCategory, image: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editingCategory.isActive}
                    onChange={(e) => setEditingCategory({...editingCategory, isActive: e.target.value === 'true'})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditCategory}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Update Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;