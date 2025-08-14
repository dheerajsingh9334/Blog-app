// Plan utilities for feature access control and plan management

export const PLAN_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  PRO: 'pro'
};

// Canonical feature keys to drive gating
export const FEATURE_KEYS = {
  ANALYTICS: 'advanced_analytics',
  SEO_TOOLS: 'seo_tools',
  CONTENT_CALENDAR: 'content_calendar',
  AUTOMATION: 'advanced_automation',
  SECURITY: 'advanced_security',
  TEAM_COLLABORATION: 'team_collaboration',
  API_ACCESS: 'api_access',
  WHITE_LABEL: 'white_label_solution',
  CUSTOM_INTEGRATIONS: 'custom_integrations',
};

// Feature mapping for different plan tiers
export const FEATURE_ACCESS = {
  // Free plan features
  'basic_analytics': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'community_access': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'standard_support': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_templates': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'public_profile': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'follow_users': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'comment_posts': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'like_share_posts': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'email_notifications': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'mobile_responsive': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_seo_tools': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'social_media_sharing': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_content_editor': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'image_uploads': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_search': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'community_engagement': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_reporting': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'email_support': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'mobile_app_access': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_content_scheduling': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'draft_saving': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_content_optimization': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'social_media_integration': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'newsletter_signup': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_user_analytics': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'content_backup': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_security': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_multilanguage': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_api_access': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_content_calendar': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_user_management': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_content_moderation': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_performance_insights': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_collaboration': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_automation': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_ab_testing': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_workflows': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_data_export': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_custom_reporting': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_monetization': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_webhooks': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_multi_site': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'create_post': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'view_posts': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'edit_profile': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'upload_images': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'basic_notifications': [PLAN_TIERS.FREE, PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  
  // Premium plan features (includes all free features)
  'unlimited_posts': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'priority_support': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'advanced_analytics': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'custom_branding': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'ad_free_experience': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'priority_listing': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'advanced_seo_tools': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'custom_domain': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'scheduled_posts': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'rich_text_editor': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'image_optimization': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'newsletter_integration': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'comment_moderation': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'user_engagement_insights': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'content_calendar': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'backup_restore': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'priority_customer_support': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'advanced_content_scheduling': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'ab_testing': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'advanced_user_management': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'custom_workflows': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'advanced_security': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'data_export_import': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'custom_reporting': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'advanced_monetization': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'priority_feature_requests': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'dedicated_account_manager': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'custom_training_sessions': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'advanced_automation': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'enterprise_security': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'uptime_guarantee': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'custom_branding_removal': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'multilanguage_support': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'revenue_sharing': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  'seo_tools': [PLAN_TIERS.PREMIUM, PLAN_TIERS.PRO],
  
  // Pro plan features (includes all premium and free features)
  'api_access': [PLAN_TIERS.PRO],
  'white_label_solution': [PLAN_TIERS.PRO],
  'dedicated_support': [PLAN_TIERS.PRO],
  'custom_integrations': [PLAN_TIERS.PRO],
  'team_collaboration': [PLAN_TIERS.PRO],
  'white_label': [PLAN_TIERS.PRO],
  'custom_themes': [PLAN_TIERS.PRO],
  'advanced_api_rate_limits': [PLAN_TIERS.PRO],
  'enterprise_features': [PLAN_TIERS.PRO],
  'multi_site_management': [PLAN_TIERS.PRO],
  'webhook_integrations': [PLAN_TIERS.PRO],
  'advanced_webhooks': [PLAN_TIERS.PRO],
  'custom_webhooks': [PLAN_TIERS.PRO],
  'advanced_data_export': [PLAN_TIERS.PRO],
  'advanced_custom_reporting': [PLAN_TIERS.PRO],
  'advanced_monetization_features': [PLAN_TIERS.PRO],
  'advanced_automation_features': [PLAN_TIERS.PRO],
  'advanced_ab_testing': [PLAN_TIERS.PRO],
  'advanced_workflows': [PLAN_TIERS.PRO],
  'advanced_security_features': [PLAN_TIERS.PRO],
  'advanced_performance_insights': [PLAN_TIERS.PRO],
  'advanced_user_management_features': [PLAN_TIERS.PRO],
  'advanced_content_moderation': [PLAN_TIERS.PRO],
  'advanced_content_optimization': [PLAN_TIERS.PRO],
  'advanced_content_scheduling_features': [PLAN_TIERS.PRO],
  'advanced_content_calendar': [PLAN_TIERS.PRO],
  'advanced_collaboration': [PLAN_TIERS.PRO],
  'advanced_analytics_dashboard': [PLAN_TIERS.PRO],
  'advanced_user_analytics': [PLAN_TIERS.PRO],
  'advanced_performance_analytics': [PLAN_TIERS.PRO],
  'advanced_engagement_analytics': [PLAN_TIERS.PRO],
  'advanced_revenue_analytics': [PLAN_TIERS.PRO],
  'advanced_content_analytics': [PLAN_TIERS.PRO],
  'advanced_audience_analytics': [PLAN_TIERS.PRO],
  'advanced_traffic_analytics': [PLAN_TIERS.PRO],
  'advanced_conversion_analytics': [PLAN_TIERS.PRO],
  'advanced_roi_analytics': [PLAN_TIERS.PRO],
  'advanced_campaign_analytics': [PLAN_TIERS.PRO],
  'advanced_social_analytics': [PLAN_TIERS.PRO],
  'advanced_email_analytics': [PLAN_TIERS.PRO],
  'advanced_mobile_analytics': [PLAN_TIERS.PRO],
  'advanced_seo_analytics': [PLAN_TIERS.PRO],
  'advanced_competitor_analytics': [PLAN_TIERS.PRO],
  'advanced_market_analytics': [PLAN_TIERS.PRO],
  'advanced_trend_analytics': [PLAN_TIERS.PRO],
  'advanced_predictive_analytics': [PLAN_TIERS.PRO],
  'advanced_machine_learning': [PLAN_TIERS.PRO],
  'advanced_ai_features': [PLAN_TIERS.PRO],
  'advanced_chatbot': [PLAN_TIERS.PRO],
  'advanced_automation_ai': [PLAN_TIERS.PRO],
  'advanced_content_ai': [PLAN_TIERS.PRO],
  'advanced_seo_ai': [PLAN_TIERS.PRO],
  'advanced_analytics_ai': [PLAN_TIERS.PRO],
  'advanced_personalization': [PLAN_TIERS.PRO],
  'advanced_recommendations': [PLAN_TIERS.PRO],
  'advanced_targeting': [PLAN_TIERS.PRO],
  'advanced_segmentation': [PLAN_TIERS.PRO],
  'advanced_optimization': [PLAN_TIERS.PRO],
  'advanced_testing': [PLAN_TIERS.PRO],
  'advanced_experimentation': [PLAN_TIERS.PRO],
  'advanced_research': [PLAN_TIERS.PRO],
  'advanced_insights': [PLAN_TIERS.PRO],
  'advanced_intelligence': [PLAN_TIERS.PRO],
  'advanced_automation_intelligence': [PLAN_TIERS.PRO],
  'advanced_content_intelligence': [PLAN_TIERS.PRO],
  'advanced_user_intelligence': [PLAN_TIERS.PRO],
  'advanced_market_intelligence': [PLAN_TIERS.PRO],
  'advanced_competitive_intelligence': [PLAN_TIERS.PRO],
  'advanced_business_intelligence': [PLAN_TIERS.PRO],
  'advanced_financial_intelligence': [PLAN_TIERS.PRO],
  'advanced_operational_intelligence': [PLAN_TIERS.PRO],
  'advanced_strategic_intelligence': [PLAN_TIERS.PRO],
  'advanced_tactical_intelligence': [PLAN_TIERS.PRO]
};

export const PLAN_FEATURES = {
  [PLAN_TIERS.FREE]: {
    name: 'Free',
    price: 0,
    postLimit: 10,
    features: [
      'Up to 10 posts',
      'Basic analytics',
      'Community access',
      'Standard support',
      'Basic templates',
      'Public profile',
      'Follow other users',
      'Comment on posts',
      'Like and share posts',
      'Email notifications',
      'Mobile responsive',
      'Basic SEO tools',
      'Social media sharing',
      'Basic content editor',
      'Image uploads (up to 5MB)',
      'Basic search functionality',
      'Community engagement',
      'Basic reporting',
      'Email support',
      'Mobile app access',
      'Basic content scheduling',
      'Draft saving',
      'Basic content optimization',
      'Social media integration',
      'Newsletter signup',
      'Basic user analytics',
      'Content backup',
      'Basic security features',
      'Multi-language support (basic)',
      'Basic API access',
      'Basic content calendar',
      'Basic user management',
      'Basic content moderation',
      'Basic performance insights',
      'Basic collaboration tools',
      'Basic automation features',
      'Basic A/B testing',
      'Basic custom workflows',
      'Basic data export',
      'Basic custom reporting',
      'Basic monetization tools',
      'Basic webhook integrations',
      'Basic content optimization',
      'Basic multi-site management'
    ]
  },
  [PLAN_TIERS.PREMIUM]: {
    name: 'Premium',
    price: 29,
    postLimit: null, // Unlimited
    features: [
      'Unlimited posts',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'Email notifications',
      'Ad-free experience',
      'Priority listing',
      'Advanced SEO tools',
      'Custom domain',
      'Scheduled posts',
      'Draft saving',
      'Rich text editor',
      'Image optimization',
      'Social media integration',
      'Newsletter integration',
      'Comment moderation',
      'User engagement insights',
      'Content calendar',
      'Backup and restore',
      'Priority customer support',
      'Advanced content scheduling',
      'A/B testing',
      'Advanced user management',
      'Custom workflows',
      'Advanced security features',
      'Data export and import',
      'Custom reporting',
      'Advanced monetization tools',
      'Priority feature requests',
      'Dedicated account manager',
      'Custom training sessions',
      'Advanced automation',
      'Enterprise-grade security',
      '99.9% uptime guarantee',
      'Custom branding removal',
      'Advanced API rate limits',
      'Webhook integrations',
      'Advanced content optimization',
      'Multi-site management',
      'Advanced analytics dashboard',
      'Custom themes and templates',
      'Multi-language support',
      'Team collaboration',
      'Revenue sharing',
      'Advanced content scheduling',
      'Advanced user management',
      'Custom workflows',
      'Advanced security features',
      'Data export and import',
      'Custom reporting',
      'Advanced monetization tools',
      'Priority feature requests',
      'Dedicated account manager',
      'Custom training sessions',
      'Advanced automation',
      'Enterprise-grade security',
      '99.9% uptime guarantee',
      'Custom branding removal',
      'Advanced API rate limits',
      'Webhook integrations',
      'Advanced content optimization',
      'Multi-site management'
    ]
  },
  [PLAN_TIERS.PRO]: {
    name: 'Pro',
    price: 99,
    postLimit: null, // Unlimited
    features: [
      'Everything in Premium',
      'API access',
      'White-label solution',
      'Dedicated support',
      'Custom integrations',
      'Team collaboration',
      'Advanced SEO tools',
      'Revenue sharing',
      'Advanced analytics dashboard',
      'Custom themes and templates',
      'Multi-language support',
      'Advanced content scheduling',
      'A/B testing',
      'Advanced user management',
      'Custom workflows',
      'Advanced security features',
      'Data export and import',
      'Custom reporting',
      'Advanced monetization tools',
      'Priority feature requests',
      'Dedicated account manager',
      'Custom training sessions',
      'Advanced automation',
      'Enterprise-grade security',
      '99.9% uptime guarantee',
      'Custom branding removal',
      'Advanced API rate limits',
      'Webhook integrations',
      'Advanced content optimization',
      'Multi-site management',
      'Advanced analytics dashboard',
      'Custom themes and templates',
      'Multi-language support',
      'Advanced content scheduling',
      'A/B testing',
      'Advanced user management',
      'Custom workflows',
      'Advanced security features',
      'Data export and import',
      'Custom reporting',
      'Advanced monetization tools',
      'Priority feature requests',
      'Dedicated account manager',
      'Custom training sessions',
      'Advanced automation',
      'Enterprise-grade security',
      '99.9% uptime guarantee',
      'Custom branding removal',
      'Advanced API rate limits',
      'Webhook integrations',
      'Advanced content optimization',
      'Multi-site management'
    ]
  }
};

// Helper functions for plan-based access control
export const hasFeature = (userPlan, feature) => {
  if (!userPlan) return false;
  
  // Handle different plan data structures
  let planTier = null;
  
  if (userPlan.tier) {
    planTier = userPlan.tier.toLowerCase();
  } else if (userPlan.planName) {
    // Map plan names to tiers
    const planName = userPlan.planName.toLowerCase();
    if (planName.includes('pro') || planName === 'pro') {
      planTier = PLAN_TIERS.PRO;
    } else if (planName.includes('premium') || planName === 'premium') {
      planTier = PLAN_TIERS.PREMIUM;
    } else if (planName.includes('free') || planName === 'free') {
      planTier = PLAN_TIERS.FREE;
    }
  }
  
  // If we still don't have a plan tier, default to free
  if (!planTier) {
    planTier = PLAN_TIERS.FREE;
  }
  
  // Check if the feature exists in our access mapping
  if (FEATURE_ACCESS[feature]) {
    return FEATURE_ACCESS[feature].includes(planTier);
  }
  
  // Fallback to tier-based access
  switch (planTier) {
    case PLAN_TIERS.PRO:
      return true; // Pro has access to everything
    case PLAN_TIERS.PREMIUM:
      // Premium has access to Premium and Free features
      return PLAN_FEATURES[PLAN_TIERS.PREMIUM]?.features?.includes(feature) ||
             PLAN_FEATURES[PLAN_TIERS.FREE]?.features?.includes(feature);
    case PLAN_TIERS.FREE:
      // Free only has access to Free features
      return PLAN_FEATURES[PLAN_TIERS.FREE]?.features?.includes(feature);
    default:
      return false;
  }
};

export const canAccessFeature = (userPlan, feature) => {
  return hasFeature(userPlan, feature);
};

export const getPlanTier = (userPlan) => {
  if (!userPlan) return PLAN_TIERS.FREE;
  
  // Handle different plan data structures
  let planTier = null;
  
  if (userPlan.tier) {
    planTier = userPlan.tier.toLowerCase();
  } else if (userPlan.planName) {
    // Map plan names to tiers
    const planName = userPlan.planName.toLowerCase();
    if (planName.includes('pro') || planName === 'pro') {
      planTier = PLAN_TIERS.PRO;
    } else if (planName.includes('premium') || planName === 'premium') {
      planTier = PLAN_TIERS.PREMIUM;
    } else if (planName.includes('free') || planName === 'free') {
      planTier = PLAN_TIERS.FREE;
    }
  }
  
  // If we still don't have a plan tier, default to free
  if (!planTier) {
    planTier = PLAN_TIERS.FREE;
  }
  
  // Ensure we return the correct tier constant
  if (planTier === PLAN_TIERS.PRO) return PLAN_TIERS.PRO;
  if (planTier === PLAN_TIERS.PREMIUM) return PLAN_TIERS.PREMIUM;
  return PLAN_TIERS.FREE;
};

export const getPlanInfo = (userPlan) => {
  const tier = getPlanTier(userPlan);
  return PLAN_FEATURES[tier];
};

export const canCreatePost = (userPlan, currentPostCount) => {
  const planInfo = getPlanInfo(userPlan);
  if (!planInfo.postLimit) return true; // Unlimited
  return currentPostCount < planInfo.postLimit;
};

export const getUpgradePrompt = (userPlan, feature) => {
  const currentTier = getPlanTier(userPlan);
  
  if (currentTier === PLAN_TIERS.PRO) return null;
  
  if (currentTier === PLAN_TIERS.FREE) {
    return {
      message: `Upgrade to Premium to access ${feature}`,
      action: 'upgrade',
      targetPlan: PLAN_TIERS.PREMIUM
    };
  }
  
  if (currentTier === PLAN_TIERS.PREMIUM) {
    return {
      message: `Upgrade to Pro to access ${feature}`,
      action: 'upgrade',
      targetPlan: PLAN_TIERS.PRO
    };
  }
  
  return null;
};

export const getPlanBadge = (userPlan) => {
  const tier = getPlanTier(userPlan);
  
  const badges = {
    [PLAN_TIERS.FREE]: {
      text: 'FREE',
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    },
    [PLAN_TIERS.PREMIUM]: {
      text: 'PREMIUM',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    },
    [PLAN_TIERS.PRO]: {
      text: 'PRO',
      className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
    }
  };
  
  return badges[tier] || badges[PLAN_TIERS.FREE];
};

export const getUpgradeButton = (userPlan, className = '') => {
  const currentTier = getPlanTier(userPlan);
  
  if (currentTier === PLAN_TIERS.PRO) return null;
  
  const buttons = {
    [PLAN_TIERS.FREE]: {
      text: 'Upgrade to Premium',
      href: '/pricing',
      className: 'bg-green-600 hover:bg-green-700 text-white'
    },
    [PLAN_TIERS.PREMIUM]: {
      text: 'Upgrade to Pro',
      href: '/pricing',
      className: 'bg-indigo-600 hover:bg-indigo-700 text-white'
    }
  };
  
  const button = buttons[currentTier];
  if (!button) return null;
  
  return {
    ...button,
    className: `${button.className} ${className}`.trim()
  };
};
