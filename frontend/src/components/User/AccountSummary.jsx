import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  FaEye,
  FaDollarSign,
  FaUsers,
  FaThumbsUp,
  FaThumbsDown,
  FaFlag,
  FaCommentDots,
  FaCrown,
  FaInfinity,
  FaLock,
  FaUnlock,
  FaBookmark,
  FaStar,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { userProfileAPI } from "../../APIServices/users/usersAPI";
import AlertMessage from "../Alert/AlertMessage";
// Earnings functionality removed
import { 
  getPlanTier, 
  getPlanInfo, 
  canCreatePost, 
  getUpgradePrompt, 
  getUpgradeButton,
  PLAN_TIERS, 
  getPlanBadge
} from "../../utils/planUtils";

const AccountSummaryDashboard = () => {
  const { userAuth } = useSelector((state) => state.auth);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  const hasEmail = data?.user?.email;
  const hasPlan = data?.user?.hasSelectedPlan;
  const userPlan = data?.user?.plan;

  const totalFollowers = data?.user?.followers?.length || 0;
  const totalFollowing = data?.user?.following?.length || 0;
  const userPosts = data?.user?.posts?.length || 0;

  // Initialize stats
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalDislikes = 0;

  data?.user?.posts?.forEach((post) => {
    totalViews += post.viewers?.length || 0;
    totalLikes += post.likes?.length || 0;
    totalDislikes += post.dislikes?.length || 0;
    totalComments += post.comments?.length || 0;
  });

  // Earnings functionality removed
  const totalEarnings = 0;

  // Get plan information
  const planTier = getPlanTier(userPlan);
  const planInfo = getPlanInfo(userPlan);
  const canPost = canCreatePost(userPlan, userPosts);
  const upgradeButton = getUpgradeButton(userPlan);

  // Calculate plan usage
  const postLimit = planInfo?.postLimit;
  const postsUsed = userPosts;
  const postsRemaining = postLimit ? postLimit - postsUsed : null;
  const usagePercentage = postLimit ? (postsUsed / postLimit) * 100 : 0;

  // Quick action cards based on plan
  const quickActions = [
    {
      title: "Create Post",
      description: "Share your thoughts with the community",
      icon: "✍️",
      action: canPost ? "Create" : "Upgrade Required",
      href: canPost ? "/dashboard/create-post" : null,
      isLocked: !canPost,
      planRequired: canPost ? null : planTier === PLAN_TIERS.FREE ? "Premium" : "Pro"
    },
    {
      title: "Advanced Analytics",
      description: "Get detailed insights about your content",
      icon: "📊",
      action: planTier !== PLAN_TIERS.FREE ? "View" : "Upgrade Required",
      href: planTier !== PLAN_TIERS.FREE ? "/dashboard/analytics" : null,
      isLocked: planTier === PLAN_TIERS.FREE,
      planRequired: planTier === PLAN_TIERS.FREE ? "Premium" : null
    },
    // SEO Tools removed
    {
      title: "Content Calendar",
      description: "Plan and schedule your content",
      icon: "📅",
      action: planTier !== PLAN_TIERS.FREE ? "Open" : "Upgrade Required",
      href: planTier !== PLAN_TIERS.FREE ? "/dashboard/content-calendar" : null,
      isLocked: planTier === PLAN_TIERS.FREE,
      planRequired: planTier === PLAN_TIERS.FREE ? "Premium" : null
    },
    // Team Collaboration and API Access removed
  ];

  const stats = [
    { icon: <FaEye />, label: "Views", value: totalViews, bgColor: "bg-blue-500" },
    { icon: <FaUsers />, label: "Followers", value: totalFollowers, bgColor: "bg-purple-500" },
    { icon: <FaThumbsUp />, label: "Likes", value: totalLikes, bgColor: "bg-yellow-500" },
    { icon: <FaThumbsDown />, label: "Dislikes", value: totalDislikes, bgColor: "bg-red-500" },
    { icon: <FaUsers />, label: "Following", value: totalFollowing, bgColor: "bg-indigo-500" },
    { icon: <FaFlag />, label: "Posts", value: userPosts, bgColor: "bg-pink-500" },
    { icon: <FaCommentDots />, label: "Comments", value: totalComments, bgColor: "bg-teal-500" },
    { icon: <FaBookmark />, label: "Saved Posts", value: data?.user?.savedPosts?.length || 0, bgColor: "bg-purple-500" },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {data?.user?.username}! 👋
        </h1>
        {userPlan && (
          <div className="flex items-center gap-2">
            {planTier === PLAN_TIERS.PREMIUM && (
              <FaCrown className="text-yellow-500 text-xl" />
            )}
            {planTier === PLAN_TIERS.PRO && (
              <FaInfinity className="text-indigo-500 text-xl" />
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              planTier === PLAN_TIERS.FREE 
                ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                : planTier === PLAN_TIERS.PREMIUM
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
            }`}>
              {userPlan.planName?.toUpperCase() || planTier.toUpperCase()}
            </span>
            {upgradeButton && (
              <Link
                to={upgradeButton.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition duration-200 ${upgradeButton.className}`}
              >
                {upgradeButton.text}
              </Link>
            )}
          </div>
        )}
      </div>

      {!hasPlan && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaCrown className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Plan Selection Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  Please{" "}
                  <Link to="/pricing" className="font-medium underline hover:text-yellow-600 dark:hover:text-yellow-400">
                    select a plan
                  </Link>{" "}
                  to continue using our services and unlock more features.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!hasEmail && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Email Required
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  Please{" "}
                  <Link to="/add-email" className="font-medium underline hover:text-blue-600 dark:hover:text-blue-400">
                    add an email
                  </Link>{" "}
                  to your account for important notifications and account recovery.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Usage Section */}
      {userPlan && postLimit && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Plan Usage
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {postsUsed} / {postLimit} posts used
            </span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Posts</span>
              <span>{Math.round(usagePercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  usagePercentage >= 90 
                    ? "bg-red-500" 
                    : usagePercentage >= 75 
                    ? "bg-yellow-500" 
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
          {postsRemaining !== null && postsRemaining <= 3 && postsRemaining > 0 && (
            <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ Only {postsRemaining} posts remaining. Consider upgrading your plan.
            </div>
          )}
          {postsRemaining === 0 && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              🚫 Post limit reached. Please upgrade your plan to continue posting.
            </div>
          )}
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <div key={index} className={`p-4 rounded-lg border transition-all duration-200 ${
              action.isLocked 
                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' 
                : 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{action.icon}</span>
                {action.isLocked ? (
                  <FaLock className="text-gray-400 text-sm" />
                ) : (
                  <FaUnlock className="text-green-500 text-sm" />
                )}
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {action.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {action.description}
              </p>
              {action.isLocked ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Requires {action.planRequired}
                  </span>
                  <Link
                    to="/pricing"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition duration-200"
                  >
                    Upgrade
                  </Link>
                </div>
              ) : (
                <Link
                  to={action.href}
                  className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition duration-200"
                >
                  {action.action}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200`}>
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{stat.icon}</div>
              <div>
                <div className="text-xl font-semibold">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountSummaryDashboard;
