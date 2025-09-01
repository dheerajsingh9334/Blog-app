const mongoose = require('mongoose');
const Plan = require('./models/Plan/Plan');
require('dotenv').config();

async function checkPlans() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    const plans = await Plan.find({});
    console.log('\n=== PLANS IN DATABASE ===');
    if (plans.length === 0) {
      console.log('No plans found in database');
    } else {
      plans.forEach(plan => {
        console.log(`\nPlan: ${plan.planName}`);
        console.log(`Tier: ${plan.tier}`);
        console.log(`Price: $${plan.price}`);
        console.log(`Post Limit: ${plan.postLimit}`);
        console.log(`Character Limit: ${plan.characterLimit}`);
        console.log(`Category Limit: ${plan.categoryLimit}`);
        console.log(`Features: ${plan.features.slice(0, 3).join(', ')}...`);
      });
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPlans();
