// Admin Configuration
export const ADMIN_CONFIG = {
  // Admin dashboard URL
  DASHBOARD_URL: "/admin/dashboard",
  
  // Redirect delay after successful login/registration
  REDIRECT_DELAY: 1500,
  
  // Admin token cookie name
  TOKEN_COOKIE: "adminToken",
  
  // Default admin credentials (for initial setup)
  DEFAULT_ADMIN: {
    username: "admin",
    email: "admin@yourplatform.com",
    password: "Admin@2024Secure"
  }
};

// Function to get default admin credentials
export const getDefaultAdminCredentials = () => {
  return ADMIN_CONFIG.DEFAULT_ADMIN;
};

export default ADMIN_CONFIG;
