import React from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { checkAdminAuthStatusAPI } from '../../APIServices/admin/adminAuthAPI';

const AdminDebug = () => {
  const { isAdminAuthenticated, adminAuth, adminLoading, adminError } = useSelector((state) => state.adminAuth);
  
  const { data: authStatus, isLoading: statusLoading, error: statusError } = useQuery({
    queryKey: ['admin-auth-status-debug'],
    queryFn: checkAdminAuthStatusAPI,
    refetchInterval: 5000, // Check every 5 seconds
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Authentication Debug</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Redux State */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Redux State</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <div><strong>isAdminAuthenticated:</strong> {isAdminAuthenticated ? '✅ Yes' : '❌ No'}</div>
            <div><strong>adminLoading:</strong> {adminLoading ? '🔄 Yes' : '⏹️ No'}</div>
            <div><strong>adminError:</strong> {adminError || 'None'}</div>
            <div><strong>adminAuth:</strong> {adminAuth ? `${adminAuth.username} (${adminAuth.email})` : 'None'}</div>
          </div>
        </div>

        {/* API Status */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">API Status Check</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <div><strong>Status Loading:</strong> {statusLoading ? '🔄 Yes' : '⏹️ No'}</div>
            <div><strong>Status Error:</strong> {statusError ? '❌ Yes' : '✅ No'}</div>
            <div><strong>Auth Status:</strong> {authStatus?.success ? '✅ Success' : '❌ Failed'}</div>
            <div><strong>Message:</strong> {authStatus?.message || 'None'}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-3">
        <h3 className="font-semibold text-gray-700">Actions</h3>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
          >
            Refresh Page
          </button>
          <button
            onClick={() => window.location.href = '/admin/auth/login'}
            className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>

      {/* Raw Data */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-700 mb-2">Raw Data</h3>
        <details className="bg-gray-50 p-3 rounded">
          <summary className="cursor-pointer font-medium">Click to expand</summary>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify({ adminAuth, authStatus, isAdminAuthenticated }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default AdminDebug;

