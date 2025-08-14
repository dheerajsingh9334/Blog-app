const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User/User");
const Plan = require("../models/Plan/Plan");
const connectDB = require("./connectDB");
const sendAccVerificationEmail = require("./sendAccVerificationEmail");

const createAdminUser = async (email, username = "admin") => {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.username);
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);
      process.exit(0);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("❌ Invalid email format. Please provide a valid email address.");
      process.exit(1);
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error("❌ Email is already in use by another user.");
      process.exit(1);
    }

    // Get the free plan
    const freePlan = await Plan.findOne({ tier: "free", isActive: true });
    if (!freePlan) {
      console.error("❌ Free plan not found. Please create a free plan first.");
      process.exit(1);
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Create admin user with email verification required
    const adminUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "admin",
      plan: freePlan._id,
      hasSelectedPlan: true,
      isEmailVerified: false, // Email verification required
      verificationToken,
      verificationTokenExpiry
    });

    console.log("✅ Admin user created successfully:");
    console.log("Username:", adminUser.username);
    console.log("Email:", adminUser.email);
    console.log("Password: admin123");
    console.log("Role:", adminUser.role);
    console.log("Email Verification: Required");
    console.log("\n📧 Sending verification email...");

    try {
      // Send verification email
      await sendAccVerificationEmail(email, verificationToken);
      console.log("✅ Verification email sent successfully!");
      console.log("\n🔐 IMPORTANT: You must verify your email before accessing admin privileges.");
      console.log("📧 Check your email and click the verification link.");
      console.log("🔗 Verification link: http://localhost:5173/dashboard/account-verification/" + verificationToken);
    } catch (emailError) {
      console.error("❌ Failed to send verification email:", emailError.message);
      console.log("⚠️  Admin user created but email verification failed.");
      console.log("🔗 Manual verification link: http://localhost:5173/dashboard/account-verification/" + verificationToken);
    }
    
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
    console.log("🔧 Admin User Creation Script");
    console.log("=============================");
    console.log("Usage: npm run create:admin <email>");
    console.log("Example: npm run create:admin admin@yourdomain.com");
    console.log("\n⚠️  Email verification is required for admin access.");
    process.exit(1);
  }

  const email = args[0];
  const username = args[1] || "admin";

  console.log("🔧 Creating admin user with email verification...");
  console.log("Email:", email);
  console.log("Username:", username);
  console.log("");

  await createAdminUser(email, username);
};

// Run the script if called directly
if (require.main === module) {
  runAdminCreation();
}

module.exports = createAdminUser;
