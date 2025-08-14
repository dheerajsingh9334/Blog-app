const express = require("express");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const notificationController = require("../../controllers/notifications/notificationController");

const notificationRouter = express.Router();

//-----lists----
notificationRouter.get("/", isAuthenticated, notificationController.fetchNotifications);

//----read notification ----
notificationRouter.put(
  "/:notificationId",
  isAuthenticated,
  notificationController.readNofictaion
);

//----mark all as read ----
notificationRouter.put("/mark-all-read", isAuthenticated, notificationController.markAllAsRead);

//----get unread count ----
notificationRouter.get("/unread-count", isAuthenticated, notificationController.getUnreadCount);

//----delete a specific notification ----
notificationRouter.delete("/:notificationId", isAuthenticated, notificationController.deleteNotification);

//----delete all notifications ----
notificationRouter.delete("/", isAuthenticated, notificationController.deleteAllNotifications);

module.exports = notificationRouter;
