import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  sendNotificationAPI, 
  sendNotificationToAllAPI,
  getAllUsersAPI
} from '../../APIServices/admin/adminAPI';
import { 
  BellIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
  CogIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

// Icon component to render dynamic icons
const IconComponent = ({ name, className = "h-5 w-5" }) => {
  const icons = {
    ShieldCheckIcon,
    CogIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserPlusIcon,
    MegaphoneIcon,
    ChartBarIcon,
    UsersIcon,
    InformationCircleIcon
  };
  
  const Icon = icons[name];
  return Icon ? <Icon className={className} /> : <BellIcon className={className} />;
};

const NotificationManagement = () => {
  const queryClient = useQueryClient();
  const [showIndividualModal, setShowIndividualModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'admin',
    priority: 'normal'
  });
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    type: 'admin',
    priority: 'normal'
  });

  // Enhanced notification types for all admin actions
  const notificationTypes = [
    { value: 'admin', label: 'Admin Message', icon: 'ShieldCheckIcon', color: 'blue', description: 'General admin communications' },
    { value: 'system', label: 'System Update', icon: 'CogIcon', color: 'blue', description: 'Platform system changes' },
    { value: 'maintenance', label: 'Maintenance', icon: 'ExclamationTriangleIcon', color: 'yellow', description: 'Scheduled maintenance notifications' },
    { value: 'update', label: 'Platform Update', icon: 'CheckCircleIcon', color: 'green', description: 'New features and improvements' },
    { value: 'warning', label: 'Warning', icon: 'ExclamationTriangleIcon', color: 'red', description: 'Important warnings and alerts' },
    { value: 'announcement', label: 'Announcement', icon: 'MegaphoneIcon', color: 'purple', description: 'General announcements' },
    { value: 'feature', label: 'New Feature', icon: 'CheckCircleIcon', color: 'green', description: 'Feature releases' },
    { value: 'security', label: 'Security Alert', icon: 'XCircleIcon', color: 'red', description: 'Security-related notifications' },
    { value: 'plan', label: 'Plan Update', icon: 'ChartBarIcon', color: 'indigo', description: 'Subscription plan changes' },
    { value: 'content', label: 'Content Moderation', icon: 'ExclamationTriangleIcon', color: 'orange', description: 'Content policy updates' },
    { value: 'welcome', label: 'Welcome Message', icon: 'UserPlusIcon', color: 'green', description: 'New user welcome messages' },
    { value: 'admin_welcome', label: 'Admin Welcome', icon: 'ShieldCheckIcon', color: 'purple', description: 'New admin welcome messages' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'gray', description: 'Informational updates' },
    { value: 'normal', label: 'Normal', color: 'blue', description: 'Standard notifications' },
    { value: 'high', label: 'High', color: 'orange', description: 'Important updates' },
    { value: 'urgent', label: 'Urgent', color: 'red', description: 'Critical alerts' }
  ];

  // Fetch users for dropdown
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => getAllUsersAPI({ limit: 100 }),
  });

  // Debug users data
  console.log('Users data loaded:', usersData);
  console.log('Users loading:', usersLoading);
  console.log('Users error:', usersError);

  const sendNotificationMutation = useMutation({
    mutationFn: ({ userId, notificationData }) => {
      console.log('Mutation called with userId:', userId, 'notificationData:', notificationData);
      return sendNotificationAPI(userId, notificationData);
    },
    onSuccess: (data) => {
      console.log('Individual notification success:', data);
      setShowIndividualModal(false);
      setFormData({ userId: '', title: '', message: '', type: 'admin', priority: 'normal' });
      alert('Notification sent successfully!');
    },
    onError: (error) => {
      console.error('Individual notification error:', error);
      alert('Failed to send notification: ' + (error.message || 'Unknown error'));
    }
  });

  const sendBroadcastMutation = useMutation({
    mutationFn: (notificationData) => {
      console.log('Mutation function called with:', notificationData);
      return sendNotificationToAllAPI(notificationData);
    },
    onSuccess: (data) => {
      console.log('Broadcast success response:', data);
      setShowBroadcastModal(false);
      setBroadcastData({ title: '', message: '', type: 'admin', priority: 'normal' });
      
      // Invalidate notification queries so users can see new notifications
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notification-count']);
      
      alert('Broadcast notification sent successfully! All users will now see this notification.');
    },
    onError: (error) => {
      console.error('Broadcast error:', error);
      alert('Failed to send broadcast notification: ' + error.message);
    }
  });

  const handleSendIndividualNotification = () => {
    console.log('Form data:', formData);
    if (!formData.userId || !formData.userId.trim()) {
      alert('Please select a valid user');
      return;
    }
    if (!formData.title || !formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!formData.message || !formData.message.trim()) {
      alert('Please enter a message');
      return;
    }
    
    console.log('Sending individual notification to user:', formData.userId);
    sendNotificationMutation.mutate({
      userId: formData.userId.trim(),
      notificationData: {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        priority: formData.priority
      }
    });
  };

  const handleSendBroadcastNotification = () => {
    if (broadcastData.title && broadcastData.message) {
      console.log('Sending broadcast notification:', broadcastData);
      sendBroadcastMutation.mutate({
        title: broadcastData.title.trim(),
        message: broadcastData.message.trim(),
        type: broadcastData.type,
        priority: broadcastData.priority
      });
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'gray',
      normal: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority] || 'blue';
  };

  const getTypeColor = (type) => {
    const typeObj = notificationTypes.find(t => t.value === type);
    return typeObj ? typeObj.color : 'blue';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Notification Management</h2>
        <p className="text-gray-600 dark:text-gray-300">Send notifications to individual users or broadcast to all users</p>
        <div className="mt-2 flex space-x-2">
          <a href="/notifications" target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">View User Notifications</a>
          <span className="text-gray-400">•</span>
          <a href="/settings" target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">User Settings</a>
        </div>
      </div>

      {/* Notification Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Individual Notification */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BellIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Individual Notification</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Send notification to a specific user</p>
            </div>
          </div>
          <button
            onClick={() => setShowIndividualModal(true)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <PaperAirplaneIcon className="h-5 w-5 mr-2" />
            Send Individual Notification
          </button>
        </div>

        {/* Broadcast Notification */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BellIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Broadcast Notification</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Send notification to all users</p>
            </div>
          </div>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
          >
            <PaperAirplaneIcon className="h-5 w-5 mr-2" />
            Send Broadcast Notification
          </button>
        </div>
      </div>

      {/* Notification Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Notification Guidelines</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li>• Individual notifications are sent to specific users by their user ID</li>
          <li>• Broadcast notifications are sent to all regular users (not admins)</li>
          <li>• Keep notifications concise and relevant</li>
          <li>• Use appropriate notification types (admin, system, update, etc.)</li>
          <li>• Notifications will appear in users&apos; notification center</li>
        </ul>
      </div>

      {/* Individual Notification Modal */}
      {showIndividualModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Send Individual Notification</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select User</label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a user...</option>
                    {usersData?.users?.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Notification message"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {notificationTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        <span className={`flex items-center`}>
                          <IconComponent name={type.icon} className={`h-4 w-4 mr-2 text-${type.color}-600 dark:text-${type.color}-400`} />
                          {type.label}
                        </span>
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {priorityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        <span className={`flex items-center`}>
                          <IconComponent name={level.color} className={`h-4 w-4 mr-2 text-${level.color}-600 dark:text-${level.color}-400`} />
                          {level.label}
                        </span>
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowIndividualModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendIndividualNotification}
                  disabled={!formData.userId.trim() || !formData.title.trim() || !formData.message.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Notification Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Send Broadcast Notification</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">This will send a notification to all regular users.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                  <input
                    type="text"
                    value={broadcastData.title}
                    onChange={(e) => setBroadcastData({...broadcastData, title: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                  <textarea
                    value={broadcastData.message}
                    onChange={(e) => setBroadcastData({...broadcastData, message: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Notification message"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    value={broadcastData.type}
                    onChange={(e) => setBroadcastData({...broadcastData, type: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {notificationTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        <span className={`flex items-center`}>
                          <IconComponent name={type.icon} className={`h-4 w-4 mr-2 text-${type.color}-600 dark:text-${type.color}-400`} />
                          {type.label}
                        </span>
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                  <select
                    value={broadcastData.priority}
                    onChange={(e) => setBroadcastData({...broadcastData, priority: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {priorityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        <span className={`flex items-center`}>
                          <IconComponent name={level.color} className={`h-4 w-4 mr-2 text-${level.color}-600 dark:text-${level.color}-400`} />
                          {level.label}
                        </span>
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendBroadcastNotification}
                  disabled={!broadcastData.title.trim() || !broadcastData.message.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Send Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;




