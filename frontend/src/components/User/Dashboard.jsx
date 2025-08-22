import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getUserPlanAndUsageAPI } from '../../APIServices/users/usersAPI';
import { PLAN_TIERS, hasFeatureAccess, hasAnalytics } from '../../utils/planUtils';
import FeatureGate, { PlanBadge, FeatureLock } from '../Plans/FeatureGate';
import ProDashboard from '../Dashboard/ProDashboard';
import { 
  FaFileAlt, 
  FaUsers, 
  FaChartLine, 
  FaCog, 
  FaCalendarAlt,
  FaRocket,
  FaCrown,
  FaGem,
  FaPalette,
  FaCode,
  FaHeadset,
  FaGlobe,
  FaUserFriends,
  FaSearch,
  FaClock,
  FaUpload
} from 'react-icons/fa';

const Dashboard = () => {
  const { data: usageData, isLoading } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    staleTime: 5 * 60 * 1000,
  });

  const userPlan = usageData?.usage?.plan?.tier || PLAN_TIERS.FREE;
  const showProDashboard = hasAnalytics(userPlan);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const dashboardItems = [
    {
      title: 'Posts',
      description: 'Create and manage your posts',
      icon: FaFileAlt,
      link: '/posts',
      feature: null, // Always accessible
      color: 'blue'
    },
    {
      title: 'Profile',
      description: 'Manage your profile settings',
      icon: FaUsers,
      link: '/profile',
      feature: null, // Always accessible
      color: 'green'
    },
    {
      title: 'My Posts Analytics',
      description: 'See who viewed, liked, and commented on your posts',
      icon: FaChartLine,
      link: '/dashboard/analytics',
      feature: 'analytics',
      color: 'purple'
    },
    {
      title: 'Individual Post Analytics',
      description: 'Detailed analytics for each of your posts',
      icon: FaSearch,
      link: '/dashboard/my-posts-analytics',
      feature: 'analytics',
      color: 'indigo'
    },
    {
      title: 'Post Management',
      description: 'Manage posts and see who viewed, liked, and commented',
      icon: FaCog,
      link: '/dashboard/post-management',
      feature: 'basic',
      color: 'gray'
    },
    {
      title: 'Content Calendar',
      description: 'Plan and schedule your content',
      icon: FaCalendarAlt,
      link: '/dashboard/content-calendar',
      feature: 'content_calendar',
      color: 'orange'
    },
    {
      title: 'Scheduled Posts',
      description: 'Schedule posts for optimal timing',
      icon: FaClock,
      link: '/scheduled-posts',
      feature: 'scheduled_posts',
      color: 'indigo'
    },
    {
      title: 'Custom Branding',
      description: 'Customize your brand appearance',
      icon: FaPalette,
      link: '/branding',
      feature: 'custom_branding',
      color: 'pink'
    },
    {
      title: 'SEO Tools',
      description: 'Advanced SEO optimization tools',
      icon: FaSearch,
      link: '/seo-tools',
      feature: 'advanced_seo_tools',
      color: 'yellow'
    },
    {
      title: 'API Access',
      description: 'Access our powerful API',
      icon: FaCode,
      link: '/api-docs',
      feature: 'api_access',
      color: 'gray'
    },
    {
      title: 'Team Collaboration',
      description: 'Collaborate with your team',
      icon: FaUserFriends,
      link: '/team',
      feature: 'team_collaboration',
      color: 'teal'
    },
    {
      title: 'Custom Domain',
      description: 'Use your own custom domain',
      icon: FaGlobe,
      link: '/custom-domain',
      feature: 'custom_domain',
      color: 'red'
    },
    {
      title: 'Priority Support',
      description: 'Get priority customer support',
      icon: FaHeadset,
      link: '/support',
      feature: 'priority_support',
      color: 'emerald'
    },
    {
      title: 'White Label Solution',
      description: 'Complete white-label solution',
      icon: FaRocket,
      link: '/white-label',
      feature: 'white_label_solution',
      color: 'violet'
    }
  ];

  const getColorClasses = (color, hasAccess) => {
    const baseOpacity = hasAccess ? '' : 'opacity-50';
    const colors = {
      blue: `bg-blue-500 text-white ${baseOpacity}`,
      green: `bg-green-500 text-white ${baseOpacity}`,
      purple: `bg-purple-500 text-white ${baseOpacity}`,
      orange: `bg-orange-500 text-white ${baseOpacity}`,
      indigo: `bg-indigo-500 text-white ${baseOpacity}`,
      pink: `bg-pink-500 text-white ${baseOpacity}`,
      yellow: `bg-yellow-500 text-white ${baseOpacity}`,
      gray: `bg-gray-500 text-white ${baseOpacity}`,
      teal: `bg-teal-500 text-white ${baseOpacity}`,
      red: `bg-red-500 text-white ${baseOpacity}`,
      emerald: `bg-emerald-500 text-white ${baseOpacity}`,
      violet: `bg-violet-500 text-white ${baseOpacity}`
    };
    return colors[color] || `bg-gray-500 text-white ${baseOpacity}`;
  };

  return (
    <div className="max-w-none mx-auto px-3 sm:px-4 md:px-6 lg:px-4 xl:px-6 py-6 sm:py-8">
      {/* Show Pro Dashboard for Premium+ users */}
      {showProDashboard && (
        <div className="mb-8">
          <ProDashboard userPlan={userPlan} />
        </div>
      )}

      {/* Header - Responsive */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
              Welcome back! Here&apos;s what you can do with your account.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <PlanBadge plan={userPlan} className="text-xs sm:text-sm" />
            {userPlan === PLAN_TIERS.FREE && (
              <Link
                to="/pricing"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium text-sm sm:text-base"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Plan Usage Summary - Responsive */}
      {usageData?.usage && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Plan Usage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {usageData.usage.postsCount || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Posts Created
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {usageData.usage.plan?.tier || 'Free'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Current Plan
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {usageData.usage.plan?.features?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Features Available
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Grid - Enhanced responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {dashboardItems.map((item, index) => {
          const hasAccess = !item.feature || hasFeatureAccess(item.feature, userPlan);
          const IconComponent = item.icon;

          if (hasAccess) {
            return (
              <Link
                key={index}
                to={item.link}
                className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 ${getColorClasses(item.color, true)}`}>
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                    {item.description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </Link>
            );
          }

          return (
            <FeatureGate
              key={index}
              feature={item.feature}
              showUpgrade={false}
              fallback={
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${getColorClasses(item.color, false)}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <FeatureLock size="sm" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      {item.description}
                    </p>
                    <Link
                      to="/pricing"
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      {item.feature === 'api_access' || item.feature === 'white_label_solution' || item.feature === 'team_collaboration' ? (
                        <>
                          <FaGem className="mr-1" />
                          Upgrade to Pro
                        </>
                      ) : (
                        <>
                          <FaCrown className="mr-1" />
                          Upgrade to Premium
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              }
            >
              {/* This won't render since hasAccess is false */}
            </FeatureGate>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/create-post"
            className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaFileAlt className="mr-2" />
            Create New Post
          </Link>
          
          <FeatureGate feature="unlimited_posts" showUpgrade={false}>
            <Link
              to="/upload-profile-photo"
              className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaUpload className="mr-2" />
              Upload Profile Photo
            </Link>
          </FeatureGate>

          <Link
            to="/settings"
            className="flex items-center justify-center p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaCog className="mr-2" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
