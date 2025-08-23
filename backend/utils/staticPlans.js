// Static plans configuration as fallback when no DB plans exist

const STATIC_PLANS = [
  {
    _id: "free_plan_static",
    planName: "Free",
    description: "Perfect for getting started with blogging",
    features: [
  "Up to 100 posts per month",
  "5,000 words per post",
      "1 category",
      "Basic post creation",
      "View posts"
    ],
    price: 0,
  postLimit: 100, // per month
    tier: "free",
    isActive: true,
  characterLimit: 5000,
    categoryLimit: 1,
    analytics: false,
    advancedEditor: false,
    scheduledPosts: false,
    multipleCategories: false,
    commentAndLike: false,
    readerAnalytics: false
  },
  {
    _id: "premium_plan_static",
    planName: "Premium", 
    description: "Enhanced features for serious bloggers",
    features: [
  "Up to 500 posts per month",
  "10,000 words per post",
      "Multiple categories",
      "Advanced editor",
      "Scheduled posts",
      "Analytics",
      "Comments and likes"
    ],
    price: 9.99,
  postLimit: 500, // per month
    tier: "premium",
    isActive: true,
    characterLimit: 10000,
    categoryLimit: null,
    analytics: true,
    advancedEditor: true,
    scheduledPosts: true,
    multipleCategories: true,
    commentAndLike: true,
    readerAnalytics: false
  },
  {
    _id: "pro_plan_static",
    planName: "Pro",
    description: "Complete blogging solution for professionals",
    features: [
  "Everything in Premium",
  "100,000 words per post", 
      "Advanced analytics",
      "Reader analytics",
      "Priority support",
      "All features unlocked"
    ],
    price: 19.99,
  postLimit: 1000, // per month
    tier: "pro", 
    isActive: true,
    characterLimit: 100000,
    categoryLimit: null,
    analytics: true,
    advancedEditor: true,
    scheduledPosts: true,
    multipleCategories: true,
    commentAndLike: true,
    readerAnalytics: true,
    prioritySupport: true
  }
];

// Get all static plans
const getStaticPlans = () => {
  return STATIC_PLANS.filter(plan => plan.isActive);
};

// Find a static plan by ID, tier, or planName
const resolveStaticPlanByIdOrName = (identifier) => {
  if (!identifier) return null;
  
  const searchTerm = identifier.toString().toLowerCase();
  
  return STATIC_PLANS.find(plan => {
    return (
      plan._id === identifier ||
      plan.tier.toLowerCase() === searchTerm ||
      plan.planName.toLowerCase() === searchTerm ||
      plan._id.toLowerCase() === searchTerm
    );
  });
};

// Get plan by tier specifically
const getStaticPlanByTier = (tier) => {
  if (!tier) return null;
  return STATIC_PLANS.find(plan => plan.tier.toLowerCase() === tier.toLowerCase());
};

// Get plan features for a given tier
const getStaticPlanFeatures = (tier) => {
  const plan = getStaticPlanByTier(tier);
  return plan ? plan.features : [];
};

module.exports = {
  getStaticPlans,
  resolveStaticPlanByIdOrName,
  getStaticPlanByTier,
  getStaticPlanFeatures,
  STATIC_PLANS
};
