require('dotenv').config();
const User = require("../models/User/User");
const connectDB = require("./connectDB");

const checkAdminUsers = async () => {
  try {
    await connectDB();
    
    console.log("🔍 Checking for admin users...");
    
    // Find all admin users
    const adminUsers = await User.find({ role: { $in: ["admin", "moderator"] } });
    
    if (adminUsers.length === 0) {
      console.log("❌ No admin users found in database");
      console.log("💡 Run: npm run create:admin your-email@example.com");
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. Admin User:`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Email Verified: ${user.isEmailVerified ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.createdAt}`);
      });
    }
    
    // Also check for any users with admin role
    const allUsers = await User.find({}).select('username email role isEmailVerified');
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking admin users:", error);
    process.exit(1);
  }
};

// Run the script if called directly
if (require.main === module) {
  checkAdminUsers();
}

module.exports = checkAdminUsers;




