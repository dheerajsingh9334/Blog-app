const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin/Admin");
const connectDB = require("./connectDB");

const createAdminCollectionUser = async (email, username = "admin") => {
  try {
    await connectDB();
    
    console.log("🔧 Creating admin user in Admin collection...");
    console.log("Email:", email);
    console.log("Username:", username);
    console.log("");

    // Check if admin already exists in Admin collection
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("✅ Admin user already exists in Admin collection:");
      console.log("Username:", existingAdmin.username);
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);
      console.log("Is Active:", existingAdmin.isActive);
      process.exit(0);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("❌ Invalid email format. Please provide a valid email address.");
      process.exit(1);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Create admin user in Admin collection
    const adminUser = await Admin.create({
      username,
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
      permissions: {
        userManagement: true,
        contentModeration: true,
        planManagement: true,
        systemSettings: true,
        analytics: true,
        notifications: true
      }
    });

    console.log("✅ Admin user created successfully in Admin collection:");
    console.log("Username:", adminUser.username);
    console.log("Email:", adminUser.email);
    console.log("Password: admin123");
    console.log("Role:", adminUser.role);
    console.log("Is Active:", adminUser.isActive);
    console.log("Permissions:", Object.keys(adminUser.permissions).join(", "));
    console.log("\n🔑 Login with:");
    console.log("Email:", email);
    console.log("Password: admin123");
    console.log("\n🌐 Access admin panel at: http://localhost:5173/admin/auth/login");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
};

// Enhanced script for command line usage
const runAdminCreation = async () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("🔧 Admin Collection User Creation Script");
    console.log("=======================================");
    console.log("Usage: node utils/createAdminCollectionUser.js <email> [username]");
    console.log("Example: node utils/createAdminCollectionUser.js admin@yourdomain.com");
    console.log("\n⚠️  This creates an admin user in the separate Admin collection.");
    console.log("⚠️  Use this for the new admin panel system.");
    process.exit(1);
  }

  const email = args[0];
  const username = args[1] || "admin";

  await createAdminCollectionUser(email, username);
};

// Run the script if called directly
if (require.main === module) {
  runAdminCreation();
}

module.exports = createAdminCollectionUser;
