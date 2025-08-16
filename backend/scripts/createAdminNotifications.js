const mongoose = require('mongoose');
const Notification = require('../models/Notification/Notification');
const Admin = require('../models/Admin/Admin');
require('dotenv').config();

const createSampleAdminNotifications = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to database');

    // Find an admin user
    const admin = await Admin.findOne({ isActive: true });
    if (!admin) {
      console.log('❌ No active admin found');
      return;
    }

    console.log(`✅ Found admin: ${admin.username} (${admin._id})`);

    // Create sample notifications
    const sampleNotifications = [
      {
        userId: admin._id,
        title: 'Welcome to Admin Panel',
        message: 'Welcome to the admin panel! You can now manage users, posts, and system settings.',
        type: 'system',
        priority: 'medium',
        metadata: {
          isAdminNotification: true,
          adminId: admin._id,
          action: 'welcome',
          targetType: 'admin'
        }
      },
      {
        userId: admin._id,
        title: 'System Update Available',
        message: 'A new system update is available. Please review the changelog and apply when convenient.',
        type: 'update',
        priority: 'low',
        metadata: {
          isAdminNotification: true,
          adminId: admin._id,
          action: 'system_update',
          targetType: 'admin'
        }
      },
      {
        userId: admin._id,
        title: 'New User Registration',
        message: 'A new user has registered and requires verification. Please review their account.',
        type: 'admin',
        priority: 'medium',
        metadata: {
          isAdminNotification: true,
          adminId: admin._id,
          action: 'user_registration',
          targetType: 'admin'
        }
      },
      {
        userId: admin._id,
        title: 'Post Moderation Required',
        message: 'There are 5 posts pending moderation. Please review them as soon as possible.',
        type: 'admin',
        priority: 'high',
        metadata: {
          isAdminNotification: true,
          adminId: admin._id,
          action: 'post_moderation',
          targetType: 'admin'
        }
      }
    ];

    // Clear existing admin notifications
    await Notification.deleteMany({
      $or: [
        { userId: admin._id, type: { $in: ['admin', 'system', 'update', 'announcement'] } },
        { 'metadata.isAdminNotification': true, 'metadata.adminId': admin._id }
      ]
    });
    console.log('✅ Cleared existing admin notifications');

    // Create new notifications
    const createdNotifications = await Notification.insertMany(sampleNotifications);
    console.log(`✅ Created ${createdNotifications.length} sample admin notifications`);

    // Verify notifications were created
    const count = await Notification.countDocuments({
      $or: [
        { userId: admin._id, type: { $in: ['admin', 'system', 'update', 'announcement'] } },
        { 'metadata.isAdminNotification': true, 'metadata.adminId': admin._id }
      ]
    });
    console.log(`✅ Total admin notifications in database: ${count}`);

    console.log('✅ Sample admin notifications created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample admin notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from database');
  }
};

// Run the script
createSampleAdminNotifications();
