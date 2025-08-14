const express = require("express");
const adminAuthController = require("../../controllers/admin/adminAuthController");
const { protectAdmin } = require("../../middlewares/adminAuth");

const adminAuthRouter = express.Router();

// Public routes (no authentication required)
adminAuthRouter.post("/login", adminAuthController.adminLogin);
adminAuthRouter.post("/register", adminAuthController.adminRegister);
adminAuthRouter.get("/status", adminAuthController.checkAdminAuthStatus);
adminAuthRouter.post("/logout", adminAuthController.adminLogout);
adminAuthRouter.post("/forgot-password", adminAuthController.forgotPassword);
adminAuthRouter.post("/reset-password", adminAuthController.resetPassword);

// Protected routes (authentication required)
adminAuthRouter.get("/profile", protectAdmin, adminAuthController.getAdminProfile);
adminAuthRouter.put("/profile", protectAdmin, adminAuthController.updateAdminProfile);
adminAuthRouter.put("/change-password", protectAdmin, adminAuthController.changeAdminPassword);

module.exports = adminAuthRouter;



