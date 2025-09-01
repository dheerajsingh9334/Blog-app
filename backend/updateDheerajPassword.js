const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User/User");
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

const updatePassword = async () => {
  try {
    await connectDB();
    
    const username = "dheerajrock93342";
    const newPassword = "123456";
    
    console.log(`🔍 Looking for user: ${username}`);
    
    // Find the user
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`❌ User '${username}' not found!`);
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.username}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`📅 Created: ${user.createdAt}`);
    
    // Hash the new password
    console.log(`🔐 Hashing new password...`);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    console.log(`💾 Updating password in database...`);
    await User.findByIdAndUpdate(user._id, { 
      password: hashedPassword,
      isEmailVerified: true // Also verify email for easier login
    });
    
    console.log(`\n🎉 PASSWORD UPDATED SUCCESSFULLY!`);
    console.log(`👤 Username: ${username}`);
    console.log(`🔑 New Password: ${newPassword}`);
    console.log(`✉️ Email Verified: true`);
    
    // Verify the password was set correctly
    console.log(`\n🧪 Testing new password...`);
    const updatedUser = await User.findOne({ username });
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    
    if (isMatch) {
      console.log(`✅ Password verification: SUCCESS`);
      console.log(`\n🎯 You can now login with:`);
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${newPassword}`);
    } else {
      console.log(`❌ Password verification: FAILED`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    process.exit(1);
  }
};

updatePassword();
