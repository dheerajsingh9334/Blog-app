import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserPlanAndUsageAPI } from '../../APIServices/users/usersAPI';
import { PLAN_TIERS, hasFeatureAccess } from '../../utils/planUtils';
import { FaLock, FaCrown, FaGem } from 'react-icons/fa';
import { Link } from 'react-router-dom';

/**
 * Feature Gate Component - Controls access to features based on user's plan
 * @param {Object} props
 * @param {string} props.feature - Feature key to check access for
 * @param {React.ReactNode} props.children - Content to show if access granted
 * @param {React.ReactNode} props.fallback - Custom fallback component (optional)
 * @param {boolean} props.showUpgrade - Whether to show upgrade button (default: true)
 * @param {string} props.redirectTo - Where to redirect for upgrade (default: /pricing)
 */
const FeatureGate = ({ 
  feature, 
  children, 
  fallback = null, 
  showUpgrade = true,
  redirectTo = '/pricing'
}) => {
  const { data: usageData, isLoading } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userPlan = usageData?.usage?.plan?.tier || PLAN_TIERS.FREE;
  const hasAccess = hasFeatureAccess(feature, userPlan);

  if (hasAccess) {
    return <>{children}</>;
  }

  // If access denied, show fallback or default upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
      <div className="mb-4">
        {feature === 'api_access' || feature === 'white_label_solution' ? (
          <FaGem className="h-12 w-12 text-purple-500 mx-auto" />
        ) : (
          <FaCrown className="h-12 w-12 text-yellow-500 mx-auto" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {getFeatureTitle(feature)} 
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {getFeatureDescription(feature, userPlan)}
      </p>

      {showUpgrade && (
        <div className="space-y-2">
          {getRequiredPlan(feature) === PLAN_TIERS.PREMIUM ? (
            <Link
              to={redirectTo}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium"
            >
              <FaCrown className="mr-2" />
              Upgrade to Premium
            </Link>
          ) : (
            <Link
              to={redirectTo}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
            >
              <FaGem className="mr-2" />
              Upgrade to Pro
            </Link>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Unlock this feature and many more
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Plan Badge Component - Shows user's current plan with styling
 */
export const PlanBadge = ({ plan, className = "" }) => {
  const getBadgeStyle = (planTier) => {
    switch (planTier) {
      case PLAN_TIERS.PRO:
        return "bg-gradient-to-r from-purple-600 to-pink-600 text-white";
      case PLAN_TIERS.PREMIUM:
        return "bg-gradient-to-r from-blue-600 to-purple-600 text-white";
      case PLAN_TIERS.FREE:
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  const getIcon = (planTier) => {
    switch (planTier) {
      case PLAN_TIERS.PRO:
        return <FaGem className="mr-1" />;
      case PLAN_TIERS.PREMIUM:
        return <FaCrown className="mr-1" />;
      case PLAN_TIERS.FREE:
      default:
        return null;
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeStyle(plan)} ${className}`}>
      {getIcon(plan)}
      {plan?.charAt(0)?.toUpperCase() + plan?.slice(1) || 'Free'}
    </span>
  );
};

/**
 * Lock Icon Component - Shows when feature is locked
 */
export const FeatureLock = ({ size = "sm" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <FaLock className={`text-gray-400 dark:text-gray-500 ${sizeClasses[size]}`} />
  );
};

// Helper functions
const getFeatureTitle = (feature) => {
  const titles = {
    'advanced_analytics': 'Advanced Analytics',
    'unlimited_posts': 'Unlimited Posts',
    'custom_branding': 'Custom Branding',
    'priority_support': 'Priority Support',
    'api_access': 'API Access',
    'white_label_solution': 'White Label Solution',
    'team_collaboration': 'Team Collaboration',
    'custom_integrations': 'Custom Integrations',
    'content_calendar': 'Content Calendar',
    'scheduled_posts': 'Scheduled Posts',
    'advanced_seo_tools': 'Advanced SEO Tools',
    'custom_domain': 'Custom Domain'
  };
  return titles[feature] || 'Premium Feature';
};

const getFeatureDescription = (feature, currentPlan) => {
  const descriptions = {
    'advanced_analytics': `Get detailed insights into your content performance, audience engagement, and growth metrics.`,
    'unlimited_posts': `Create unlimited posts without restrictions. Currently on ${currentPlan} plan.`,
    'custom_branding': `Remove our branding and add your own custom logo and colors.`,
    'priority_support': `Get priority customer support with faster response times.`,
    'api_access': `Access our powerful API to integrate with your existing tools and workflows.`,
    'white_label_solution': `Complete white-label solution for your business needs.`,
    'team_collaboration': `Collaborate with team members and manage permissions.`,
    'custom_integrations': `Build custom integrations tailored to your business.`,
    'content_calendar': `Plan and schedule your content with our advanced calendar.`,
    'scheduled_posts': `Schedule posts to be published automatically at optimal times.`,
    'advanced_seo_tools': `Optimize your content for search engines with advanced SEO tools.`,
    'custom_domain': `Use your own custom domain for a professional presence.`
  };
  return descriptions[feature] || `This feature requires a higher plan tier.`;
};

const getRequiredPlan = (feature) => {
  const proFeatures = ['api_access', 'white_label_solution', 'team_collaboration', 'custom_integrations'];
  return proFeatures.includes(feature) ? PLAN_TIERS.PRO : PLAN_TIERS.PREMIUM;
};

export default FeatureGate;
