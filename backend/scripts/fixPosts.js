require("dotenv").config();
const connectDB = require("../utils/connectDB");
const fixPostStatus = require("../utils/fixPostStatus");

const runFix = async () => {
  try {
    console.log("🔧 Starting post fix script...");
    
    // Connect to database
    await connectDB();
    console.log("✅ Connected to database");
    
    // Run the fix
    await fixPostStatus();
    
    console.log("✅ Post fix script completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error running post fix script:", error.message);
    process.exit(1);
  }
};

runFix();
