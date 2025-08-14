const asyncHandler = require("express-async-handler");
const User = require("../models/User/User");

const checkUserBan = asyncHandler(async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return next();
    }

    // req.user is already the user ID (set by isAuthenticated middleware)
    const userId = req.user;

    // Get user from database to check ban status
    const user = await User.findById(userId);
    
    if (!user) {
      return next();
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        status: "error",
        message: "Your account has been banned",
        banReason: user.banReason,
        bannedAt: user.bannedAt,
        isBanned: true
      });
    }

    // Add ban info to request for frontend use
    req.userBanInfo = {
      isBanned: false
    };

    next();
  } catch (error) {
    console.error("Error in checkUserBan middleware:", error);
    next();
  }
});

module.exports = checkUserBan;



