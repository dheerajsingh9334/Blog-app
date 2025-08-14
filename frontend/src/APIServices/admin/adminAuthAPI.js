import { BASE_URL } from "../../utils/baseEndpoint";

// ===== ADMIN AUTHENTICATION =====

export const adminLoginAPI = async (credentials) => {
  const response = await fetch(`${BASE_URL}/admin/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  return response.json();
};

export const adminRegisterAPI = async (adminData) => {
  const response = await fetch(`${BASE_URL}/admin/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(adminData),
  });
  return response.json();
};

export const checkAdminAuthStatusAPI = async () => {
  const response = await fetch(`${BASE_URL}/admin/auth/status`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const adminLogoutAPI = async () => {
  const response = await fetch(`${BASE_URL}/admin/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return response.json();
};

export const adminForgotPasswordAPI = async (email) => {
  const response = await fetch(`${BASE_URL}/admin/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  return response.json();
};

export const adminResetPasswordAPI = async (token, newPassword) => {
  const response = await fetch(`${BASE_URL}/admin/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ token, newPassword }),
  });
  return response.json();
};

export const adminChangePasswordAPI = async (currentPassword, newPassword) => {
  const response = await fetch(`${BASE_URL}/admin/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return response.json();
};



