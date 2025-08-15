import { BASE_URL } from "../../utils/baseEndpoint";

// ===== DASHBOARD & ANALYTICS =====
export const getDashboardStatsAPI = async () => {
  const response = await fetch(`${BASE_URL}/admin/dashboard`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const getSystemStatsAPI = async () => {
  const response = await fetch(`${BASE_URL}/admin/system-stats`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const getActivityFeedAPI = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/admin/activity-feed?${queryParams}`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

// ===== USER MANAGEMENT =====
export const getAllUsersAPI = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/admin/users?${queryParams}`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const getUserDetailsAPI = async (userId) => {
  const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const updateUserRoleAPI = async (userId, role) => {
  const response = await fetch(`${BASE_URL}/admin/users/${userId}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  return response.json();
};

export const banUserAPI = async (userId, reason) => {
  const response = await fetch(`${BASE_URL}/admin/users/${userId}/ban`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ reason }),
  });
  return response.json();
};

export const unbanUserAPI = async (userId) => {
  const response = await fetch(`${BASE_URL}/admin/users/${userId}/unban`, {
    method: "PUT",
    credentials: "include",
  });
  return response.json();
};

export const deleteUserAPI = async (userId) => {
  const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return response.json();
};

        // ===== ADMIN MANAGEMENT =====
        export const getAdminUsersAPI = async () => {
          const response = await fetch(`${BASE_URL}/admin/admin-users`, {
            method: "GET",
            credentials: "include",
          });
          return response.json();
        };



// ===== POST MANAGEMENT =====
export const getAllPostsAPI = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/admin/posts?${queryParams}`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const deletePostAPI = async (postId) => {
  const response = await fetch(`${BASE_URL}/admin/posts/${postId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return response.json();
};

export const checkPostsWithoutCategoriesAPI = async () => {
  const response = await fetch(`${BASE_URL}/admin/posts/check-categories`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

// ===== COMMENT MANAGEMENT =====
export const getAllCommentsAPI = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/admin/comments?${queryParams}`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const deleteCommentAPI = async (commentId) => {
  const response = await fetch(`${BASE_URL}/admin/comments/${commentId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return response.json();
};

// ===== PLAN MANAGEMENT =====
export const getAllPlansAPI = async () => {
  const response = await fetch(`${BASE_URL}/admin/plans`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const createPlanAPI = async (planData) => {
  const response = await fetch(`${BASE_URL}/admin/plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(planData),
  });
  return response.json();
};

export const updatePlanAPI = async (planId, planData) => {
  const response = await fetch(`${BASE_URL}/admin/plans/${planId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(planData),
  });
  return response.json();
};

export const deletePlanAPI = async (planId) => {
  const response = await fetch(`${BASE_URL}/admin/plans/${planId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return response.json();
};

export const assignPlanToUserAPI = async (userId, planId) => {
  const response = await fetch(`${BASE_URL}/admin/users/${userId}/assign-plan`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ planId }),
  });
  return response.json();
};

// ===== CATEGORY MANAGEMENT =====
export const getAllCategoriesAPI = async () => {
  const response = await fetch(`${BASE_URL}/admin/categories`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const createCategoryAPI = async (categoryData) => {
  const response = await fetch(`${BASE_URL}/admin/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(categoryData),
  });
  return response.json();
};

export const updateCategoryAPI = async (categoryId, categoryData) => {
  const response = await fetch(`${BASE_URL}/admin/categories/${categoryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(categoryData),
  });
  return response.json();
};

export const deleteCategoryAPI = async (categoryId) => {
  const response = await fetch(`${BASE_URL}/admin/categories/${categoryId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return response.json();
};

// ===== NOTIFICATION MANAGEMENT =====

// Fetch admin notifications (admin inbox)
export const fetchAdminNotificationsAPI = async () => {
  const response = await fetch(`${BASE_URL}/admin/notifications`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

// Get admin unread notification count
export const getAdminUnreadCountAPI = async () => {
  const response = await fetch(`${BASE_URL}/admin/notifications/unread-count`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

// Mark admin notification as read
export const readAdminNotificationAPI = async (notificationId) => {
  const response = await fetch(`${BASE_URL}/admin/notifications/${notificationId}/read`, {
    method: "PUT",
    credentials: "include",
  });
  return response.json();
};

// Mark all admin notifications as read
export const markAllAdminNotificationsReadAPI = async () => {
  const response = await fetch(`${BASE_URL}/admin/notifications/mark-all-read`, {
    method: "PUT",
    credentials: "include",
  });
  return response.json();
};

// Delete admin notification
export const deleteAdminNotificationAPI = async (notificationId) => {
  const response = await fetch(`${BASE_URL}/admin/notifications/${notificationId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return response.json();
};

// Delete all admin notifications
export const deleteAllAdminNotificationsAPI = async () => {
  const response = await fetch(`${BASE_URL}/admin/notifications`, {
    method: "DELETE",
    credentials: "include",
  });
  return response.json();
};

export const sendNotificationAPI = async (userId, notificationData) => {
  const response = await fetch(`${BASE_URL}/admin/notifications/user/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(notificationData),
  });
  return response.json();
};

export const sendNotificationToAllAPI = async (notificationData) => {
  const response = await fetch(`${BASE_URL}/admin/notifications/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(notificationData),
  });
  return response.json();
};

// ===== SYSTEM SETTINGS =====

export const getSystemSettingsAPI = async () => {
  const response = await fetch(`${BASE_URL}/admin/settings`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const updateSystemSettingsAPI = async (settings) => {
  const response = await fetch(`${BASE_URL}/admin/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(settings),
  });
  return response.json();
};

export const toggleMaintenanceModeAPI = async (enabled) => {
  const response = await fetch(`${BASE_URL}/admin/settings/maintenance`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ maintenanceMode: enabled }),
  });
  return response.json();
};

export const getSystemLogsAPI = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/admin/logs?${queryParams}`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

// ===== HEALTH CHECK =====
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${BASE_URL.replace('/api/v1', '')}/health`, {
      method: "GET",
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};

// ===== ADMIN PROFILE MANAGEMENT =====
export const updateAdminProfileAPI = async (profileData) => {
  const response = await fetch(`${BASE_URL}/admin/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(profileData),
  });
  return response.json();
};

export const changeAdminPasswordAPI = async (passwordData) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/profile/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(passwordData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error("Password change API error:", error);
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error("Unable to connect to server. Please check if the backend is running.");
    }
    throw error;
  }
};

export const getAdminProfileAPI = async () => {
  const response = await fetch(`${BASE_URL}/admin/profile`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const deleteAdminAccountAPI = async (passwordData) => {
  const response = await fetch(`${BASE_URL}/admin/profile/delete-account`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(passwordData),
  });
  return response.json();
};
