import React, { useState, useEffect } from "react";
import { FaUserCircle, FaEnvelope, FaCheckCircle, FaCog, FaPalette } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  KeyIcon, 
  EnvelopeIcon, 
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { updateProfileAPI, changePasswordAPI, deleteAccountAPI } from '../../APIServices/users/usersAPI';
import { logout } from '../../redux/slices/authSlices';
import { useMutation } from '@tanstack/react-query';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authUser } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmDeletePassword, setConfirmDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode state
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldBeDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Format member since date
  const formatMemberSince = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccountAPI,
    onSuccess: (data) => {
      console.log('Account deleted successfully:', data);
      dispatch(logout());
      navigate('/');
      alert('Your account has been permanently deleted. Your posts will remain on the platform.');
    },
    onError: (error) => {
      console.error('Delete account error:', error);
      setDeleteError(error.response?.data?.message || 'Failed to delete account');
    }
  });

  const handleDeleteAccount = () => {
    if (deletePassword !== confirmDeletePassword) {
      setDeleteError('Passwords do not match');
      return;
    }
    
    if (deletePassword.length < 6) {
      setDeleteError('Password must be at least 6 characters long');
      return;
    }

    setDeleteError('');
    deleteAccountMutation.mutate({ password: deletePassword });
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDeletePassword('');
    setConfirmDeletePassword('');
    setDeleteError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FaUserCircle className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profile Settings
                </h2>
              </div>
              
              <div className="space-y-4">
                <Link to="/dashboard/upload-profile-photo">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg group-hover:scale-110 transition-transform">
                        <FaUserCircle className="text-orange-600 dark:text-orange-400 text-lg" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          Update Profile Photo
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Change your profile picture
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-400 group-hover:text-orange-500 transition-colors">
                      →
                    </div>
                  </div>
                </Link>

                {/* Removed change password link */}
              </div>
            </div>

            {/* Account Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                  <FaCog className="text-indigo-600 dark:text-indigo-400 text-xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Account Preferences
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <FaPalette className="text-yellow-600 dark:text-yellow-400 text-lg" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Dark Mode
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Toggle between light and dark themes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Account Status</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatMemberSince(authUser?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Actions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account settings</p>
              </div>
              <button
                onClick={openDeleteModal}
                className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                title="Delete Account"
              >
                <TrashIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div className="mt-3">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center mt-4">
                    Delete Account
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 mb-6">
                    This action cannot be undone. Your posts will remain on the platform.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your current password"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmDeletePassword}
                        onChange={(e) => setConfirmDeletePassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Confirm your password"
                      />
                    </div>
                    
                    {deleteError && (
                      <div className="text-red-600 dark:text-red-400 text-sm text-center">
                        {deleteError}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteAccountMutation.isPending}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
