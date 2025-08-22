const { PlanFeatureManager } = require("./planFeatureManager");
const connectDB = require("./connectDB");

// Example script showing how to manage features dynamically
async function managePlanFeatures() {
  console.log("🚀 Plan Feature Management System");
  console.log("================================\n");
  
  // Connect to database
  await connectDB();
  
  // Example 1: Add new features
  console.log("📦 Adding new features...");
  PlanFeatureManager.addFeature("VIDEO_UPLOADS", ["premium", "pro"]);
  PlanFeatureManager.addFeature("AI_CONTENT_SUGGESTIONS", ["pro"]);
  PlanFeatureManager.addFeature("SOCIAL_MEDIA_AUTO_POST", ["premium", "pro"]);
  PlanFeatureManager.addFeature("CUSTOM_CSS", ["pro"]);
  
  // Example 2: Update limits
  console.log("\n🔧 Updating plan limits...");
  PlanFeatureManager.updatePostLimit("premium", 75); // Increase premium from 50 to 75
  PlanFeatureManager.updateWordLimit("free", 800);   // Increase free from 600 to 800
  
  // Example 3: List current features
  PlanFeatureManager.listAllFeatures();
  
  // Example 4: Update database with new configuration
  console.log("\n💾 Updating database...");
  await PlanFeatureManager.updatePlansInDatabase();
  
  console.log("\n✅ Feature management completed!");
  process.exit(0);
}

// Example: Remove a feature
async function removeFeatureExample() {
  await connectDB();
  
  console.log("❌ Removing a feature...");
  PlanFeatureManager.removeFeature("VIDEO_UPLOADS");
  
  // Update database
  await PlanFeatureManager.updatePlansInDatabase();
  
  console.log("✅ Feature removed and database updated!");
  process.exit(0);
}

// Example: Check if a plan has a specific feature
function checkFeatureExample() {
  console.log("🔍 Checking features...");
  
  console.log("Does Pro have Grammar Check?", PlanFeatureManager.hasFeature("pro", "GRAMMAR_CHECK"));
  console.log("Does Free have Grammar Check?", PlanFeatureManager.hasFeature("free", "GRAMMAR_CHECK"));
  console.log("Does Premium have Readers Analytics?", PlanFeatureManager.hasFeature("premium", "READERS_ANALYTICS"));
}

// Run the main management function
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case "add":
      managePlanFeatures();
      break;
    case "remove":
      removeFeatureExample();
      break;
    case "check":
      checkFeatureExample();
      break;
    case "list":
      PlanFeatureManager.listAllFeatures();
      break;
    default:
      console.log("Usage:");
      console.log("  node managePlans.js add     - Add features and update database");
      console.log("  node managePlans.js remove  - Remove features example");
      console.log("  node managePlans.js check   - Check feature availability");
      console.log("  node managePlans.js list    - List all current features");
  }
}

module.exports = {
  managePlanFeatures,
  removeFeatureExample,
  checkFeatureExample
};
