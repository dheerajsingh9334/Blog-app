import { BASE_URL } from "../../utils/baseEndpoint";
import axios from "axios";

//! Fetch all notifications for the authenticated user
export const fetchNotificationsAPI = async () => {
  const response = await axios.get(`${BASE_URL}/notifications`, {
    withCredentials: true,
  });
  return response.data;
};

//! Read a specific notification
export const readNotificationAPI = async (notificationId) => {
  const response = await axios.put(
    `${BASE_URL}/notifications/${notificationId}`,
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

//! Mark all notifications as read
export const markAllNotificationsReadAPI = async () => {
  const response = await axios.put(
    `${BASE_URL}/notifications/mark-all-read`,
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

//! Get unread notification count
export const getUnreadNotificationCountAPI = async () => {
  const response = await axios.get(`${BASE_URL}/notifications/unread-count`, {
    withCredentials: true,
  });
  return response.data;
};

//! Delete a specific notification
export const deleteNotificationAPI = async (notificationId) => {
  const response = await axios.delete(`${BASE_URL}/notifications/${notificationId}`, {
    withCredentials: true,
  });
  return response.data;
};

//! Delete all notifications
export const deleteAllNotificationsAPI = async () => {
  const response = await axios.delete(`${BASE_URL}/notifications`, {
    withCredentials: true,
  });
  return response.data;
};
