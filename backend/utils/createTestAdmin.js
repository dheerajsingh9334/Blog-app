require('dotenv').config();
const bcrypt = require("bcryptjs");
const User = require("../models/User/User");
const Plan = require("../models/Plan/Plan");
const connectDB = require("./connectDB");

const createTestAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("✅ Admin user already exists:");
      console.log("Username:", existingAdmin.username);
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);
      console.log("Email Verified:", existingAdmin.isEmailVerified);
      process.exit(0);
    }

    // Get the free plan
    const freePlan = await Plan.findOne({ tier: "free", isActive: true });
    if (!freePlan) {
      console.error("❌ Free plan not found. Please create a free plan first.");
      process.exit(1);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Create admin user WITHOUT email verification (for testing)
    const adminUser = await User.create({
      username: "admin",
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin",
      plan: freePlan._id,
      hasSelectedPlan: true,
      isEmailVerified: true, // Skip email verification for testing
    });

    console.log("✅ Test Admin user created successfully:");
    console.log("Username:", adminUser.username);
    console.log("Email:", adminUser.email);
    console.log("Password: admin123");
    console.log("Role:", adminUser.role);
    console.log("Email Verified: Yes (for testing)");
    console.log("\n🔑 Login with:");
    console.log("Email: admin@test.com");
    console.log("Password: admin123");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating test admin user:", error);
    process.exit(1);
  }
};

// Run the script if called directly
if (require.main === module) {
  createTestAdmin();
}

module.exports = createTestAdmin;




