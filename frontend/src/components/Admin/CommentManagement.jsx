import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllCommentsAPI, deleteCommentAPI } from '../../APIServices/admin/adminAPI';
import { 
  MagnifyingGlassIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const CommentManagement = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    post: '',
    author: ''
  });

  const queryClient = useQueryClient();

  const { data: commentsData, isLoading, error } = useQuery({
    queryKey: ['admin-comments', filters],
    queryFn: () => getAllCommentsAPI(filters),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => deleteCommentAPI(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comments']);
    },
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      deleteCommentMutation.mutate(commentId);
    }
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
          <p>Error loading comments: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Comment Management</h2>
        <p className="text-gray-600">Moderate and manage user comments</p>
        <div className="mt-2 flex space-x-2">
          <a href="/posts" target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">View Posts</a>
          <span className="text-gray-400">•</span>
          <a href="/comments" target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">View Comments</a>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search comments..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <input
            type="text"
            placeholder="Author username..."
            value={filters.author}
            onChange={(e) => handleFilterChange('author', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="text"
            placeholder="Post title..."
            value={filters.post}
            onChange={(e) => handleFilterChange('post', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

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

      {/* Comments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post
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
              {commentsData?.comments?.map((comment) => (
                <tr key={comment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm text-gray-900">
                        {comment.content}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                        {comment.author?.profilePicture ? (
                          <img 
                            src={typeof comment.author.profilePicture === 'string' ? comment.author.profilePicture : (comment.author.profilePicture?.url || comment.author.profilePicture)} 
                            alt={comment.author.username || 'User'}
                            className="h-8 w-8 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span className="text-xs font-medium text-gray-700" style={{ display: comment.author?.profilePicture ? 'none' : 'flex' }}>
                          {comment.author?.username ? comment.author.username.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div className="ml-3 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {comment.author?.username || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {comment.author?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {comment.post?.title || 'Post not found'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Comment"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {commentsData?.pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(commentsData.pagination.currentPage - 1)}
                disabled={!commentsData.pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(commentsData.pagination.currentPage + 1)}
                disabled={!commentsData.pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {((commentsData.pagination.currentPage - 1) * filters.limit) + 1}
                  </span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(commentsData.pagination.currentPage * filters.limit, commentsData.pagination.totalComments)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{commentsData.pagination.totalComments}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(commentsData.pagination.currentPage - 1)}
                    disabled={!commentsData.pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(commentsData.pagination.currentPage + 1)}
                    disabled={!commentsData.pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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

export default CommentManagement;




