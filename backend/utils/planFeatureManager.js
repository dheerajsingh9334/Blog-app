const Plan = require("../models/Plan/Plan");
const asyncHandler = require("express-async-handler");

// Define plan features dynamically
const PLAN_FEATURES = {
  // Content Creation Features
  POST_LIMITS: {
    free: 10,
    premium: 50,
    pro: 100
  },
  
  CHARACTER_LIMITS: {
    free: 1000,
    premium: 5000,
    pro: 10000
  },
  
  CATEGORY_LIMITS: {
    free: 1,        // Single category only
    premium: null,  // Unlimited categories
    pro: null       // Unlimited categories
  },
  
  // Advanced Features (boolean flags)
  ADVANCED_FEATURES: {
    GRAMMAR_CHECK: ['premium', 'pro'],
    READERS_ANALYTICS: ['pro'],
    IMAGE_CUSTOMIZATION: ['pro'],
    PRIORITY_SUPPORT: ['premium', 'pro'],
    SEO_TOOLS: ['premium', 'pro'],
    SCHEDULED_POSTS: ['premium', 'pro'],
    TEAM_COLLABORATION: ['pro'],
    ADVANCED_ANALYTICS: ['pro']
  }
};

// Plan configuration with pricing and descriptions
const PLAN_CONFIGS = {
  free: {
    name: "Free",
    price: 0,
    description: "Perfect for getting started with basic blogging features.",
    tier: "free",
    popular: false
  },
  premium: {
    name: "Premium",
    price: 29,
    description: "For serious creators who want to grow their audience with more content.",
    tier: "premium",
    popular: true
  },
  pro: {
    name: "Pro",
    price: 99,
    description: "For power users and businesses who need advanced features and insights.",
    tier: "pro",
    popular: false
  }
};

class PlanFeatureManager {
  
  // Add a new feature to specific plan tiers
  static addFeature(featureName, allowedTiers) {
    if (!Array.isArray(allowedTiers)) {
      allowedTiers = [allowedTiers];
    }
    
    PLAN_FEATURES.ADVANCED_FEATURES[featureName.toUpperCase()] = allowedTiers;
    console.log(`✅ Added feature "${featureName}" to tiers: ${allowedTiers.join(', ')}`);
  }
  
  // Remove a feature
  static removeFeature(featureName) {
    const upperFeatureName = featureName.toUpperCase();
    if (PLAN_FEATURES.ADVANCED_FEATURES[upperFeatureName]) {
      delete PLAN_FEATURES.ADVANCED_FEATURES[upperFeatureName];
      console.log(`❌ Removed feature "${featureName}"`);
    } else {
      console.log(`⚠️ Feature "${featureName}" not found`);
    }
  }
  
  // Update post limits for a tier
  static updatePostLimit(tier, limit) {
    if (PLAN_FEATURES.POST_LIMITS[tier] !== undefined) {
      PLAN_FEATURES.POST_LIMITS[tier] = limit;
      console.log(`📝 Updated ${tier} post limit to ${limit}`);
    } else {
      console.log(`⚠️ Tier "${tier}" not found`);
    }
  }
  
  // Update character limits for a tier
  static updateCharacterLimit(tier, limit) {
    if (PLAN_FEATURES.CHARACTER_LIMITS[tier] !== undefined) {
      PLAN_FEATURES.CHARACTER_LIMITS[tier] = limit;
      console.log(`📖 Updated ${tier} character limit to ${limit}`);
    } else {
      console.log(`⚠️ Tier "${tier}" not found`);
    }
  }
  
  // Update category limits for a tier
  static updateCategoryLimit(tier, limit) {
    if (PLAN_FEATURES.CATEGORY_LIMITS[tier] !== undefined) {
      PLAN_FEATURES.CATEGORY_LIMITS[tier] = limit;
      console.log(`🏷️ Updated ${tier} category limit to ${limit === null ? 'unlimited' : limit}`);
    } else {
      console.log(`⚠️ Tier "${tier}" not found`);
    }
  }
  
