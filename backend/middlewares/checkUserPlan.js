const User = require("../models/User/User");
const Post = require("../models/Post/Post");
const asyncHandler = require("express-async-handler");

// Middleware to check if user can create a new post based on their plan limits
const checkUserPlan = asyncHandler(async (req, res, next) => {
  try {
    // Get the user with populated plan
    const user = await User.findById(req.user).populate('plan');
    
    // Check if user has selected a plan
    if (!user?.hasSelectedPlan) {
      return res.status(401).json({
        message: "You must select a plan before creating a post",
      });
    }

    // Check if user has a plan assigned
    if (!user?.plan) {
      return res.status(401).json({
        message: "No plan assigned. Please select a plan first.",
      });
    }

    // Get plan details
    const planTier = (user.plan.tier || user.plan.planName || 'free').toString().toLowerCase();
    
    // Define tier limits for monthly posts
    const tierDefaults = {
      free: 30,
      premium: 100, 
      pro: 300
    };

    const postLimit = user.plan.postLimit || tierDefaults[planTier] || tierDefaults.free;

    // Calculate current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Count posts created this month
    const monthlyCount = await Post.countDocuments({
      author: req.user,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Check if user has reached monthly limit
    if (monthlyCount >= postLimit) {
      return res.status(403).json({
        message: `Monthly post limit reached for your plan. Limit per month: ${postLimit}`,
        currentCount: monthlyCount,
        limit: postLimit,
        plan: user.plan.planName || user.plan.tier,
        period: 'month'
      });
    }

    // Store user plan info in request for use in controllers
    req.userPlan = user.plan;
    req.userPostCount = user.posts?.length || 0;
    req.monthlyPostCount = monthlyCount;
    
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error checking user plan",
      error: error.message
    });
  }
});

// Middleware to check specific plan features
const checkPlanFeature = (requiredFeature) => {
  return asyncHandler(async (req, res, next) => {
    try {
      const user = await User.findById(req.user).populate('plan');
      
      if (!user?.plan) {
        return res.status(403).json({
          message: "Plan required to access this feature",
        });
      }

      const planTier = (user.plan.tier || user.plan.planName || 'free').toString().toLowerCase();

      // Define feature access based on plan tiers
      const featureAccess = {
        'advancedAnalytics': ['premium', 'pro'],
        'scheduledPosts': ['premium', 'pro'],
        'contentCalendar': ['premium', 'pro'],
        'advancedSEO': ['premium', 'pro'],
        'customBranding': ['premium', 'pro'],
        'prioritySupport': ['premium', 'pro'],
        'apiAccess': ['pro'],
        'teamCollaboration': ['pro'],
        'whiteLabel': ['pro'],
        'customIntegrations': ['pro'],
        'dedicatedSupport': ['pro']
      };

      // Check if the required feature is accessible for the user's plan
      const allowedPlans = featureAccess[requiredFeature];
      
      if (!allowedPlans) {
        // If feature not defined, allow access (for backward compatibility)
        return next();
      }

      if (!allowedPlans.includes(planTier)) {
        return res.status(403).json({
          message: `This feature requires ${allowedPlans[0] === 'premium' ? 'Premium' : 'Pro'} plan or higher`,
          requiredPlan: allowedPlans[0],
          currentPlan: planTier
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Error checking plan feature access",
        error: error.message
      });
    }
  });
};

module.exports = { 
  checkUserPlan, 
  checkPlanFeature,
  checkPostLimit: checkUserPlan // Alias for backward compatibility
};
