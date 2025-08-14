const mongoose = require('mongoose');
const Admin = require('../models/Admin/Admin');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      return;
    }

    // Create admin account
    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      permissions: {
        userManagement: true,
        contentModeration: true,
        planManagement: true,
        systemSettings: true,
        analytics: true,
        notifications: true,
      }
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('Admin created successfully:', admin.email);
    console.log('Admin ID:', admin._id);
    console.log('Admin username:', admin.username);

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

createAdmin();
