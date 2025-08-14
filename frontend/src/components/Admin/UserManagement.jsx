import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllUsersAPI, 
  updateUserRoleAPI, 
  banUserAPI, 
  unbanUserAPI, 
  deleteUserAPI,
  assignPlanToUserAPI,
  getAdminUsersAPI
} from '../../APIServices/admin/adminAPI';
import { getAllPlansAPI } from '../../APIServices/admin/adminAPI';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const UserManagement = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    isBanned: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');


  const queryClient = useQueryClient();

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => getAllUsersAPI(filters),
  });

  const { data: plansData } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: getAllPlansAPI,
  });

  const { data: adminUsersData } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: getAdminUsersAPI,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => updateUserRoleAPI(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
    },
  });

  const banUserMutation = useMutation({
    mutationFn: ({ userId, reason }) => banUserAPI(userId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['admin-users']);
      setShowBanModal(false);
      setBanReason('');
      alert(`User banned successfully!\n\nBan Reason: ${data.user?.banReason || 'Violation of community guidelines'}\n\nAll admin users have been notified, and the user will see your contact information.`);
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: (userId) => unbanUserAPI(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => deleteUserAPI(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
    },
  });

  const assignPlanMutation = useMutation({
    mutationFn: ({ userId, planId }) => assignPlanToUserAPI(userId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setShowPlanModal(false);
      setSelectedPlanId('');
      setSelectedUser(null);
    },
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleBanUser = () => {
    if (selectedUser && banReason.trim()) {
      banUserMutation.mutate({ userId: selectedUser._id, reason: banReason });
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleAssignPlan = () => {
    if (selectedUser && selectedPlanId) {
      assignPlanMutation.mutate({ 
        userId: selectedUser._id, 
        planId: selectedPlanId 
      });
    }
  };

  const getPlanDisplayName = (user) => {
    if (!user.plan) return 'No Plan';
    
    // Check if plan is populated
    if (typeof user.plan === 'object' && user.plan.planName) {
      return `${user.plan.planName} (${user.plan.tier})`;
    }
    
    // Fallback if plan is just an ID
    return 'Plan Assigned';
  };

  const getPlanBadgeColor = (user) => {
    if (!user.plan) return 'bg-gray-100 text-gray-800';
    
    const tier = user.plan.tier || 'free';
    switch (tier) {
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      case 'free':
      default:
        return 'bg-gray-100 text-gray-800';
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
          <p>Error loading users: {error.message}</p>
        </div>
      </div>
    );
  }

  const resolveAvatarUrl = (user) => {
    const pic = user?.profilePicture;
    if (!pic) return null;
    if (typeof pic === 'string') return pic;
    return pic.url || pic.path || pic.secure_url || null;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Management</h2>
        <p className="text-gray-600">Manage users, roles, and account status</p>
        <div className="mt-2 flex space-x-2">
          <a href="/users" target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">View Public Profiles</a>
          <span className="text-gray-400">•</span>
          <a href="/register" target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">User Registration</a>
        </div>
      </div>



      {/* Admin Email Configuration */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📧 Admin Notification Settings</h3>
        <p className="text-sm text-blue-700 mb-3">
          Admin notification emails will be sent to all admin users when users are banned.
        </p>
        
        {/* Admin Profile Link */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800 font-medium mb-1">
                🚨 Important: Set Your Contact Information
              </p>
              <p className="text-xs text-yellow-700">
                Users need to know how to contact you when you ban them or send notifications.
              </p>
            </div>
            <a 
              href="/admin/profile" 
              className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Set Contact Info
            </a>
          </div>
        </div>
        
        {/* Admin Users List */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-blue-800 mb-2">Admin Users (Notification Recipients)</label>
          {adminUsersData?.adminUsers ? (
            <div className="space-y-2">
              {adminUsersData.adminUsers.map((admin) => (
                <div key={admin._id} className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {admin.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">{admin.username}</p>
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm ${admin.extractedEmail ? 'text-orange-600' : 'text-blue-600'}`}>
                          {admin.email}
                        </p>
                        {admin.extractedEmail && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            Extracted
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        <span className="font-medium">Role:</span> {admin.role}
                        {admin.createdAt && (
                          <span className="ml-2">
                            • Member since {new Date(admin.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {admin.role}
                    </span>
                    <div className="mt-2">
                      <button 
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                        onClick={() => navigator.clipboard.writeText(admin.email)}
                        title="Copy email to clipboard"
                      >
                        Copy Email
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
              <p className="text-gray-600 text-sm">Loading admin users...</p>
            </div>
          )}
        </div>
        
        {/* Feature Status */}
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-800">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Feature Active</span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            ✅ Admin email notifications are enabled and will be sent automatically to all admin users when users are banned.
          </p>
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-700">
              💡 <strong>Admin Contact Info:</strong> When you send broadcast notifications, users will see your contact details 
              (username, email, role) so they can reach out if needed.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={filters.isBanned}
            onChange={(e) => handleFilterChange('isBanned', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Banned</option>
          </select>

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

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {usersData?.users?.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                        {(() => {
                          const avatarUrl = resolveAvatarUrl(user);
                          if (avatarUrl) {
                            return (
                              <img
                                src={avatarUrl}
                                alt={user.username}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            );
                          }
                          return (
                            <span className="text-sm font-medium text-gray-700">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => updateRoleMutation.mutate({ userId: user._id, role: e.target.value })}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanBadgeColor(user)}`}>
                        <StarIcon className="h-3 w-3 mr-1" />
                        {getPlanDisplayName(user)}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedPlanId(user.plan?._id || '');
                          setShowPlanModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 text-xs"
                      >
                        Change
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isBanned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <a
                        href={`/user/${user._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                        title="View public profile"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </a>
                      
                      {user.isBanned ? (
                        <button
                          onClick={() => unbanUserMutation.mutate(user._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBanModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Ban
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersData?.pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(usersData.pagination.currentPage - 1)}
                disabled={!usersData.pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(usersData.pagination.currentPage + 1)}
                disabled={!usersData.pagination.hasNext}
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
                    {((usersData.pagination.currentPage - 1) * filters.limit) + 1}
                  </span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(usersData.pagination.currentPage * filters.limit, usersData.pagination.totalUsers)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{usersData.pagination.totalUsers}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(usersData.pagination.currentPage - 1)}
                    disabled={!usersData.pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(usersData.pagination.currentPage + 1)}
                    disabled={!usersData.pagination.hasNext}
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

      {/* Ban User Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                🚨 Ban User: {selectedUser.username}
              </h3>
              
              {/* Warning Info */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center text-red-800">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Important Warning</span>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  This action will immediately ban the user and they will see your contact information.
                </p>
              </div>
              
              {/* Ban Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Ban Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter a clear reason for banning this user. This will be shown to the user and other admins..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="4"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  The user will see this reason and your contact information in their notification.
                </p>
              </div>
              
              {/* What Happens Next */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  What happens next:
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• User will be immediately banned</li>
                  <li>• They will receive a notification with the reason</li>
                  <li>• They will see your contact information</li>
                  <li>• All admins will be notified</li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setBanReason('');
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBanUser}
                  disabled={!banReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚫 Ban User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showPlanModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Change Plan for: {selectedUser.username}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Plan: {getPlanDisplayName(selectedUser)}
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No Plan</option>
                  {plansData?.plans?.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.planName} ({plan.tier}) - ${plan.price}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPlanModal(false);
                    setSelectedPlanId('');
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignPlan}
                  disabled={assignPlanMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {assignPlanMutation.isLoading ? 'Updating...' : 'Update Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;





