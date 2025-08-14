import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPostsAPI, deletePostAPI, getAllCategoriesAPI, checkPostsWithoutCategoriesAPI } from '../../APIServices/admin/adminAPI';
import { 
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  TagIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const PostManagement = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: '',
    author: ''
  });

  const queryClient = useQueryClient();

  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['admin-posts', filters],
    queryFn: () => getAllPostsAPI(filters),
  });

  // Fetch categories for the filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: getAllCategoriesAPI,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId) => deletePostAPI(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-posts']);
    },
  });

  const checkCategoriesMutation = useMutation({
    mutationFn: checkPostsWithoutCategoriesAPI,
    onSuccess: (data) => {
      alert(data.message);
      queryClient.invalidateQueries(['admin-posts']);
    },
    onError: (error) => {
      alert('Error checking posts without categories: ' + error.message);
    },
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  // Enhanced search with debouncing
  const handleSearchChange = (value) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone and will also delete all associated comments.')) {
      deletePostMutation.mutate(postId);
    }
  };

  const getCategoryColor = (categoryName) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-yellow-100 text-yellow-800'
    ];
    const index = categoryName?.length || 0;
    return colors[index % colors.length];
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
          <p>Error loading posts: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Management</h2>
            <p className="text-gray-600">Manage and moderate platform content</p>
          </div>
          <button
            onClick={() => checkCategoriesMutation.mutate()}
            disabled={checkCategoriesMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <TagIcon className="h-4 w-4 mr-2" />
            {checkCategoriesMutation.isPending ? 'Checking...' : 'Check Categories'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts by title, content, or author..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <UserIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Author username..."
              value={filters.author}
              onChange={(e) => handleFilterChange('author', e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <TagIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categoriesData?.categories?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.categoryName || 'Unnamed Category'}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(postsData?.posts) && postsData.posts.length > 0 ? (
                postsData.posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate mb-1">
                          {typeof post.title === 'string' ? post.title : 'Untitled Post'}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-3">
                          {(() => {
                            const content = post.description || post.content;
                            if (typeof content === 'string') {
                              return content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
                            }
                            return 'No content available';
                          })()}
                        </div>
                        {post.images && Array.isArray(post.images) && post.images.length > 0 && (
                          <div className="flex items-center mt-2">
                            <span className="text-xs text-gray-400 mr-2">📷</span>
                            <span className="text-xs text-gray-500">{post.images.length} image{post.images.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                          {post.author?.profilePicture ? (
                            <img 
                              src={typeof post.author.profilePicture === 'string' ? post.author.profilePicture : (post.author.profilePicture?.url || post.author.profilePicture)} 
                              alt={post.author.username || 'User'}
                              className="h-8 w-8 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span className="text-xs font-medium text-gray-700" style={{ display: post.author?.profilePicture ? 'none' : 'flex' }}>
                            {post.author?.username ? post.author.username.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {post.author?.username || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {post.author?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.category ? (
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(post.category.categoryName || (typeof post.category === 'string' ? post.category : 'Unnamed Category'))}`}>
                            <TagIcon className="h-3 w-3 mr-1" />
                            {typeof post.category === 'string' ? post.category : (post.category.categoryName || 'Unnamed Category')}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <TagIcon className="h-3 w-3 mr-1" />
                          No Category
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 space-y-1">
                        <div className="flex items-center">
                          <span className="text-blue-600 mr-1">💬</span>
                          <span>{Array.isArray(post.comments) ? post.comments.length : 0} comments</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-red-600 mr-1">❤️</span>
                          <span>{Array.isArray(post.likes) ? post.likes.length : 0} likes</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-600 mr-1">👁️</span>
                          <span>{typeof post.views === 'number' ? post.views : 0} views</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown Date'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {post.createdAt ? new Date(post.createdAt).toLocaleTimeString() : 'Unknown Time'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/posts/${post._id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Post"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          disabled={deletePostMutation.isPending}
                          title="Delete Post"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-2">📝</div>
                      <p className="text-lg font-medium mb-2">No posts found</p>
                      <p className="text-sm">Try adjusting your search criteria or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {postsData?.pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(postsData.pagination.currentPage - 1)}
                disabled={!postsData.pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(postsData.pagination.currentPage + 1)}
                disabled={!postsData.pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {((postsData.pagination.currentPage - 1) * filters.limit) + 1}
                  </span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(postsData.pagination.currentPage * filters.limit, postsData.pagination.totalPosts)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{postsData.pagination.totalPosts}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(postsData.pagination.currentPage - 1)}
                    disabled={!postsData.pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(postsData.pagination.currentPage + 1)}
                    disabled={!postsData.pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostManagement;




