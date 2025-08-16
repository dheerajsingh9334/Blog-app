const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../../models/User/User");
const Admin = require("../../models/Admin/Admin");
const Post = require("../../models/Post/Post");
const Comment = require("../../models/Comment/Comment");
const Plan = require("../../models/Plan/Plan");
const Category = require("../../models/Category/Category");
const Notification = require("../../models/Notification/Notification");
const sendAdminNotificationEmail = require("../../utils/sendAdminNotificationEmail");
const AdminNotificationService = require("../../utils/adminNotificationService");

const adminController = {
  // ===== DASHBOARD & ANALYTICS =====
  
  // Get admin dashboard statistics
  getDashboardStats: asyncHandler(async (req, res) => {
    // Get posts data
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: "published" });
    const draftPosts = await Post.countDocuments({ status: "draft" });
    const pendingPosts = await Post.countDocuments({ status: "pending" });

    // Get users data
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });

    // Get engagement data
    const totalViews = await Post.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]);

    const totalLikes = await Post.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$likes" } } } }
    ]);

    const totalComments = await Comment.countDocuments();

    res.json({
      stats: {
        totalPosts: totalPosts,
        publishedPosts: publishedPosts,
        draftPosts: draftPosts,
        pendingPosts: pendingPosts,
        totalUsers: totalUsers,
        verifiedUsers: verifiedUsers,
        bannedUsers: bannedUsers,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        totalComments: totalComments
      }
    });
  }),

  // ===== USER MANAGEMENT =====
  
  // Get all users with pagination and filters
  getAllUsers: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const isBanned = req.query.isBanned || "";
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    if (role) filter.role = role;
    if (isBanned !== "") filter.isBanned = isBanned === "true";
    
    const users = await User.find(filter)
      .populate("plan", "planName tier")
      .populate("bannedBy", "username")
      .select("-password -passwordResetToken -accountVerificationToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  }),

  // Get single user details
  getUserDetails: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate("plan", "planName tier postLimit price")
      .populate("posts", "title content createdAt")
      .populate("followers", "username email profilePicture")
      .populate("following", "username email profilePicture")
      .populate("bannedBy", "username")
      .select("-password -passwordResetToken -accountVerificationToken");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ user });
  }),

  // Update user role
  updateUserRole: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!["user", "moderator"].includes(role)) {
      return res.status(400).json({ message: "Invalid role - admin roles are managed separately" });
    }
    
    // Prevent admin from changing their own role (admin users are managed separately)
    if (userId === req.admin.id) {
      return res.status(400).json({ message: "Cannot change your own role - admin roles are managed separately" });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ 
      message: "User role updated successfully",
      user 
    });
  }),

  // Ban user
  banUser: asyncHandler(async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      
      const user = await User.findByIdAndUpdate(
        userId,
        {
          isBanned: true,
          banReason: reason || "Violation of community guidelines",
          bannedAt: new Date(),
          bannedBy: req.admin.id
        },
        { new: true }
      ).select("-password");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Notify all admins about user ban
      try {
        await AdminNotificationService.notifyUserBanStatus(user, true, req.admin, user.banReason);
      } catch (error) {
        console.error('Error creating user ban notification:', error);
      }
      
      // Send notification to the banned user with admin contact info
      await Notification.create({
        userId: user._id,
        title: "Account Banned",
        message: `Your account has been banned for: ${user.banReason}`,
        type: "admin",
        priority: "high",
        metadata: {
          actorId: req.admin._id,
          actorName: req.admin.username,
          actorEmail: req.admin.email,
          action: "banned your account",
          targetType: "account",
          additionalData: {
            adminContact: {
              username: req.admin.username,
              email: req.admin.email,
              role: req.admin.role,
              contactInfo: req.admin.profile?.contactInfo || "Contact admin for support"
            },
            banDetails: {
              reason: user.banReason,
              bannedAt: user.bannedAt,
              adminUsername: req.admin.username
            }
          }
        }
      });
      
      // Send admin notification email
      try {
        // Get admin email from environment or use a default
        const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
        
        if (adminEmail) {
          await sendAdminNotificationEmail(
            adminEmail,
            user,
            reason,
            req.admin.username
          );
          console.log(`Admin notification email sent to ${adminEmail} for banned user ${user.username}`);
        } else {
          console.warn("No admin email configured for ban notifications");
        }
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
        // Don't fail the ban operation if email fails
      }
      
      res.json({ 
        message: "User banned successfully",
        user: {
          ...user.toObject(),
          bannedBy: req.admin.username
        }
      });
    } catch (error) {
      console.error("Error in banUser:", error);
      res.status(500).json({ 
        message: "Failed to ban user",
        error: error.message 
      });
    }
  }),

  // Unban user
  unbanUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isBanned: false,
        banReason: null,
        bannedAt: null,
        bannedBy: null
      },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Notify all admins about user unban
    try {
      await AdminNotificationService.notifyUserBanStatus(user, false, req.admin);
    } catch (error) {
      console.error('Error creating user unban notification:', error);
    }

    // Send notification to the unbanned user
    try {
      await Notification.create({
        userId: user._id,
        title: "Account Unbanned",
        message: "Your account has been unbanned. You can now access all features.",
        type: "admin",
        priority: "medium",
        metadata: {
          actorId: req.admin._id,
          actorName: req.admin.username,
          actorEmail: req.admin.email,
          action: "unbanned your account",
          targetType: "account",
          additionalData: {
            adminContact: {
              username: req.admin.username,
              email: req.admin.email,
              role: req.admin.role
            },
            unbanTime: new Date()
          }
        }
      });

      console.log(`✅ Notifications sent for unbanned user ${user.username}`);
    } catch (notificationError) {
      console.error("❌ Failed to send unban notifications:", notificationError);
      // Don't fail the unban operation if notifications fail
    }
    
    res.json({ 
      message: "User unbanned successfully",
      user 
    });
  }),

  // Delete user
  deleteUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    // Prevent admin from deleting themselves
    if (userId === req.admin.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Delete all posts by this user
    await Post.deleteMany({ author: userId });
    
    // Delete all comments by this user
    await Comment.deleteMany({ author: userId });
    
    // Notify all admins about user deletion
    try {
      await AdminNotificationService.notifyUserDeletion(user, req.admin);
    } catch (error) {
      console.error('Error creating user deletion notification:', error);
    }
    
    res.json({ message: "User and all associated data deleted successfully" });
  }),

  // ===== POST MANAGEMENT =====
  
  // Get all posts with pagination and filters
  getAllPosts: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const author = req.query.author || "";
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    if (category) filter.category = category;
    if (author) filter.author = author;
    
    try {
      const posts = await Post.find(filter)
        .populate("author", "username email profilePicture")
        .populate("category", "categoryName description")
        .populate("comments", "content author")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Post.countDocuments(filter);
      
      res.json({
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ 
        message: "Error fetching posts",
        error: error.message 
      });
    }
  }),

  // Delete post
  deletePost: asyncHandler(async (req, res) => {
    const { postId } = req.params;
    
    const post = await Post.findByIdAndDelete(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Get post author information for notification
    const author = await User.findById(post.author);
    
    // Delete all comments on this post
    await Comment.deleteMany({ post: postId });
    
    // Remove post from user's posts array
    await User.findByIdAndUpdate(post.author, {
      $pull: { posts: postId }
    });
    
    // Notify all admins about post deletion
    if (author) {
      try {
        await AdminNotificationService.notifyPostDeletion(post, author, req.admin);
      } catch (error) {
        console.error('Error creating post deletion notification:', error);
      }
    }
    
    res.json({ message: "Post and all comments deleted successfully" });
  }),

  // ===== COMMENT MANAGEMENT =====
  
  // Get all comments with pagination
  getAllComments: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const post = req.query.post || "";
    const author = req.query.author || "";
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (search) {
      filter.content = { $regex: search, $options: "i" };
    }
    if (post) filter.post = post;
    if (author) filter.author = author;
    
    const comments = await Comment.find(filter)
      .populate("author", "username email profilePicture")
      .populate("post", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Comment.countDocuments(filter);
    
    res.json({
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  }),

  // Delete comment
  deleteComment: asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    
    const comment = await Comment.findByIdAndDelete(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Get comment author information for notification
    const author = await User.findById(comment.author);
    
    // Notify all admins about comment deletion
    if (author) {
      try {
        await AdminNotificationService.notifyCommentDeletion(comment, author, req.admin);
      } catch (error) {
        console.error('Error creating comment deletion notification:', error);
      }
    }
    
    res.json({ message: "Comment deleted successfully" });
  }),

  // ===== PLAN MANAGEMENT =====
  
  // Get all plans
  getAllPlans: asyncHandler(async (req, res) => {
    const plans = await Plan.find().sort({ price: 1 });
    
    res.json({ plans });
  }),

  // Create new plan
  createPlan: asyncHandler(async (req, res) => {
    const {
      planName,
      tier,
      price,
      postLimit,
      features,
      isActive
    } = req.body;
    
    const plan = await Plan.create({
      planName,
      tier,
      price,
      postLimit,
      features,
      isActive: isActive !== undefined ? isActive : true
    });
    
    // Notify all admins about plan creation
    try {
      await AdminNotificationService.notifyPlanAction(plan, 'created', req.admin);
    } catch (error) {
      console.error('Error creating plan creation notification:', error);
    }
    
    res.status(201).json({
      message: "Plan created successfully",
      plan
    });
  }),

  // Update plan
  updatePlan: asyncHandler(async (req, res) => {
    const { planId } = req.params;
    const updateData = req.body;
    
    const plan = await Plan.findByIdAndUpdate(
      planId,
      updateData,
      { new: true }
    );
    
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    
    // Notify all admins about plan update
    try {
      await AdminNotificationService.notifyPlanAction(plan, 'updated', req.admin);
    } catch (error) {
      console.error('Error creating plan update notification:', error);
    }
    
    res.json({
      message: "Plan updated successfully",
      plan
    });
  }),

  // Delete plan
  deletePlan: asyncHandler(async (req, res) => {
    const { planId } = req.params;
    
    // Check if any users are using this plan
    const usersWithPlan = await User.countDocuments({ plan: planId });
    if (usersWithPlan > 0) {
      return res.status(400).json({ 
        message: `Cannot delete plan. ${usersWithPlan} users are currently using this plan.` 
      });
    }
    
    const plan = await Plan.findByIdAndDelete(planId);
    
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    
    // Notify all admins about plan deletion
    try {
      await AdminNotificationService.notifyPlanAction(plan, 'deleted', req.admin);
    } catch (error) {
      console.error('Error creating plan deletion notification:', error);
    }
    
    res.json({ message: "Plan deleted successfully" });
  }),

  // Assign plan to user
  assignPlanToUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { planId } = req.body;
    
    // Get old plan for comparison
    const oldUser = await User.findById(userId).populate("plan");
    const oldPlan = oldUser?.plan;
    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        plan: planId,
        hasSelectedPlan: true
      },
      { new: true }
    ).populate("plan");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Notify all admins about plan change
    try {
      const newPlan = await Plan.findById(planId);
      await AdminNotificationService.notifyUserPlanChange(user, oldPlan, newPlan, req.admin);
    } catch (error) {
      console.error('Error creating plan change notification:', error);
    }
    
    res.json({
      message: "Plan assigned successfully",
      user
    });
  }),

  // ===== CATEGORY MANAGEMENT =====
  
  // Get all categories
  getAllCategories: asyncHandler(async (req, res) => {
    const categories = await Category.find().populate("posts");
    
    res.json({ categories });
  }),

  // Check and fix posts without categories
  checkPostsWithoutCategories: asyncHandler(async (req, res) => {
    try {
      // Find posts without categories
      const postsWithoutCategories = await Post.find({ 
        $or: [
          { category: { $exists: false } },
          { category: null },
          { category: { $eq: "" } }
        ]
      }).populate("author", "username");
      
      // Get the first available category to assign
      const defaultCategory = await Category.findOne();
      
      if (postsWithoutCategories.length > 0 && defaultCategory) {
        // Update posts without categories
        await Post.updateMany(
          { 
            $or: [
              { category: { $exists: false } },
              { category: null },
              { category: { $eq: "" } }
            ]
          },
          { category: defaultCategory._id }
        );
        
        res.json({
          message: `Fixed ${postsWithoutCategories.length} posts without categories`,
          postsFixed: postsWithoutCategories.length,
          defaultCategory: defaultCategory.categoryName,
          posts: postsWithoutCategories
        });
      } else if (postsWithoutCategories.length > 0 && !defaultCategory) {
        res.json({
          message: `${postsWithoutCategories.length} posts found without categories, but no default category available`,
          postsWithoutCategories: postsWithoutCategories.length,
          posts: postsWithoutCategories
        });
      } else {
        res.json({
          message: "All posts have categories assigned",
          postsWithoutCategories: 0
        });
      }
    } catch (error) {
      console.error('Error checking posts without categories:', error);
      res.status(500).json({ 
        message: "Error checking posts without categories",
        error: error.message 
      });
    }
  }),

  // Create category
  createCategory: asyncHandler(async (req, res) => {
    const { categoryName, description } = req.body;
    
    const category = await Category.create({
      categoryName,
      description
    });
    
    // Notify all admins about category creation
    try {
      await AdminNotificationService.notifyCategoryAction(category, 'created', req.admin);
    } catch (error) {
      console.error('Error creating category creation notification:', error);
    }
    
    res.status(201).json({
      message: "Category created successfully",
      category
    });
  }),

  // Update category
  updateCategory: asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const updateData = req.body;
    
    const category = await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Notify all admins about category update
    try {
      await AdminNotificationService.notifyCategoryAction(category, 'updated', req.admin);
    } catch (error) {
      console.error('Error creating category update notification:', error);
    }
    
    res.json({
      message: "Category updated successfully",
      category
    });
  }),

  // Delete category
  deleteCategory: asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    
    // Check if any posts are using this category
    const postsWithCategory = await Post.countDocuments({ category: categoryId });
    if (postsWithCategory > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. ${postsWithCategory} posts are using this category.` 
      });
    }
    
    const category = await Category.findByIdAndDelete(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Notify all admins about category deletion
    try {
      await AdminNotificationService.notifyCategoryAction(category, 'deleted', req.admin);
    } catch (error) {
      console.error('Error creating category deletion notification:', error);
    }
    
    res.json({ message: "Category deleted successfully" });
  }),

  // ===== NOTIFICATION MANAGEMENT =====
  // Admin inbox: fetch notifications for current admin (stored in Notification with special admin identifier)
  fetchAdminNotifications: asyncHandler(async (req, res) => {
    try {
      // Find notifications where userId is the admin's ID and type indicates it's an admin notification
      // OR find notifications with a special admin identifier
      const notifications = await Notification.find({
        $or: [
          { userId: req.admin._id, type: { $in: ['admin', 'system', 'announcement'] } },
          { 'metadata.isAdminNotification': true, 'metadata.adminId': req.admin._id }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(50);
      
      console.log(`Found ${notifications.length} admin notifications for admin ${req.admin._id}`);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      res.status(500).json({ message: 'Error fetching admin notifications', error: error.message });
    }
  }),

  getAdminUnreadCount: asyncHandler(async (req, res) => {
    try {
      const count = await Notification.countDocuments({
        $or: [
          { userId: req.admin._id, isRead: false, type: { $in: ['admin', 'system', 'announcement'] } },
          { 'metadata.isAdminNotification': true, 'metadata.adminId': req.admin._id, isRead: false }
        ]
      });
      res.json({ unreadCount: count });
    } catch (error) {
      console.error('Error getting admin unread count:', error);
      res.status(500).json({ message: 'Error getting unread count', error: error.message });
    }
  }),

  markAllAdminNotificationsRead: asyncHandler(async (req, res) => {
    try {
      await Notification.updateMany({
        $or: [
          { userId: req.admin._id, isRead: false, type: { $in: ['admin', 'system', 'announcement'] } },
          { 'metadata.isAdminNotification': true, 'metadata.adminId': req.admin._id, isRead: false }
        ]
      }, { isRead: true });
      res.json({ message: 'All admin notifications marked as read' });
    } catch (error) {
      console.error('Error marking admin notifications as read:', error);
      res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
    }
  }),

  readAdminNotification: asyncHandler(async (req, res) => {
    try {
      const { notificationId } = req.params;
      const result = await Notification.findOneAndUpdate({
        _id: notificationId,
        $or: [
          { userId: req.admin._id, type: { $in: ['admin', 'system', 'announcement'] } },
          { 'metadata.isAdminNotification': true, 'metadata.adminId': req.admin._id }
        ]
      }, { isRead: true });
      
      if (!result) {
        return res.status(404).json({ message: 'Admin notification not found' });
      }
      
      res.json({ message: 'Admin notification marked as read' });
    } catch (error) {
      console.error('Error reading admin notification:', error);
      res.status(500).json({ message: 'Error reading notification', error: error.message });
    }
  }),

  deleteAdminNotification: asyncHandler(async (req, res) => {
    try {
      const { notificationId } = req.params;
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        $or: [
          { userId: req.admin._id, type: { $in: ['admin', 'system', 'announcement'] } },
          { 'metadata.isAdminNotification': true, 'metadata.adminId': req.admin._id }
        ]
      });
      
      if (!result) {
        return res.status(404).json({ message: 'Admin notification not found' });
      }
      
      res.json({ message: 'Admin notification deleted successfully' });
    } catch (error) {
      console.error('Error deleting admin notification:', error);
      res.status(500).json({ message: 'Error deleting notification', error: error.message });
    }
  }),

  deleteAllAdminNotifications: asyncHandler(async (req, res) => {
    try {
      const result = await Notification.deleteMany({
        $or: [
          { userId: req.admin._id, type: { $in: ['admin', 'system', 'announcement'] } },
          { 'metadata.isAdminNotification': true, 'metadata.adminId': req.admin._id }
        ]
      });
      res.json({ message: `All admin notifications deleted successfully. Deleted ${result.deletedCount} notifications.` });
    } catch (error) {
      console.error('Error deleting all admin notifications:', error);
      res.status(500).json({ message: 'Error deleting notifications', error: error.message });
    }
  }),
  
  // Send notification to user
  sendNotification: asyncHandler(async (req, res) => {
    try {
      const { userId } = req.params;
      const { title, message, type, priority, isDirectMessage } = req.body;
      
      // Validate userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          message: "Invalid user ID format",
          error: "userId must be a valid ObjectId"
        });
      }
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          error: "User with the provided ID does not exist"
        });
      }
      
      // Create user notification
      const userNotification = await Notification.create({
        userId: userId,
        title: title || "Admin Notification",
        message,
        type: type || "admin",
        priority: priority || "normal",
        metadata: {
          isAdminNotification: true,
          adminId: req.admin._id,
          adminUsername: req.admin.username,
          adminRole: req.admin.role,
          action: isDirectMessage ? 'direct_admin_message' : 'admin_notification',
          targetType: 'user',
          targetId: userId,
          targetUsername: user.username,
          additionalData: {
            isDirectMessage: Boolean(isDirectMessage),
            messagePriority: priority || "normal",
            messageDate: new Date()
          }
        }
      });
      
      // Create admin notification to track the sent message
      const adminNotification = await Notification.create({
        userId: req.admin._id,
        title: `Message Sent to ${user.username}`,
        message: `You sent a message to user ${user.username}: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`,
        type: 'admin_message_sent',
        priority: priority || "normal",
        metadata: {
          isAdminNotification: true,
          adminId: req.admin._id,
          action: 'admin_message_sent',
          targetType: 'user',
          targetId: userId,
          targetUsername: user.username,
          actorId: req.admin._id,
          actorName: req.admin.username,
          additionalData: {
            originalMessage: message,
            originalTitle: title,
            messageType: type || "admin",
            messagePriority: priority || "normal",
            messageDate: new Date(),
            recipientUsername: user.username,
            recipientEmail: user.email
          }
        }
      });
      
      console.log(`✅ Admin ${req.admin.username} sent message to user ${user.username}`);
      console.log(`✅ Created user notification: ${userNotification._id}`);
      console.log(`✅ Created admin tracking notification: ${adminNotification._id}`);
      
      res.status(201).json({
        message: "Notification sent successfully",
        notification: userNotification,
        adminTracking: adminNotification,
        recipient: {
          username: user.username,
          email: user.email,
          userId: user._id
        }
      });
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      res.status(500).json({ 
        message: 'Error sending notification', 
        error: error.message 
      });
    }
  }),

  // Create a system notification for admins
  createAdminSystemNotification: asyncHandler(async (req, res) => {
    try {
      const { title, message, type = 'system', priority = 'medium' } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({
          message: "Missing required fields",
          error: "Title and message are required"
        });
      }
      
      // Create notification for all admins
      const admins = await Admin.find({ isActive: true });
      const notifications = [];
      
      for (const admin of admins) {
        const notification = await Notification.create({
          userId: admin._id, // Use admin's ID as userId
          title,
          message,
          type,
          priority,
          metadata: {
            isAdminNotification: true,
            adminId: admin._id,
            action: 'system_notification',
            targetType: 'admin'
          }
        });
        notifications.push(notification);
      }
      
      res.status(201).json({
        message: `System notification sent to ${notifications.length} admins`,
        notifications
      });
    } catch (error) {
      console.error('Error creating admin system notification:', error);
      res.status(500).json({ message: 'Error creating system notification', error: error.message });
    }
  }),

  // Send notification to all users
  sendNotificationToAll: asyncHandler(async (req, res) => {
    try {
      const { title, message, type } = req.body;
      
      // Validate required fields
      if (!title || !message) {
        return res.status(400).json({
          message: "Missing required fields",
          error: "Title and message are required"
        });
      }
      
      // Check if admin is authenticated
      if (!req.admin) {
        console.error('❌ No admin found in request');
        return res.status(401).json({
          message: "Admin authentication required",
          error: "No admin found in request"
        });
      }
      
      // Find all users except admins (to avoid sending notifications to other admins)
      const users = await User.find({ 
        role: { $ne: "admin" },
        isBanned: false // Don't send to banned users
      }).select('_id username email role isBanned');
      
      console.log(`🔍 Found ${users.length} users to send notifications to:`, users.map(u => ({ username: u.username, _id: u._id, role: u.role })));
      
      if (users.length === 0) {
        return res.status(400).json({
          message: "No users found to send notifications to",
          count: 0
        });
      }
      
      const notifications = [];
      let successCount = 0;
      let errorCount = 0;
      
      for (const user of users) {
        try {
          console.log(`📝 Processing user: ${user.username} with ID: ${user._id}`);
          
          // Ensure _id is a valid ObjectId
          if (!user._id || !mongoose.Types.ObjectId.isValid(user._id)) {
            console.error(`❌ Invalid ObjectId for user ${user.username}: ${user._id}`);
            errorCount++;
            continue;
          }
          
          const notificationData = {
            userId: user._id,
            title: title || "Admin Notification",
            message: message || "No message provided",
            type: type || "admin",
            priority: "high",
            metadata: {
              actorId: req.admin._id,
              actorName: req.admin.username,
              actorEmail: req.admin.email,
              action: "sent a broadcast notification",
              targetType: "system",
              additionalData: {
                adminContact: {
                  username: req.admin.username,
                  email: req.admin.email,
                  role: req.admin.role
                }
              }
            }
          };
          
          console.log(`📤 Creating notification for user ${user.username}:`, notificationData);
          const notification = await Notification.create(notificationData);
          console.log(`✅ Notification created successfully for ${user.username}:`, notification._id);
          notifications.push(notification);
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to create notification for user ${user.username}:`, error);
          errorCount++;
        }
      }
      
      if (successCount === 0) {
        return res.status(500).json({
          message: "Failed to create any notifications",
          error: "All notification creation attempts failed",
          details: {
            successful: 0,
            failed: errorCount,
            totalProcessed: users.length
          }
        });
      }
      
      // Create admin tracking notification for broadcast
      try {
        const adminTrackingNotification = await Notification.create({
          userId: req.admin._id,
          title: `Broadcast Sent to ${successCount} Users`,
          message: `You sent a broadcast notification to ${successCount} users: "${title}" - "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`,
          type: 'admin_broadcast_sent',
          priority: "high",
          metadata: {
            isAdminNotification: true,
            adminId: req.admin._id,
            action: 'admin_broadcast_sent',
            targetType: 'system',
            actorId: req.admin._id,
            actorName: req.admin.username,
            additionalData: {
              broadcastTitle: title,
              broadcastMessage: message,
              broadcastType: type || "admin",
              recipientCount: successCount,
              totalUsers: users.length,
              failedCount: errorCount,
              broadcastDate: new Date()
            }
          }
        });
        
        console.log(`✅ Created admin tracking notification for broadcast: ${adminTrackingNotification._id}`);
      } catch (trackingError) {
        console.error('❌ Failed to create admin tracking notification:', trackingError);
        // Don't fail the whole request if tracking fails
      }
      
      res.status(201).json({
        message: `Notification sent to ${notifications.length} users successfully`,
        count: notifications.length,
        totalUsers: users.length,
        successCount,
        errorCount,
        details: {
          successful: notifications.length,
          failed: errorCount,
          totalProcessed: users.length
        }
      });
    } catch (error) {
      console.error('❌ Error in sendNotificationToAll:', error);
      res.status(500).json({
        message: "Failed to send broadcast notification",
        error: error.message
      });
    }
  }),

  // ===== ADMIN MANAGEMENT =====
  
  // Get all admin users with their emails (from Admin collection)
  getAdminUsers: asyncHandler(async (req, res) => {
    try {
      const adminUsers = await Admin.find({ isActive: true })
        .select('username email role createdAt profile')
        .sort({ createdAt: -1 });
      
      const adminUsersWithEmails = adminUsers.map(admin => {
        return {
          ...admin.toObject(),
          email: admin.email,
          role: admin.role,
          profile: admin.profile || {}
        };
      });
      
      res.json({
        success: true,
        adminUsers: adminUsersWithEmails,
        count: adminUsersWithEmails.length
      });
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch admin users",
        error: error.message
      });
    }
  }),

  // Update admin profile and contact info
  updateAdminProfile: asyncHandler(async (req, res) => {
    try {
      const { firstName, lastName, bio, contactInfo } = req.body;
      
      const admin = await Admin.findByIdAndUpdate(
        req.admin._id,
        {
          'profile.firstName': firstName,
          'profile.lastName': lastName,
          'profile.bio': bio,
          'profile.contactInfo': contactInfo
        },
        { new: true }
      ).select('-password');
      
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      
      res.json({
        message: "Admin profile updated successfully",
        admin: {
          username: admin.username,
          email: admin.email,
          role: admin.role,
          profile: admin.profile
        }
      });
    } catch (error) {
      console.error('Error updating admin profile:', error);
      res.status(500).json({
        message: "Failed to update admin profile",
        error: error.message
      });
    }
  }),

  // Get admin profile
  getAdminProfile: asyncHandler(async (req, res) => {
    try {
      const admin = await Admin.findById(req.admin._id)
        .select('-password');
      
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      
      res.json({
        success: true,
        admin: {
          username: admin.username,
          email: admin.email,
          role: admin.role,
          profile: admin.profile,
          createdAt: admin.createdAt
        }
      });
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch admin profile",
        error: error.message
      });
    }
  }),

  // Delete admin account
  deleteAdminAccount: asyncHandler(async (req, res) => {
    try {
      const { password } = req.body;
      const adminId = req.admin._id; // req.admin is the full admin object from middleware

      // Find the admin
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Verify password
      const bcrypt = require("bcryptjs");
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" });
      }

      // Check if this is the last admin
      const totalAdmins = await Admin.countDocuments();
      if (totalAdmins <= 1) {
        return res.status(400).json({ 
          message: "Cannot delete the last admin account. At least one admin must remain." 
        });
      }

      // Delete admin's notifications
      await Notification.deleteMany({ userId: adminId });

      // Delete the admin account
      await Admin.findByIdAndDelete(adminId);

      // Clear cookies (use the correct cookie name 'adminToken')
      res.clearCookie("adminToken");

      res.json({
        success: true,
        message: "Admin account deleted successfully. Your posts will remain on the platform.",
      });
    } catch (error) {
      console.error('Error deleting admin account:', error);
      res.status(500).json({
        success: false,
        message: "Failed to delete admin account",
        error: error.message
      });
    }
  }),

  // ===== SYSTEM SETTINGS =====
  
  // Get system statistics
  getSystemStats: asyncHandler(async (req, res) => {
    const stats = {
      users: {
        total: await User.countDocuments(),
        active: await User.countDocuments({ isBanned: false }),
        banned: await User.countDocuments({ isBanned: true }),
        verified: await User.countDocuments({ isEmailVerified: true }),
        unverified: await User.countDocuments({ isEmailVerified: false })
      },
      content: {
        posts: await Post.countDocuments(),
        comments: await Comment.countDocuments(),
        categories: await Category.countDocuments()
      },
      plans: {
        total: await Plan.countDocuments(),
        active: await Plan.countDocuments({ isActive: true }),
        inactive: await Plan.countDocuments({ isActive: false })
      },
      // Earnings functionality removed
    };
    
    res.json({ stats });
  }),

  // Get real activity feed data
  getActivityFeed: asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    
    try {
      // Get recent user registrations
      const recentUsers = await User.find({})
        .select('username createdAt role')
        .sort({ createdAt: -1 })
        .limit(5);
      
      // Get recent posts
      const recentPosts = await Post.find({})
        .populate('author', 'username')
        .select('title createdAt author')
        .sort({ createdAt: -1 })
        .limit(5);
      
      // Get recent comments
      const recentComments = await Comment.find({})
        .populate('author', 'username')
        .populate('post', 'title')
        .select('content createdAt author post')
        .sort({ createdAt: -1 })
        .limit(5);
      
      // Get recent plan changes
      const recentPlanChanges = await User.find({ 'plan': { $exists: true, $ne: null } })
        .populate('plan', 'planName tier')
        .select('username plan updatedAt')
        .sort({ updatedAt: -1 })
        .limit(3);
      
      // Combine and format activities
      const activities = [];
      
      // Add user registrations
      recentUsers.forEach(user => {
        activities.push({
          id: `user_${user._id}`,
          type: 'user',
          message: `New user registered: ${user.username}`,
          time: user.createdAt,
          icon: 'FaUsers',
          color: 'text-blue-500',
          data: user
        });
      });
      
      // Add new posts
      recentPosts.forEach(post => {
        activities.push({
          id: `post_${post._id}`,
          type: 'post',
          message: `New post published: "${post.title}"`,
          time: post.createdAt,
          icon: 'FaFileAlt',
          color: 'text-green-500',
          data: post
        });
      });
      
      // Add new comments
      recentComments.forEach(comment => {
        activities.push({
          id: `comment_${comment._id}`,
          type: 'comment',
          message: `New comment on "${comment.post?.title || 'post'}"`,
          time: comment.createdAt,
          icon: 'FaComments',
          color: 'text-orange-500',
          data: comment
        });
      });
      
      // Add plan changes
      recentPlanChanges.forEach(user => {
        if (user.plan) {
          activities.push({
            id: `plan_${user._id}`,
            type: 'plan',
            message: `User ${user.username} has ${user.plan.planName} plan`,
            time: user.updatedAt,
            icon: 'FaCrown',
            color: 'text-purple-500',
            data: user
          });
        }
      });
      
      // Sort by time and limit
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      const limitedActivities = activities.slice(0, limit);
      
      res.json({
        activities: limitedActivities,
        total: activities.length
      });
      
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      res.status(500).json({
        message: 'Error fetching activity feed',
        error: error.message
      });
    }
  }),

  // Get system settings
  getSystemSettings: asyncHandler(async (req, res) => {
    // In a real application, you'd store these in a database
    // For now, we'll return default settings
    const settings = {
      siteName: process.env.SITE_NAME || 'WisdomShare',
      siteDescription: process.env.SITE_DESCRIPTION || 'Share your wisdom with the world',
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true' || false,
      registrationEnabled: process.env.REGISTRATION_ENABLED !== 'false',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5,
      allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif').split(','),
      defaultUserRole: process.env.DEFAULT_USER_ROLE || 'user',
      maxPostsPerUser: parseInt(process.env.MAX_POSTS_PER_USER) || 100,
      maxCommentsPerPost: parseInt(process.env.MAX_COMMENTS_PER_POST) || 50,
      autoModerationEnabled: process.env.AUTO_MODERATION_ENABLED === 'true' || false,
      notificationSettings: {
        emailNotifications: process.env.EMAIL_NOTIFICATIONS !== 'false',
        pushNotifications: process.env.PUSH_NOTIFICATIONS !== 'false',
        adminNotifications: process.env.ADMIN_NOTIFICATIONS !== 'false'
      }
    };
    
    res.json({ settings });
  }),

  // Update system settings
  updateSystemSettings: asyncHandler(async (req, res) => {
    const settings = req.body;
    
    // In a real application, you'd save these to a database
    // For now, we'll just validate and return success
    const validSettings = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      maintenanceMode: Boolean(settings.maintenanceMode),
      registrationEnabled: Boolean(settings.registrationEnabled),
      maxFileSize: Math.max(1, Math.min(50, parseInt(settings.maxFileSize) || 5)),
      allowedFileTypes: Array.isArray(settings.allowedFileTypes) ? settings.allowedFileTypes : ['jpg', 'jpeg', 'png', 'gif'],
      defaultUserRole: ['user', 'moderator'].includes(settings.defaultUserRole) ? settings.defaultUserRole : 'user',
      maxPostsPerUser: Math.max(1, Math.min(1000, parseInt(settings.maxPostsPerUser) || 100)),
      maxCommentsPerPost: Math.max(1, Math.min(500, parseInt(settings.maxCommentsPerPost) || 50)),
      autoModerationEnabled: Boolean(settings.autoModerationEnabled),
      notificationSettings: {
        emailNotifications: Boolean(settings.notificationSettings?.emailNotifications),
        pushNotifications: Boolean(settings.notificationSettings?.pushNotifications),
        adminNotifications: Boolean(settings.notificationSettings?.adminNotifications)
      }
    };
    
    // Here you would save to database or environment variables
    // For now, we'll just return success
    
    res.json({
      message: 'System settings updated successfully',
      settings: validSettings
    });
  }),

  // Toggle maintenance mode
  toggleMaintenanceMode: asyncHandler(async (req, res) => {
    const { maintenanceMode } = req.body;
    
    // In a real application, you'd save this to a database
    // For now, we'll just return success
    
    res.json({
      message: `Maintenance mode ${maintenanceMode ? 'enabled' : 'disabled'} successfully`,
      maintenanceMode: Boolean(maintenanceMode)
    });
  }),

  // Get system logs
  getSystemLogs: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const level = req.query.level || '';
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';
    
    // In a real application, you'd have a logs collection
    // For now, we'll return mock data
    const mockLogs = [
      {
        id: 1,
        timestamp: new Date(),
        level: 'info',
        message: 'System started successfully',
        user: 'system',
        ip: '127.0.0.1'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 3600000),
        level: 'warn',
        message: 'High memory usage detected',
        user: 'system',
        ip: '127.0.0.1'
      }
    ];
    
    res.json({
      logs: mockLogs,
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalLogs: mockLogs.length,
        hasNext: false,
        hasPrev: false
      }
    });
  }),

  // Custom admin notification
  notifyCustomAdminMessage: asyncHandler(async (req, res) => {
    try {
      const { title, message, type, priority } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({
          message: "Missing required fields",
          error: "Title and message are required"
        });
      }
      
      // Use the notification service
      await AdminNotificationService.notifyCustomAdminMessage(req.admin, {
        title,
        message,
        type,
        priority
      });
      
      res.status(201).json({
        message: "Custom admin notification sent successfully"
      });
    } catch (error) {
      console.error('Error creating custom admin notification:', error);
      res.status(500).json({ message: 'Error creating custom notification', error: error.message });
    }
  }),

  // Send direct message from admin to user with enhanced tracking
  sendDirectMessage: asyncHandler(async (req, res) => {
    try {
      const { userId, message, priority, messageType } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({
          message: "Missing required fields",
          error: "User ID and message are required"
        });
      }
      
      // Validate userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          message: "Invalid user ID format",
          error: "userId must be a valid ObjectId"
        });
      }
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          error: "User with the provided ID does not exist"
        });
      }
      
      // Create user notification (the actual message)
      const userNotification = await Notification.create({
        userId: userId,
        title: `Message from Admin ${req.admin.username}`,
        message,
        type: 'admin_direct_message',
        priority: priority || "normal",
        metadata: {
          isAdminNotification: true,
          adminId: req.admin._id,
          adminUsername: req.admin.username,
          adminRole: req.admin.role,
          adminEmail: req.admin.email,
          action: 'direct_admin_message',
          targetType: 'user',
          targetId: userId,
          targetUsername: user.username,
          targetEmail: user.email,
          additionalData: {
            messageType: messageType || 'personal',
            messagePriority: priority || "normal",
            messageDate: new Date(),
            isDirectMessage: true,
            adminContact: {
              username: req.admin.username,
              email: req.admin.email,
              role: req.admin.role
            }
          }
        }
      });
      
      // Create admin tracking notification
      const adminTrackingNotification = await Notification.create({
        userId: req.admin._id,
        title: `Direct Message Sent to ${user.username}`,
        message: `You sent a direct message to ${user.username}: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`,
        type: 'admin_direct_message_sent',
        priority: priority || "normal",
        metadata: {
          isAdminNotification: true,
          adminId: req.admin._id,
          action: 'admin_direct_message_sent',
          targetType: 'user',
          targetId: userId,
          targetUsername: user.username,
          targetEmail: user.email,
          actorId: req.admin._id,
          actorName: req.admin.username,
          additionalData: {
            originalMessage: message,
            messageType: messageType || 'personal',
            messagePriority: priority || "normal",
            messageDate: new Date(),
            recipientUsername: user.username,
            recipientEmail: user.email,
            messageLength: message.length
          }
        }
      });
      
      console.log(`✅ Admin ${req.admin.username} sent direct message to user ${user.username}`);
      console.log(`✅ Created user notification: ${userNotification._id}`);
      console.log(`✅ Created admin tracking notification: ${adminTrackingNotification._id}`);
      
      res.status(201).json({
        message: "Direct message sent successfully",
        userNotification,
        adminTracking: adminTrackingNotification,
        recipient: {
          username: user.username,
          email: user.email,
          userId: user._id
        },
        messageDetails: {
          type: messageType || 'personal',
          priority: priority || "normal",
          length: message.length,
          sentAt: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Error sending direct message:', error);
      res.status(500).json({ 
        message: 'Error sending direct message', 
        error: error.message 
      });
    }
  })
};

module.exports = adminController;




