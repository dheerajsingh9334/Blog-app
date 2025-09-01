const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User/User");
const Plan = require("./models/Plan/Plan");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const createTestUser = async () => {
  try {
    await connectDB();
    
    // Check if test user already exists
    const existingUser = await User.findOne({ username: "admin" });
    if (existingUser) {
      console.log("Test user 'admin' already exists!");
      console.log("Username: admin");
      console.log("Password: admin123");
      process.exit(0);
    }
    
    // Get a plan for the user
    let freePlan = await Plan.findOne({ tier: "free", isActive: true });
    if (!freePlan) {
      // Create a basic plan if none exists
      freePlan = await Plan.create({
        planName: "Free",
        tier: "free",
        price: 0,
        features: {
          maxPosts: 10,
          maxCategories: 5,
          analytics: false,
          support: "basic"
        },
        isActive: true
      });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Create test user
    const testUser = await User.create({
      username: "admin",
      email: "admin@test.com",
      password: hashedPassword,
      isEmailVerified: true,
      plan: freePlan._id,
      role: "user"
    });
    
    console.log("✅ Test user created successfully!");
    console.log("Username: admin");
    console.log("Email: admin@test.com");
    console.log("Password: admin123");
    console.log("Email Verified: true");
    
    process.exit(0);
  } catch (error) {
    console.log("Error:", error);
    process.exit(1);
  }
};

createTestUser();
