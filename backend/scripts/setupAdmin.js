const mongoose = require('mongoose');
const Admin = require('../models/Admin/Admin');
require('dotenv').config();

const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@yourplatform.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Create default admin account
    const adminData = {
      username: 'admin',
      email: 'admin@yourplatform.com',
      password: 'Admin@2024Secure',
      role: 'admin',
      isActive: true,
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
        bio: 'Default system administrator account'
      },
      permissions: {
        userManagement: true,
        contentModeration: true,
        planManagement: true,
        systemSettings: true,
        analytics: true,
        notifications: true
      }
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('✅ Default admin account created successfully!');
    console.log('📋 Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Email: admin@yourplatform.com');
    console.log('   Password: Admin@2024Secure');
    console.log('');
    console.log('⚠️  IMPORTANT: Change these credentials immediately after first login!');

  } catch (error) {
    console.error('❌ Error setting up admin account:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the setup
setupAdmin();
