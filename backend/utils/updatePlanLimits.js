require("dotenv").config();
const mongoose = require("mongoose");
const Plan = require("../models/Plan/Plan");

async function updatePlanLimits() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Update plans with new limits
    await Plan.updateOne({ planName: "Free" }, { postLimit: 100 });
    await Plan.updateOne({ planName: "Premium" }, { postLimit: 500 });
    await Plan.updateOne({ planName: "Pro" }, { postLimit: 1000 });

    console.log("✅ Plan limits updated successfully");

    // Verify the updates
    const plans = await Plan.find().sort({ price: 1 });
    console.log("Updated plans:");
    plans.forEach(plan => {
      console.log(`- ${plan.planName}: $${plan.price}/month (${plan.postLimit} posts)`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error updating plans:", error);
    process.exit(1);
  }
}

updatePlanLimits();
