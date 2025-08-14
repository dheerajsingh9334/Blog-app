const asyncHandler = require("express-async-handler");
const Notification = require("../../models/Notification/Notification");
const mongoose = require("mongoose");

const notificationController = {
  //!list all notifications for the authenticated user
  fetchNotifications: asyncHandler(async (req, res) => {
    const userId = req.user;
    
    // Get notifications for the current user, sorted by most recent
    const notifications = await Notification.find({ userId })
      .populate('postId', 'title')
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications
    
    res.json(notifications);
  }),

  //! Read notification
  readNofictaion: asyncHandler(async (req, res) => {
    //get the notification id from params
    const notificationId = req.params.notificationId;
    const userId = req.user;
    
    //check if id is valid
    const isValidId = mongoose.Types.ObjectId.isValid(notificationId);
    if (!isValidId) {
      throw new Error("Invalid notification ID");
    }
    
    // Update - ensure user can only mark their own notifications as read
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );
    
    if (!notification) {
      throw new Error("Notification not found or unauthorized");
    }
    
    res.json({ message: "Notification marked as read" });
  }),

  //! Mark all notifications as read for the user
  markAllAsRead: asyncHandler(async (req, res) => {
    const userId = req.user;
    
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    
    res.json({ message: "All notifications marked as read" });
  }),

  //! Get unread notification count
  getUnreadCount: asyncHandler(async (req, res) => {
    const userId = req.user;
    
    const count = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });
    
    res.json({ unreadCount: count });
  }),

  //! Delete a specific notification
  deleteNotification: asyncHandler(async (req, res) => {
    const notificationId = req.params.notificationId;
    const userId = req.user;
    
    // Check if id is valid
    const isValidId = mongoose.Types.ObjectId.isValid(notificationId);
    if (!isValidId) {
      throw new Error("Invalid notification ID");
    }
    
    // Delete notification - ensure user can only delete their own notifications
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });
    
    if (!notification) {
      throw new Error("Notification not found or unauthorized");
    }
    
    res.json({ message: "Notification deleted successfully" });
  }),

  //! Delete all notifications for the user
  deleteAllNotifications: asyncHandler(async (req, res) => {
    const userId = req.user;
    
    await Notification.deleteMany({ userId });
    
    res.json({ message: "All notifications deleted successfully" });
  }),
};

module.exports = notificationController;
