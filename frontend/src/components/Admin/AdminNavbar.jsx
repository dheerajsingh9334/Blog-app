import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  BellIcon, 
  UserIcon, 
  CogIcon, 
  ChartBarIcon,
  UsersIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { FaBlog, FaSun, FaMoon } from 'react-icons/fa';

const AdminNavbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { adminAuth: admin } = useSelector((state) => state.adminAuth);
  const navigate = useNavigate();

  // Mock notifications - in real app, fetch from API
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'new_user',
        title: 'New User Registration',
        message: 'User "john_doe" has registered',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        read: false,
        priority: 'normal'
      },
      {
        id: 2,
        type: 'new_admin',
        title: 'New Admin Registration',
        message: 'Admin "admin_sarah" has been added',
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        read: false,
        priority: 'high'
      },
      {
        id: 3,
        type: 'admin_message',
        title: 'System Update',
        message: 'Platform maintenance completed successfully',
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        read: true,
        priority: 'normal'
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_user':
        return <UserPlusIcon className="h-5 w-5 text-green-500" />;
      case 'new_admin':
        return <ShieldCheckIcon className="h-5 w-5 text-purple-500" />;
      case 'admin_message':
        return <BellIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'normal':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'low':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center">
            <Link to="/admin/dashboard" className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8 ml-10">
              <Link to="/admin/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/admin/users" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">
                Users
              </Link>
              <Link to="/admin/posts" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">
                Posts
              </Link>
              <Link to="/admin/notifications" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">
                Notifications
              </Link>
            </div>
          </div>

          {/* Right side - Actions and Profile */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {darkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative"
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <BellIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/admin/notifications"
                      className="block w-full text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {admin?.username?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {admin?.username || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
