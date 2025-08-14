const mongoose = require('mongoose');
const User = require('../models/User/User');
const Admin = require('../models/Admin/Admin');
require('dotenv').config();

const cleanupAdminUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to database');

    // Find all users with admin role
    const adminUsers = await User.find({ role: { $in: ['admin', 'moderator'] } });
    console.log(`📊 Found ${adminUsers.length} admin/moderator users in User collection`);

    if (adminUsers.length === 0) {
      console.log('✅ No admin users found in User collection');
      return;
    }

    // Check if these users exist in Admin collection
    for (const user of adminUsers) {
      console.log(`\n👤 Processing user: ${user.username} (${user.email}) - Role: ${user.role}`);
      
      // Check if admin exists in Admin collection
      const existingAdmin = await Admin.findOne({ 
        $or: [
          { email: user.email },
          { username: user.username }
        ]
      });

      if (existingAdmin) {
        console.log(`   ✅ Admin already exists in Admin collection: ${existingAdmin.username}`);
        console.log(`   🗑️  Removing from User collection...`);
        
        // Remove from User collection
        await User.findByIdAndDelete(user._id);
        console.log(`   ✅ Removed from User collection`);
      } else {
        console.log(`   ⚠️  Admin not found in Admin collection - needs manual review`);
        console.log(`   📝 User details:`, {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        });
      }
    }

    // Verify cleanup
    const remainingAdminUsers = await User.find({ role: { $in: ['admin', 'moderator'] } });
    console.log(`\n📊 Cleanup complete. Remaining admin users in User collection: ${remainingAdminUsers.length}`);

    if (remainingAdminUsers.length > 0) {
      console.log('⚠️  Remaining admin users that need manual review:');
      remainingAdminUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - Role: ${user.role}`);
      });
    }

    console.log('\n✅ Cleanup script completed');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the cleanup
cleanupAdminUsers();

