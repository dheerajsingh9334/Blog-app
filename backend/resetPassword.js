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

const resetPassword = async () => {
  try {
    await connectDB();
    
    // Find your user account
    const username = "dheerajrock93342"; // Your username
    const newPassword = "123456"; // Set a known password
    
    console.log(`Looking for user: ${username}`);
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log("User not found!");
      process.exit(1);
    }
    
    console.log(`Found user: ${user.username} (${user.email})`);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    await User.findByIdAndUpdate(user._id, { 
      password: hashedPassword,
      isEmailVerified: true // Also verify email for easier access
    });
    
    console.log(`✅ Password reset successfully!`);
    console.log(`Username: ${username}`);
    console.log(`New Password: ${newPassword}`);
    console.log(`Email verified: true`);
    
    // Test the new password
    const updatedUser = await User.findOne({ username });
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log(`Password verification test: ${isMatch ? 'PASS ✅' : 'FAIL ❌'}`);
    
    process.exit(0);
  } catch (error) {
    console.log("Error:", error);
    process.exit(1);
  }
};

resetPassword();
