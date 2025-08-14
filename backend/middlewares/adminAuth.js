const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin/Admin");
const asyncHandler = require("express-async-handler");

// Protect admin routes
const protectAdmin = asyncHandler(async (req, res, next) => {
  console.log('Admin auth middleware - Request path:', req.path);
  console.log('Admin auth middleware - Cookies:', req.cookies);
  
  let token;

  // Get token from cookie
  if (req.cookies.adminToken) {
    token = req.cookies.adminToken;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is for admin
    if (decoded.type !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Invalid token type for admin access",
      });
    }

    // Find admin
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Admin account is deactivated",
      });
    }

    // Add admin to request object
    req.admin = admin;
    console.log('Admin auth middleware - Admin authenticated:', admin.username, admin.role);
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
});

// Authorize admin roles
const authorizeAdmin = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Admin role ${req.admin.role} is not authorized to access this route`,
      });
    }

    next();
  };
};

// Check admin permissions
const checkAdminPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    if (!req.admin.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Admin does not have permission to ${permission}`,
      });
    }

    next();
  };
};

module.exports = {
  protectAdmin,
  authorizeAdmin,
  checkAdminPermission,
};



