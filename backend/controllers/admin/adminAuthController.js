const Admin = require("../../models/Admin/Admin");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

// Helper function to send admin token response
const sendAdminTokenResponse = (admin, statusCode, res) => {
  const token = admin.generateAuthToken();

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.status(statusCode)
    .cookie("adminToken", token, options)
    .json({
      success: true,
      message: "Admin authentication successful",
      admin: admin.getPublicInfo(),
      token,
    });
};

const adminAuthController = {
  // Admin Login
  adminLogin: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    try {
      // Find admin by credentials
      const admin = await Admin.findByCredentials(email, password);
      
      // Send token response
      sendAdminTokenResponse(admin, 200, res);
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(401).json({
        success: false,
        message: error.message || "Invalid credentials",
      });
    }
  }),

  // Admin Registration
  adminRegister: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email, and password",
      });
    }

    try {
      // Create admin without admin code validation
      const admin = await Admin.createAdminWithoutCode({ username, email, password });

      // Send token response
      sendAdminTokenResponse(admin, 201, res);
    } catch (error) {
      console.error("Admin registration error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Registration failed",
      });
    }
  }),

  // Check Admin Auth Status
  checkAdminAuthStatus: asyncHandler(async (req, res) => {
    try {
      // Get token from cookie
      const token = req.cookies.adminToken;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No admin token found",
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token is for admin
      if (decoded.type !== "admin") {
        return res.status(401).json({
          success: false,
          message: "Invalid token type",
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

      res.json({
        success: true,
        message: "Admin authenticated",
        admin: admin.getPublicInfo(),
      });
    } catch (error) {
      console.error("Admin auth status check error:", error);
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  }),

  // Admin Logout
  adminLogout: asyncHandler(async (req, res) => {
    res.cookie("adminToken", "none", {
      expires: new Date(Date.now() + 10 * 1000), // 10 seconds
      httpOnly: true,
    });

    res.json({
      success: true,
      message: "Admin logged out successfully",
    });
  }),

  // Get Current Admin Profile
  getAdminProfile: asyncHandler(async (req, res) => {
    try {
      const admin = await Admin.findById(req.admin.id);
      
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      res.json({
        success: true,
        admin: admin.getPublicInfo(),
      });
    } catch (error) {
      console.error("Get admin profile error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching admin profile",
      });
    }
  }),

  // Update Admin Profile
  updateAdminProfile: asyncHandler(async (req, res) => {
    const { firstName, lastName, bio, preferences } = req.body;

    const updateData = {};
    
    if (firstName !== undefined) updateData["profile.firstName"] = firstName;
    if (lastName !== undefined) updateData["profile.lastName"] = lastName;
    if (bio !== undefined) updateData["profile.bio"] = bio;
    if (preferences !== undefined) updateData.preferences = preferences;

    try {
      const admin = await Admin.findByIdAndUpdate(
        req.admin.id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      res.json({
        success: true,
        message: "Admin profile updated successfully",
        admin: admin.getPublicInfo(),
      });
    } catch (error) {
      console.error("Update admin profile error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Error updating admin profile",
      });
    }
  }),

  // Change Admin Password
  changeAdminPassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    try {
      const admin = await Admin.findById(req.admin.id).select("+password");

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      // Check current password
      const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      admin.password = newPassword;
      await admin.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change admin password error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Error changing password",
      });
    }
  }),

  // Forgot Password
  forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email address",
      });
    }

    try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin with this email not found",
        });
      }

      // Generate reset token
      const resetToken = admin.generatePasswordResetToken();
      await admin.save();

      // TODO: Send email with reset token
      // For now, just return the token (in production, send via email)
      res.json({
        success: true,
        message: "Password reset token generated",
        resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Error generating reset token",
      });
    }
  }),

  // Reset Password
  resetPassword: asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide token and new password",
      });
    }

    try {
      const admin = await Admin.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!admin) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      // Set new password
      admin.password = newPassword;
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpire = undefined;
      await admin.save();

      res.json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Error resetting password",
      });
    }
  }),
};

module.exports = adminAuthController;



