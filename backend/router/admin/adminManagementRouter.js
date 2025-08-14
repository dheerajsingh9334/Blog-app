const express = require("express");
const adminController = require("../../controllers/admin/adminController");
const adminAuthController = require("../../controllers/admin/adminAuthController");
const { protectAdmin, authorizeAdmin } = require("../../middlewares/adminAuth");

const adminManagementRouter = express.Router();

// Apply admin authentication middleware to all routes
adminManagementRouter.use(protectAdmin);

// ===== DASHBOARD & ANALYTICS =====
adminManagementRouter.get("/dashboard", adminController.getDashboardStats);
adminManagementRouter.get("/system-stats", adminController.getSystemStats);
adminManagementRouter.get("/activity-feed", adminController.getActivityFeed);

// ===== USER MANAGEMENT =====
adminManagementRouter.get("/users", adminController.getAllUsers);
adminManagementRouter.get("/users/:userId", adminController.getUserDetails);
adminManagementRouter.put("/users/:userId/role", adminController.updateUserRole);
adminManagementRouter.put("/users/:userId/ban", adminController.banUser);
adminManagementRouter.put("/users/:userId/unban", adminController.unbanUser);
adminManagementRouter.delete("/users/:userId", authorizeAdmin("super_admin"), adminController.deleteUser);
adminManagementRouter.put("/users/:userId/assign-plan", adminController.assignPlanToUser);

// ===== ADMIN MANAGEMENT =====
adminManagementRouter.get("/admin-users", adminController.getAdminUsers);

// ===== POST MANAGEMENT =====
adminManagementRouter.get("/posts", adminController.getAllPosts);
adminManagementRouter.delete("/posts/:postId", adminController.deletePost);
adminManagementRouter.get("/posts/check-categories", adminController.checkPostsWithoutCategories);

// ===== COMMENT MANAGEMENT =====
adminManagementRouter.get("/comments", adminController.getAllComments);
adminManagementRouter.delete("/comments/:commentId", adminController.deleteComment);

// ===== PLAN MANAGEMENT =====
adminManagementRouter.get("/plans", adminController.getAllPlans);
adminManagementRouter.post("/plans", authorizeAdmin("super_admin"), adminController.createPlan);
adminManagementRouter.put("/plans/:planId", authorizeAdmin("super_admin"), adminController.updatePlan);
adminManagementRouter.delete("/plans/:planId", authorizeAdmin("super_admin"), adminController.deletePlan);

// ===== CATEGORY MANAGEMENT =====
adminManagementRouter.get("/categories", adminController.getAllCategories);
adminManagementRouter.post("/categories", adminController.createCategory);
adminManagementRouter.put("/categories/:categoryId", adminController.updateCategory);
adminManagementRouter.delete("/categories/:categoryId", adminController.deleteCategory);

// ===== NOTIFICATION MANAGEMENT =====
adminManagementRouter.post("/notifications/broadcast", (req, res, next) => {
  console.log('Route hit: POST /notifications/broadcast');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  next();
}, adminController.sendNotificationToAll);

// Individual notification route - must come after broadcast to avoid conflicts
adminManagementRouter.post("/notifications/user/:userId", adminController.sendNotification);

// Admin notifications (admin inbox)
adminManagementRouter.get("/notifications", adminController.fetchAdminNotifications);
adminManagementRouter.get("/notifications/unread-count", adminController.getAdminUnreadCount);
adminManagementRouter.put("/notifications/mark-all-read", adminController.markAllAdminNotificationsRead);
adminManagementRouter.put("/notifications/:notificationId", adminController.readAdminNotification);
adminManagementRouter.delete("/notifications/:notificationId", adminController.deleteAdminNotification);
adminManagementRouter.delete("/notifications", adminController.deleteAllAdminNotifications);

// ===== SYSTEM SETTINGS =====
adminManagementRouter.get("/settings", adminController.getSystemSettings);
adminManagementRouter.put("/settings", adminController.updateSystemSettings);
adminManagementRouter.put("/settings/maintenance", adminController.toggleMaintenanceMode);
adminManagementRouter.get("/logs", adminController.getSystemLogs);

// ===== ADMIN PROFILE MANAGEMENT =====
adminManagementRouter.get("/profile", adminController.getAdminProfile);
adminManagementRouter.put("/profile", adminController.updateAdminProfile);
adminManagementRouter.put("/profile/password", adminAuthController.changeAdminPassword);
adminManagementRouter.delete("/profile/delete-account", adminController.deleteAdminAccount);

module.exports = adminManagementRouter;



