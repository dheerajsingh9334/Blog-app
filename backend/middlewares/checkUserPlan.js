const User = require("../models/User/User");
const Post = require("../models/Post/Post");
const asyncHandler = require("express-async-handler");

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

    // Store user plan info in request for use in controllers
    req.userPlan = user.plan;
    req.userPostCount = user.posts?.length || 0;
    
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

      const planTier = user.plan.tier?.toLowerCase();
      const planName = user.plan.planName?.toLowerCase();

      // Define feature access based on plan tiers
      const featureAccess = {
        'unlimited_posts': ['premium', 'pro'],
        'advanced_analytics': ['premium', 'pro'],
        'api_access': ['pro'],
        'team_collaboration': ['pro'],
        'content_calendar': ['premium', 'pro'],
        'advanced_seo_tools': ['premium', 'pro'],
        'custom_branding': ['premium', 'pro'],
        'priority_support': ['premium', 'pro'],
        'white_label': ['pro'],
        'custom_integrations': ['pro'],
        'dedicated_support': ['pro'],
        'revenue_sharing': ['premium', 'pro'],
        'advanced_security': ['premium', 'pro'],
        'data_export': ['premium', 'pro'],
        'custom_reporting': ['premium', 'pro'],
        'advanced_monetization': ['premium', 'pro'],
        'webhook_integrations': ['premium', 'pro'],
        'multi_site_management': ['premium', 'pro'],
        'advanced_automation': ['premium', 'pro'],
        'ab_testing': ['premium', 'pro'],
        'custom_workflows': ['premium', 'pro'],
        'enterprise_security': ['premium', 'pro'],
        'uptime_guarantee': ['premium', 'pro'],
        'custom_themes': ['premium', 'pro'],
        'multilanguage_support': ['premium', 'pro'],
        'advanced_user_management': ['premium', 'pro'],
        'advanced_content_scheduling': ['premium', 'pro'],
        'advanced_content_optimization': ['premium', 'pro'],
        'advanced_api_rate_limits': ['premium', 'pro'],
        'custom_branding_removal': ['premium', 'pro'],
        'dedicated_account_manager': ['premium', 'pro'],
        'custom_training_sessions': ['premium', 'pro'],
        'priority_feature_requests': ['premium', 'pro'],
        'advanced_analytics_dashboard': ['premium', 'pro'],
        'image_optimization': ['premium', 'pro'],
        'rich_text_editor': ['premium', 'pro'],
        'scheduled_posts': ['premium', 'pro'],
        'comment_moderation': ['premium', 'pro'],
        'user_engagement_insights': ['premium', 'pro'],
        'backup_restore': ['premium', 'pro'],
        'priority_customer_support': ['premium', 'pro'],
        'newsletter_integration': ['premium', 'pro'],
        'custom_domain': ['premium', 'pro'],
        'ad_free_experience': ['premium', 'pro'],
        'priority_listing': ['premium', 'pro']
      };

      // Check if the required feature is accessible for the user's plan
      const allowedPlans = featureAccess[requiredFeature];
      
      if (!allowedPlans) {
        // If feature not defined, allow access (for backward compatibility)
        return next();
      }

      if (!allowedPlans.includes(planTier) && !allowedPlans.includes(planName)) {
        return res.status(403).json({
          message: `This feature requires ${allowedPlans[0] === 'premium' ? 'Premium' : 'Pro'} plan or higher`,
          requiredPlan: allowedPlans[0],
          currentPlan: planTier || planName
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

// Middleware to check daily post limits based on user's plan
const checkPostLimit = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user).populate('plan');
    
    if (!user?.plan) {
      return res.status(403).json({
        message: "Plan required to create posts",
      });
    }

  const tier = (user.plan.tier || user.plan.planName || 'free').toString().toLowerCase();
  const tierDefaults = { free: 20, premium: 50, pro: 200 };
  const configuredLimit = user.plan.postLimit;
  const postLimit = (typeof configuredLimit === 'number') ? configuredLimit : tierDefaults[tier] ?? 20; // per-day limit

    // Count posts created today by the user
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayCount = await Post.countDocuments({
      author: req.user,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

  if (todayCount >= postLimit) {
      return res.status(403).json({
    message: `Daily post limit reached for your plan. Limit per day: ${postLimit}`,
        currentCount: todayCount,
        limit: postLimit,
        plan: user.plan.planName,
        period: 'day'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error checking post limit",
      error: error.message
    });
  }
});

module.exports = { checkUserPlan, checkPlanFeature, checkPostLimit };