  // Check if a plan tier has a specific feature
  static hasFeature(tier, featureName) {
    const upperFeatureName = featureName.toUpperCase();
    const allowedTiers = PLAN_FEATURES.ADVANCED_FEATURES[upperFeatureName];
    return allowedTiers && allowedTiers.includes(tier);
  }
  
  // Get all features for a plan tier
  static getFeaturesForTier(tier) {
    const features = [];
    
    // Add limit-based features
    features.push(`Up to ${PLAN_FEATURES.POST_LIMITS[tier]} posts`);
    features.push(`Up to ${PLAN_FEATURES.WORD_LIMITS[tier].toLocaleString()} words per post`);
    
    if (PLAN_FEATURES.CATEGORY_LIMITS[tier] === 1) {
      features.push('Single category selection');
    } else {
      features.push('Multiple categories selection');
    }
    
    // Add advanced features
    Object.entries(PLAN_FEATURES.ADVANCED_FEATURES).forEach(([feature, tiers]) => {
      if (tiers.includes(tier)) {
        // Convert feature name to readable format
        const readableFeature = feature.toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        features.push(readableFeature);
      }
    });
    
    return features;
  }
  
  // Generate plan data for database
  static generatePlanData(tier) {
    const config = PLAN_CONFIGS[tier];
    if (!config) {
      throw new Error(`Plan tier "${tier}" not found`);
    }
    
    return {
      planName: config.name,
      description: config.description,
      features: this.getFeaturesForTier(tier),
      price: config.price,
      postLimit: PLAN_FEATURES.POST_LIMITS[tier],
      characterLimit: PLAN_FEATURES.CHARACTER_LIMITS[tier],
      categoryLimit: PLAN_FEATURES.CATEGORY_LIMITS[tier],
      grammarCheck: this.hasFeature(tier, 'GRAMMAR_CHECK'),
      readersAnalytics: this.hasFeature(tier, 'READERS_ANALYTICS'),
      imageCustomization: this.hasFeature(tier, 'IMAGE_CUSTOMIZATION'),
      tier: config.tier,
      isActive: true,
      user: "000000000000000000000000" // Default admin user
    };
  }
  
  // Update plans in database
  static async updatePlansInDatabase() {
    try {
      // Clear existing plans
      await Plan.deleteMany({});
      console.log("🗑️ Cleared existing plans");
      
      // Generate and insert new plans
      const planData = [];
      Object.keys(PLAN_CONFIGS).forEach(tier => {
        planData.push(this.generatePlanData(tier));
      });
      
      const createdPlans = await Plan.insertMany(planData);
      console.log("✅ Plans updated in database:");
      
      createdPlans.forEach(plan => {
        console.log(`- ${plan.planName}: $${plan.price}/month (${plan.postLimit} posts, ${plan.characterLimit} characters)`);
      });
      
      return createdPlans;
    } catch (error) {
      console.error("❌ Error updating plans:", error);
      throw error;
    }
  }
  
  // List all current features
  static listAllFeatures() {
    console.log("\n📋 Current Plan Features:");
    console.log("=======================");
    
    Object.keys(PLAN_CONFIGS).forEach(tier => {
      console.log(`\n🎯 ${PLAN_CONFIGS[tier].name} Plan:`);
      console.log(`   💰 Price: $${PLAN_CONFIGS[tier].price}/month`);
      console.log(`   📝 Posts: ${PLAN_FEATURES.POST_LIMITS[tier]}`);
      console.log(`   📖 Words: ${PLAN_FEATURES.WORD_LIMITS[tier]}`);
      console.log(`   🏷️ Categories: ${PLAN_FEATURES.CATEGORY_LIMITS[tier] === null ? 'Unlimited' : PLAN_FEATURES.CATEGORY_LIMITS[tier]}`);
      
      const features = this.getFeaturesForTier(tier);
      console.log(`   ✨ Features: ${features.length} total`);
      features.forEach(feature => {
        console.log(`      • ${feature}`);
      });
    });
  }
}

module.exports = {
  PlanFeatureManager,
  PLAN_FEATURES,
  PLAN_CONFIGS
};
