const mongoose = require("mongoose");
const Plan = require("../models/Plan/Plan");
require("dotenv").config();

const seedPlans = async () => {
  try {
    // Connect to MongoDB (support both MONGODB_URI and MONGO_URL)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
    if (!mongoUri) {
      throw new Error("Missing MONGODB_URI/MONGO_URL environment variable");
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Clear existing plans
    await Plan.deleteMany({});
    console.log("Cleared existing plans");

    // Create default plans with comprehensive features
    const defaultPlans = [
      {
        planName: "Free",
        description: "Perfect for getting started. Basic features to help you begin your journey.",
        features: [
          "Up to 30 posts per month",
          "3,000 characters per post",
          "Basic analytics",
          "Community access", 
          "Standard support",
          "Basic templates",
          "Public profile",
          "Follow other users",
          "Comment on posts",
          "Like and share posts",
          "Email notifications",
          "Mobile responsive",
          "Basic SEO tools",
          "Social media sharing",
          "Basic content editor",
          "Image uploads (up to 5MB)",
          "Basic search functionality",
          "Community engagement",
          "Basic reporting",
          "Email support",
          "Mobile app access",
          "Basic content scheduling",
          "Draft saving",
          "Basic content optimization",
          "Social media integration",
          "Newsletter signup",
          "Basic user analytics",
          "Content backup",
          "Basic security features",
          "Multi-language support (basic)",
          "Basic API access",
          "Basic content calendar",
          "Basic user management",
          "Basic content moderation",
          "Basic performance insights",
          "Basic collaboration tools",
          "Basic automation features",
          "Basic A/B testing",
          "Basic custom workflows",
          "Basic data export",
          "Basic custom reporting",
          "Basic monetization tools",
          "Basic webhook integrations",
          "Basic content optimization",
          "Basic multi-site management"
        ],
        price: 0,
  postLimit: 30,
        tier: "free",
        isActive: true,
        user: "000000000000000000000000"
      },
      {
        planName: "Premium", 
        description: "For serious creators who want to grow their audience and monetize their content.",
        features: [
          "Up to 100 posts per month",
          "10,000 characters per post",
          "Priority support",
          "Advanced analytics",
          "Custom branding",
          "Email notifications", 
          "Ad-free experience",
          "Priority listing",
          "Advanced SEO tools",
          "Custom domain",
          "Scheduled posts",
          "Draft saving",
          "Rich text editor",
          "Social media integration",
          "Newsletter integration",
          "Comment moderation",
          "User engagement insights",
          "Content calendar",
          "Backup and restore",
          "Priority customer support",
          "Advanced content scheduling",
          "A/B testing",
          "Advanced user management",
          "Custom workflows",
          "Advanced security features",
          "Data export and import",
          "Custom reporting",
          "Advanced monetization tools",
          "Priority feature requests",
          "Dedicated account manager",
          "Custom training sessions",
          "Advanced automation",
          "Enterprise-grade security",
          "99.9% uptime guarantee",
          "Custom branding removal",
          "Advanced API rate limits",
          "Webhook integrations",
          "Advanced content optimization",
          "Multi-site management",
          "Advanced analytics dashboard",
          "Custom themes and templates",
          "Multi-language support",
          "Team collaboration",
          "Revenue sharing",
          "Advanced content scheduling",
          "Advanced user management",
          "Custom workflows",
          "Advanced security features",
          "Data export and import",
          "Custom reporting",
          "Advanced monetization tools",
          "Priority feature requests",
          "Dedicated account manager",
          "Custom training sessions",
          "Advanced automation",
          "Enterprise-grade security",
          "99.9% uptime guarantee",
          "Custom branding removal",
          "Advanced API rate limits",
          "Webhook integrations",
          "Advanced content optimization",
          "Multi-site management"
        ],
        price: 29,
  postLimit: 100,
        tier: "premium",
        isActive: true,
        user: "000000000000000000000000"
      },
      {
        planName: "Pro",
        description: "For businesses and power users who need advanced features and dedicated support.",
        features: [
          "Everything in Premium",
          "50,000 characters per post",
          "API access",
          "White-label solution",
          "Dedicated support",
          "Custom integrations",
          "Team collaboration",
          "Advanced SEO tools",
          "Revenue sharing",
          "Advanced analytics dashboard",
          "Custom themes and templates",
          "Multi-language support",
          "Advanced content scheduling",
          "A/B testing",
          "Advanced user management",
          "Custom workflows",
          "Advanced security features",
          "Data export and import",
          "Custom reporting",
          "Advanced monetization tools",
          "Priority feature requests",
          "Dedicated account manager",
          "Custom training sessions",
          "Advanced automation",
          "Enterprise-grade security",
          "99.9% uptime guarantee",
          "Custom branding removal",
          "Advanced API rate limits",
          "Webhook integrations",
          "Advanced content optimization",
          "Multi-site management",
          "Advanced analytics dashboard",
          "Custom themes and templates",
          "Multi-language support",
          "Advanced content scheduling",
          "A/B testing",
          "Advanced user management",
          "Custom workflows",
          "Advanced security features",
          "Data export and import",
          "Custom reporting",
          "Advanced monetization tools",
          "Priority feature requests",
          "Dedicated account manager",
          "Custom training sessions",
          "Advanced automation",
          "Enterprise-grade security",
          "99.9% uptime guarantee",
          "Custom branding removal",
          "Advanced API rate limits",
          "Webhook integrations",
          "Advanced content optimization",
          "Multi-site management"
        ],
        price: 99,
  postLimit: 300,
        tier: "pro",
        isActive: true,
        user: "000000000000000000000000"
      }
    ];

    // Insert plans
    const createdPlans = await Plan.insertMany(defaultPlans);
    console.log("✅ Default plans created successfully:");
    
    createdPlans.forEach(plan => {
      console.log(`- ${plan.planName}: $${plan.price}/month (${plan.postLimit ? `${plan.postLimit} posts` : 'Unlimited'})`);
    });

    console.log("\n🎉 Plan seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding plans:", error);
    process.exit(1);
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedPlans();
}

module.exports = seedPlans;
