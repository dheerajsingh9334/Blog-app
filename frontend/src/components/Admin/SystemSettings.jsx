import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSystemSettingsAPI, 
  updateSystemSettingsAPI, 
  toggleMaintenanceModeAPI 
} from '../../APIServices/admin/adminAPI';
import { 
  CogIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  BellIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const SystemSettings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [showMaintenanceWarning, setShowMaintenanceWarning] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch system settings
  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ['system-settings'],
    queryFn: getSystemSettingsAPI,
  });

  const [formData, setFormData] = useState({
    siteName: 'WisdomShare',
    siteDescription: 'Share your wisdom with the world',
    maintenanceMode: false,
    registrationEnabled: true,
    maxFileSize: 5,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif'],
    defaultUserRole: 'user',
    maxPostsPerUser: 100,
    maxCommentsPerPost: 50,
    autoModerationEnabled: false,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      adminNotifications: true
    }
  });

  // Update form data when settings are loaded
  React.useEffect(() => {
    if (settingsData?.settings) {
      setFormData(settingsData.settings);
    }
  }, [settingsData]);

  const updateSettingsMutation = useMutation({
    mutationFn: updateSystemSettingsAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['system-settings']);
      alert('Settings updated successfully!');
    },
    onError: (error) => {
      alert('Failed to update settings: ' + error.message);
    }
  });

  const toggleMaintenanceMutation = useMutation({
    mutationFn: toggleMaintenanceModeAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['system-settings']);
      alert('Maintenance mode updated successfully!');
    },
    onError: (error) => {
      alert('Failed to update maintenance mode: ' + error.message);
    }
  });

  const handleSettingChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedSettingChange = (parentKey, childKey, value) => {
    setFormData(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(formData);
  };

  const handleToggleMaintenance = () => {
    if (formData.maintenanceMode) {
      // If enabling maintenance mode, show warning
      setShowMaintenanceWarning(true);
    } else {
      // If disabling, proceed directly
      toggleMaintenanceMutation.mutate(!formData.maintenanceMode);
    }
  };

  const confirmMaintenanceMode = () => {
    setShowMaintenanceWarning(false);
    toggleMaintenanceMutation.mutate(true);
  };

  const sections = [
    {
      id: 'general',
      name: 'General Settings',
      icon: CogIcon,
      description: 'Basic platform configuration'
    },
    {
      id: 'security',
      name: 'Security',
      icon: ShieldCheckIcon,
      description: 'Security and access control'
    },
    {
      id: 'content',
      name: 'Content Management',
      icon: DocumentTextIcon,
      description: 'Content and moderation settings'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      description: 'Notification preferences'
    },
    {
      id: 'monetization',
      name: 'Monetization',
      icon: CurrencyDollarIcon,
      description: 'Revenue and payment settings'
    }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => handleSettingChange('siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <input
              type="text"
              value={formData.siteDescription}
              onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
              <p className="text-sm text-gray-500">Temporarily disable the platform for maintenance</p>
            </div>
            <button
              onClick={handleToggleMaintenance}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">User Registration</label>
              <p className="text-sm text-gray-500">Allow new users to register</p>
            </div>
            <button
              onClick={() => handleSettingChange('registrationEnabled', !formData.registrationEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.registrationEnabled ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.registrationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Control</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default User Role
            </label>
            <select
              value={formData.defaultUserRole}
              onChange={(e) => handleSettingChange('defaultUserRole', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">File Upload Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max File Size (MB)
            </label>
            <input
              type="number"
              value={formData.maxFileSize}
              onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed File Types
            </label>
            <input
              type="text"
              value={formData.allowedFileTypes.join(', ')}
              onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="jpg, jpeg, png, gif"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Posts Per User
            </label>
            <input
              type="number"
              value={formData.maxPostsPerUser}
              onChange={(e) => handleSettingChange('maxPostsPerUser', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Comments Per Post
            </label>
            <input
              type="number"
              value={formData.maxCommentsPerPost}
              onChange={(e) => handleSettingChange('maxCommentsPerPost', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Moderation</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto Moderation</label>
              <p className="text-sm text-gray-500">Enable automatic content filtering</p>
            </div>
            <button
              onClick={() => handleSettingChange('autoModerationEnabled', !formData.autoModerationEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.autoModerationEnabled ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.autoModerationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              <p className="text-sm text-gray-500">Send notifications via email</p>
            </div>
            <button
              onClick={() => handleNestedSettingChange('notificationSettings', 'emailNotifications', !formData.notificationSettings.emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.notificationSettings.emailNotifications ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Push Notifications</label>
              <p className="text-sm text-gray-500">Send browser push notifications</p>
            </div>
            <button
              onClick={() => handleNestedSettingChange('notificationSettings', 'pushNotifications', !formData.notificationSettings.pushNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.notificationSettings.pushNotifications ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Admin Notifications</label>
              <p className="text-sm text-gray-500">Send notifications to administrators</p>
            </div>
            <button
              onClick={() => handleNestedSettingChange('notificationSettings', 'adminNotifications', !formData.notificationSettings.adminNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.notificationSettings.adminNotifications ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.notificationSettings.adminNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonetizationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Settings</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Monetization Configuration
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Configure revenue streams, payment gateways, and subscription settings.</p>
                <p className="mt-1">This section will be expanded with payment processing options.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'content':
        return renderContentSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'monetization':
        return renderMonetizationSettings();
      default:
        return renderGeneralSettings();
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
          <p>Error loading settings: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h2>
        <p className="text-gray-600">Configure platform settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${
                    isActive ? 'text-blue-700' : 'text-gray-500'
                  }`} />
                  <div>
                    <div className={`font-medium ${
                      isActive ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {section.name}
                    </div>
                    <div className={`text-sm ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {section.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {renderActiveSection()}
            
            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Mode Warning Modal */}
      {showMaintenanceWarning && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Enable Maintenance Mode?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Enabling maintenance mode will temporarily disable the platform for all users. 
                This should only be used during system updates or maintenance.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowMaintenanceWarning(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMaintenanceMode}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Enable Maintenance Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;



