const Notification = require("../models/Notification/Notification");
const Admin = require("../models/Admin/Admin");

class AdminNotificationService {
  // Create notification for all admins
  static async notifyAllAdmins(notificationData) {
    try {
      const admins = await Admin.find({ isActive: true });
      const notifications = [];

      for (const admin of admins) {
        const notification = await Notification.create({
          userId: admin._id,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || 'admin',
          priority: notificationData.priority || 'medium',
          metadata: {
            isAdminNotification: true,
            adminId: admin._id,
            action: notificationData.action,
            targetType: notificationData.targetType,
            targetId: notificationData.targetId,
            actorId: notificationData.actorId,
            actorName: notificationData.actorName,
            additionalData: notificationData.additionalData || {}
          }
        });
        notifications.push(notification);
      }

      console.log(`✅ Admin notification sent to ${notifications.length} admins: ${notificationData.title}`);
      return notifications;
    } catch (error) {
      console.error('❌ Error creating admin notifications:', error);
      throw error;
    }
  }

  // New user registration notification
  static async notifyNewUserRegistration(userData) {
    await this.notifyAllAdmins({
      title: 'New User Registration',
      message: `New user "${userData.username}" (${userData.email}) has registered and requires verification.`,
      type: 'admin',
      priority: 'medium',
      action: 'user_registration',
      targetType: 'user',
      targetId: userData._id,
      actorId: userData._id,
      actorName: userData.username,
      additionalData: {
        userEmail: userData.email,
        registrationDate: userData.createdAt,
        userRole: userData.role
      }
    });
  }

  // New post creation notification
  static async notifyNewPost(postData, authorData) {
    await this.notifyAllAdmins({
      title: 'New Post Created',
      message: `User "${authorData.username}" has created a new post: "${postData.title}"`,
      type: 'admin',
      priority: 'low',
      action: 'post_created',
      targetType: 'post',
      targetId: postData._id,
      actorId: authorData._id,
      actorName: authorData.username,
      additionalData: {
        postTitle: postData.title,
        postStatus: postData.status,
        postCategory: postData.category,
        authorEmail: authorData.email,
        postContent: postData.content?.substring(0, 100) + '...'
      }
    });
  }

  // New admin registration notification
  static async notifyNewAdminRegistration(adminData) {
    await this.notifyAllAdmins({
      title: 'New Admin Registration',
      message: `New admin "${adminData.username}" (${adminData.email}) has been registered.`,
      type: 'admin',
      priority: 'high',
      action: 'admin_registration',
      targetType: 'admin',
      targetId: adminData._id,
      actorId: adminData._id,
      actorName: adminData.username,
      additionalData: {
        adminEmail: adminData.email,
        adminRole: adminData.role,
        registrationDate: adminData.createdAt
      }
    });
  }

  // User deletion notification
  static async notifyUserDeletion(userData, adminData) {
    await this.notifyAllAdmins({
      title: 'User Deleted',
      message: `Admin "${adminData.username}" has deleted user "${userData.username}" (${userData.email})`,
      type: 'admin',
      priority: 'high',
      action: 'user_deleted',
      targetType: 'user',
      targetId: userData._id,
      actorId: adminData._id,
      actorName: adminData.username,
      additionalData: {
        deletedUserEmail: userData.email,
        deletedUserRole: userData.role,
        deletionDate: new Date(),
        deletedByAdmin: adminData.username
      }
    });
  }

  // User plan change notification
  static async notifyUserPlanChange(userData, oldPlan, newPlan, adminData) {
    await this.notifyAllAdmins({
      title: 'User Plan Changed',
      message: `Admin "${adminData.username}" has changed user "${userData.username}" plan from "${oldPlan?.planName || 'No Plan'}" to "${newPlan?.planName || 'No Plan'}"`,
      type: 'admin',
      priority: 'medium',
      action: 'user_plan_changed',
      targetType: 'user',
      targetId: userData._id,
      actorId: adminData._id,
      actorName: adminData.username,
      additionalData: {
        userEmail: userData.email,
        oldPlan: oldPlan?.planName || 'No Plan',
        newPlan: newPlan?.planName || 'No Plan',
        oldPlanTier: oldPlan?.tier || 'None',
        newPlanTier: newPlan?.tier || 'None',
        changeDate: new Date()
      }
    });
  }

  // Post deletion notification
  static async notifyPostDeletion(postData, authorData, adminData) {
    await this.notifyAllAdmins({
      title: 'Post Deleted',
      message: `Admin "${adminData.username}" has deleted post "${postData.title}" by user "${authorData.username}"`,
      type: 'admin',
      priority: 'medium',
      action: 'post_deleted',
      targetType: 'post',
      targetId: postData._id,
      actorId: adminData._id,
      actorName: adminData.username,
      additionalData: {
        postTitle: postData.title,
        authorUsername: authorData.username,
        authorEmail: authorData.email,
        postStatus: postData.status,
        deletionDate: new Date()
      }
    });
  }

