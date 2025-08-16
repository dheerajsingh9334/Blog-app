import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchNotificationsAPI, 
  readNotificationAPI, 
  markAllNotificationsReadAPI, 
  getUnreadNotificationCountAPI,
  deleteNotificationAPI,
  deleteAllNotificationsAPI
} from '../APIServices/notifications/nofitificationsAPI';

// Create the notification context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // 🚀 SINGLE SOURCE OF TRUTH - No more duplicate API calls!
  const { data: notifications, isLoading: notificationsLoading, error: notificationsError } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotificationsAPI,
    refetchInterval: 30000, // Single refetch interval for all components
    staleTime: 10000, // Data stays fresh for 10 seconds
  });

  // 🚀 SINGLE SOURCE OF TRUTH - No more duplicate API calls!
  const { data: unreadCount, isLoading: countLoading } = useQuery({
    queryKey: ["notification-count"],
    queryFn: getUnreadNotificationCountAPI,
    refetchInterval: 30000, // Single refetch interval for all components
    staleTime: 10000, // Data stays fresh for 10 seconds
  });

  // Mutations for notification actions
  const markAsReadMutation = useMutation({
    mutationFn: readNotificationAPI,
    onSuccess: () => {
      // Invalidate both queries to update UI
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notification-count"]);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsReadAPI,
    onSuccess: () => {
      // Invalidate both queries to update UI
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notification-count"]);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotificationAPI,
    onSuccess: () => {
      // Invalidate both queries to update UI
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notification-count"]);
    },
  });

  const deleteAllNotificationsMutation = useMutation({
    mutationFn: deleteAllNotificationsAPI,
    onSuccess: () => {
      // Invalidate both queries to update UI
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notification-count"]);
    },
  });

  // Filtered notifications based on current filter and showUnreadOnly state
  const filteredNotifications = notifications?.filter(notification => {
    if (showUnreadOnly && notification.isRead) return false;
    if (filter !== 'all' && notification.type !== filter) return false;
    return true;
  }) || [];

  // Handler functions
  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteNotification = (notificationId) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      deleteNotificationMutation.mutate(notificationId);
    }
  };

  const handleDeleteAllNotifications = () => {
    if (window.confirm("Are you sure you want to delete all notifications? This action cannot be undone.")) {
      deleteAllNotificationsMutation.mutate();
    }
  };

  // Context value
  const value = {
    // Data
    notifications,
    unreadCount: unreadCount?.unreadCount || 0,
    filteredNotifications,
    
    // Loading states
    isLoading: notificationsLoading || countLoading,
    notificationsLoading,
    countLoading,
    
    // Error state
    error: notificationsError,
    
    // Filter state
    filter,
    setFilter,
    showUnreadOnly,
    setShowUnreadOnly,
    
    // Actions
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handleDeleteAllNotifications,
    
    // Mutation states
    markAsReadMutation,
    markAllAsReadMutation,
    deleteNotificationMutation,
    deleteAllNotificationsMutation,
    
    // Raw data for components that need it
    rawNotifications: notifications,
    rawUnreadCount: unreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};


