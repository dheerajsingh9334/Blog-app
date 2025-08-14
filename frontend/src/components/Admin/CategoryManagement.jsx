import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllCategoriesAPI, 
  createCategoryAPI, 
  updateCategoryAPI, 
  deleteCategoryAPI 
} from '../../APIServices/admin/adminAPI';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const CategoryManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    description: ''
  });

  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: getAllCategoriesAPI,
  });

  // Debug: Log the structure of categories data
  console.log('Categories data structure:', categoriesData);
  if (categoriesData?.categories) {
    console.log('Categories array:', categoriesData.categories);
    categoriesData.categories.forEach((cat, index) => {
      console.log(`Category ${index}:`, cat);
      console.log(`Category ${index} type:`, typeof cat);
      console.log(`Category ${index} name:`, cat?.name, 'type:', typeof cat?.name);
      console.log(`Category ${index} posts:`, cat?.posts, 'type:', typeof cat?.posts);
    });
  }

  const createCategoryMutation = useMutation({
    mutationFn: (categoryData) => createCategoryAPI(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, categoryData }) => updateCategoryAPI(categoryId, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
      setShowEditModal(false);
      setSelectedCategory(null);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId) => deleteCategoryAPI(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
    },
  });

  const handleCreateCategory = () => {
    if (!formData.categoryName.trim()) {
      alert('Category name is required');
      return;
    }
    createCategoryMutation.mutate(formData);
  };

  const handleUpdateCategory = () => {
    if (!formData.categoryName.trim()) {
      alert('Category name is required');
      return;
    }
    if (selectedCategory) {
      updateCategoryMutation.mutate({ categoryId: selectedCategory._id, categoryData: formData });
    }
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      categoryName: category.categoryName || category.name || '',
      description: category.description || ''
    });
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>Error loading categories: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Category Management</h2>
        <p className="text-gray-600 dark:text-gray-300">Create, edit, and manage post categories</p>
        <div className="mt-2 flex space-x-2">
          <a href="/categories" target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">View Public Categories</a>
          <span className="text-gray-400">•</span>
          <a href="/posts" target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">Browse Posts</a>
        </div>
      </div>

      {/* Create Category Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(categoriesData?.categories) ? categoriesData.categories.filter(category => category && typeof category === 'object').map((category) => {
          try {
            return (
              <div key={category?._id || Math.random()} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {category.categoryName || 'Unnamed Category'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Array.isArray(category.posts) ? category.posts.length : 0} posts
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category?._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {category.description && (
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {typeof category.description === 'string' ? category.description : 'Invalid description format'}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Created: {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'Unknown date'}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {Array.isArray(category.posts) ? category.posts.length : 0} posts
                  </span>
                </div>
              </div>
            );
          } catch (error) {
            console.error('Error rendering category:', error, category);
            return (
              <div key={Math.random()} className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700 p-6">
                <p className="text-red-600 dark:text-red-400">Error rendering category</p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-2">Check console for details</p>
              </div>
            );
          }
        }) : (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
            <p>No categories found or invalid data format</p>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create New Category</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</label>
                  <input
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({...formData, categoryName: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Enter category description (optional)"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategory}
                  disabled={!formData.categoryName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Category</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</label>
                  <input
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({...formData, categoryName: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Enter category description (optional)"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  disabled={!formData.categoryName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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

export default CategoryManagement;