  // User ban/unban notification
  static async notifyUserBanStatus(userData, isBanned, adminData, reason = '') {
    const action = isBanned ? 'user_banned' : 'user_unbanned';
    const title = isBanned ? 'User Banned' : 'User Unbanned';
    const message = isBanned 
      ? `Admin "${adminData.username}" has banned user "${userData.username}" (${userData.email})`
      : `Admin "${adminData.username}" has unbanned user "${userData.username}" (${userData.email})`;

    await this.notifyAllAdmins({
      title,
      message: reason ? `${message}. Reason: ${reason}` : message,
      type: 'admin',
      priority: 'high',
      action,
      targetType: 'user',
      targetId: userData._id,
      actorId: adminData._id,
      actorName: adminData.username,
      additionalData: {
        userEmail: userData.email,
        userRole: userData.role,
        banStatus: isBanned,
        reason: reason || 'No reason provided',
        actionDate: new Date()
      }
    });
  }

  // Comment deletion notification
  static async notifyCommentDeletion(commentData, authorData, adminData) {
    await this.notifyAllAdmins({
      title: 'Comment Deleted',
      message: `Admin "${adminData.username}" has deleted a comment by user "${authorData.username}"`,
      type: 'admin',
      priority: 'low',
      action: 'comment_deleted',
      targetType: 'comment',
      targetId: commentData._id,
      actorId: adminData._id,
      actorName: adminData.username,
      additionalData: {
        commentContent: commentData.content?.substring(0, 100) + '...',
        authorUsername: authorData.username,
        authorEmail: authorData.email,
        postId: commentData.postId,
        deletionDate: new Date()
      }
    });
  }

  // Category creation/modification notification
  static async notifyCategoryAction(categoryData, action, adminData) {
    const actionText = action === 'created' ? 'created' : action === 'updated' ? 'updated' : 'deleted';
    const title = `Category ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`;
    const message = `Admin "${adminData.username}" has ${actionText} category "${categoryData.name}"`;

    await this.notifyAllAdmins({
      title,
      message,
      type: 'admin',
      priority: 'low',
      action: `category_${action}`,
      targetType: 'category',
      targetId: categoryData._id,
      actorId: adminData._id,
      actorName: adminData.username,
      additionalData: {
        categoryName: categoryData.name,
        categoryDescription: categoryData.description,
        actionDate: new Date()
      }
    });
  }

  // Plan creation/modification notification
  static async notifyPlanAction(planData, action, adminData) {
    const actionText = action === 'created' ? 'created' : action === 'updated' ? 'updated' : 'deleted';
    const title = `Plan ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`;
    const message = `Admin "${adminData.username}" has ${actionText} plan "${planData.planName}" (${planData.tier})`;

    await this.notifyAllAdmins({
      title,
      message,
      type: 'admin',
      priority: 'medium',
      action: `plan_${action}`,
      targetType: 'plan',
      targetId: planData._id,
      actorId: adminData._id,
      actorName: adminData.username,
      additionalData: {
        planName: planData.planName,
        planTier: planData.tier,
        planPrice: planData.price,
        actionDate: new Date()
      }
    });
  }

  // System maintenance notification
  static async notifySystemMaintenance(maintenanceData, adminData) {
    await this.notifyAllAdmins({
      title: 'System Maintenance',
      message: `Admin "${adminData.username}" has ${maintenanceData.isMaintenanceMode ? 'enabled' : 'disabled'} system maintenance mode`,
      type: 'system',
      priority: 'high',
      action: 'system_maintenance',
      targetType: 'system',
      actorId: adminData._id,
      actorName: adminData.username,
      additionalData: {
        maintenanceMode: maintenanceData.isMaintenanceMode,
        maintenanceMessage: maintenanceData.maintenanceMessage || 'No message provided',
        actionDate: new Date()
      }
    });
  }

  // Admin login notification (for security)
  static async notifyAdminLogin(adminData, loginData = {}) {
    await this.notifyAllAdmins({
      title: 'Admin Login',
      message: `Admin "${adminData.username}" has logged in from ${loginData.ip || 'unknown location'}`,
      type: 'system',
      priority: 'low',
      action: 'admin_login',
      targetType: 'admin',
      targetId: adminData._id,
      actorId: adminData._id,
      actorName: adminData.username,
      additionalData: {
        loginIP: loginData.ip || 'Unknown',
        loginUserAgent: loginData.userAgent || 'Unknown',
        loginDate: new Date()
      }
    });
  }

  // Custom admin notification
  static async notifyCustomAdminMessage(adminData, messageData) {
    await this.notifyAllAdmins({
      title: messageData.title || 'Admin Message',
      message: messageData.message,
      type: messageData.type || 'admin',
      priority: messageData.priority || 'medium',
      action: 'custom_admin_message',
      targetType: 'system',
      actorId: adminData._id,
      actorName: adminData.username,
      additionalData: {
        customMessage: messageData.message,
        messageType: messageData.type || 'admin',
        messagePriority: messageData.priority || 'medium',
        messageDate: new Date()
      }
    });
  }
}

module.exports = AdminNotificationService;

