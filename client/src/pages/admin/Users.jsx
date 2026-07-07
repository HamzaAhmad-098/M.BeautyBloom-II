import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaUserShield, FaUserCheck, FaUserTimes, FaEdit, FaTrash, FaSpinner, FaPlus } from 'react-icons/fa';
import { adminUserApi } from '@/services/adminApi.js';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    customers: 0,
    admins: 0,
  });
  
  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users, page:', currentPage); // Debug log
      
      // Try different API response formats
      const data = await adminUserApi.getAllUsers(currentPage, 10);
      console.log('API Response:', data); // Debug log
      
      // Handle different response formats
      let usersData = [];
      let totalPagesData = 1;
      let totalCount = 0;
      
      // Format 1: data has users array directly
      if (Array.isArray(data)) {
        usersData = data;
        totalCount = data.length;
      }
      // Format 2: data has data property with users
      else if (data.data && Array.isArray(data.data)) {
        usersData = data.data;
        totalPagesData = data.totalPages || data.pages || 1;
        totalCount = data.total || data.count || data.data.length;
      }
      // Format 3: data has users property
      else if (data.users && Array.isArray(data.users)) {
        usersData = data.users;
        totalPagesData = data.totalPages || data.pages || 1;
        totalCount = data.total || data.count || data.users.length;
      }
      // Format 4: Common API format
      else if (data.results && Array.isArray(data.results)) {
        usersData = data.results;
        totalPagesData = data.totalPages || data.pages || 1;
        totalCount = data.total || data.count || data.results.length;
      }
      // Format 5: No nested structure
      else if (Array.isArray(data)) {
        usersData = data;
        totalCount = data.length;
      }
      
      console.log('Processed users:', usersData); // Debug log
      
      setUsers(usersData);
      setTotalPages(totalPagesData);
      setTotalUsers(totalCount);
      
      // Calculate stats from ALL users (not just current page if you have all data)
      const total = usersData.length;
      const activeUsers = usersData.filter(u => u.isActive).length;
      const customers = usersData.filter(u => !u.isAdmin).length;
      const admins = usersData.filter(u => u.isAdmin).length;
      
      console.log('Stats:', { total, activeUsers, customers, admins }); // Debug log
      
      setStats({
        totalUsers: total,
        activeUsers,
        customers,
        admins,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // CREATE - Add New User
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating user:', newUser); // Debug log
      await adminUserApi.createUser(newUser);
      toast.success('User created successfully');
      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        isAdmin: false,
        isActive: true,
      });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error creating user:', error);
      console.error('Error response:', error.response); // Debug log
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to create user'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // READ - Filter Users
  const filteredUsers = users.filter(user => {
    if (!user) return false;
    
    const matchesSearch = 
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'All' || 
                       (roleFilter === 'Admin' && user.isAdmin) ||
                       (roleFilter === 'Customer' && !user.isAdmin);
    
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'Active' && user.isActive) ||
                         (statusFilter === 'Inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // UPDATE - Role Change
  const handleRoleChange = async (id, newRole) => {
    try {
      const isAdmin = newRole === 'Admin';
      console.log('Updating user role:', id, isAdmin); // Debug log
      await adminUserApi.updateUser(id, { isAdmin });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to update user role'
      );
    }
  };

  // UPDATE - Status Change
  const handleStatusChange = async (id, newStatus) => {
    try {
      const isActive = newStatus === 'Active';
      console.log('Updating user status:', id, isActive); // Debug log
      await adminUserApi.updateUser(id, { isActive });
      toast.success('User status updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to update user status'
      );
    }
  };

  // DELETE - Remove User
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        console.log('Deleting user:', id); // Debug log
        await adminUserApi.deleteUser(id);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(
          error.response?.data?.message || 
          error.response?.data?.error || 
          error.message || 
          'Failed to delete user'
        );
      }
    }
  };

  // UPDATE - Edit User (Modal)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleEditClick = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!editingUser?.name || !editingUser?.email) {
      toast.error('Name and email are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminUserApi.updateUser(editingUser._id, {
        name: editingUser.name,
        email: editingUser.email,
        isAdmin: editingUser.isAdmin,
        isActive: editingUser.isActive,
      });
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to update user'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  // Add User Modal Component
  const AddUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New User</h2>
          <form onSubmit={handleAddUser}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter password (min. 6 characters)"
                  required
                  minLength="6"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newUser.isAdmin}
                      onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Admin User</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newUser.isActive}
                      onChange={(e) => setNewUser({...newUser, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Edit User Modal Component
  const EditUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit User</h2>
          <form onSubmit={handleUpdateUser}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={editingUser?.name || ''}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={editingUser?.email || ''}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingUser?.isAdmin || false}
                      onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Admin User</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingUser?.isActive || false}
                      onChange={(e) => setEditingUser({...editingUser, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {showAddModal && <AddUserModal />}
      {showEditModal && <EditUserModal />}
      
      <div className="max-w-7xl mx-auto">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-2">Total Users: {totalUsers} | Showing page {currentPage} of {totalPages}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-500 text-white px-4 py-3 rounded-lg hover:bg-primary-600 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add User</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <FaUserCheck className="text-2xl text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Users</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">{stats.activeUsers}</p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <FaUserCheck className="text-2xl text-purple-500" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Customers</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{stats.customers}</p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <FaUserCheck className="text-2xl text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Administrators</p>
                <p className="text-2xl font-bold text-red-700 mt-1">{stats.admins}</p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <FaUserShield className="text-2xl text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUserShield className="text-gray-400" />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="All">All Roles</option>
                <option value="Customer">Customer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id || user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {(user.name?.charAt(0) || 'U').toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'No Name'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email || 'No Email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.isAdmin ? 'Admin' : 'Customer'}
                          onChange={(e) => handleRoleChange(user._id || user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="Customer">Customer</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.isActive ? 'Active' : 'Inactive'}
                          onChange={(e) => handleStatusChange(user._id || user.id, e.target.value)}
                          className={`text-sm border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                            user.isActive
                              ? 'border-green-300 bg-green-50 text-green-700' 
                              : 'border-red-300 bg-red-50 text-red-700'
                          }`}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.createdAt 
                            ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })
                            : 'N/A'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleEditClick(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit user"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDelete(user._id || user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete user"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {users.length === 0 ? 'No users found in database' : 'No users match your filters'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === i + 1
                          ? 'bg-primary-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;