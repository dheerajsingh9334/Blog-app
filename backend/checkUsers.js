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

const checkUsers = async () => {
  try {
    await connectDB();
    
    console.log("=== Checking all users ===");
    const users = await User.find().select('username email password isEmailVerified createdAt');
    
    console.log(`Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
      console.log(`   Email Verified: ${user.isEmailVerified}`);
      console.log(`   Created: ${user.createdAt}`);
    });

    // Test password verification for first user
    if (users.length > 0) {
      const firstUser = users[0];
      console.log(`\n=== Testing password verification for ${firstUser.username} ===`);
      
      // Common test passwords
      const testPasswords = ['password', '123456', 'admin', 'test', firstUser.username];
      
      for (const testPassword of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, firstUser.password);
          console.log(`Password "${testPassword}": ${isMatch ? 'MATCH ✅' : 'No match ❌'}`);
        } catch (error) {
          console.log(`Error testing password "${testPassword}": ${error.message}`);
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.log("Error:", error);
    process.exit(1);
  }
};

checkUsers();
