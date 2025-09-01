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

const createUserWithDesiredUsername = async () => {
  try {
    await connectDB();
    
    const username = "dheerajrock9334";
    const password = "123456";
    const email = "dheerajrock9334@gmail.com";
    
    console.log(`🔍 Checking if user '${username}' already exists...`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log(`✅ User '${username}' already exists!`);
      console.log(`👤 Username: ${username}`);
      console.log(`🔑 Password: ${password}`);
      
      // Update password just to be sure
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(existingUser._id, { 
        password: hashedPassword,
        isEmailVerified: true
      });
      console.log(`🔐 Password updated to ensure it's ${password}`);
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
    console.log(`🔐 Hashing password...`);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    console.log(`👤 Creating user '${username}'...`);
    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
      isEmailVerified: true,
      plan: freePlan._id,
      role: "user",
      authMethod: "local"
    });
    
    console.log(`\n🎉 USER CREATED SUCCESSFULLY!`);
    console.log(`👤 Username: ${username}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`✉️ Email Verified: true`);
    
    // Test the password
    console.log(`\n🧪 Testing login credentials...`);
    const isMatch = await bcrypt.compare(password, newUser.password);
    
    if (isMatch) {
      console.log(`✅ Password verification: SUCCESS`);
      console.log(`\n🎯 You can now login with:`);
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
    } else {
      console.log(`❌ Password verification: FAILED`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    process.exit(1);
  }
};

createUserWithDesiredUsername();
