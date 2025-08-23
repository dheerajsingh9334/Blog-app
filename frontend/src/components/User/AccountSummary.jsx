import { useQuery } from "@tanstack/react-query";
import {
  FaEye,
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
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { userProfileAPI, getUserPlanAndUsageAPI, getUserPlanHistoryAPI } from "../../APIServices/users/usersAPI";
import { r } from "../../utils/unifiedResponsive";
// Earnings functionality removed
import { 
  getPlanTier, 
  getPlanInfo, 
  canCreatePost, 
  getUpgradeButton,
  PLAN_TIERS
} from "../../utils/planUtils";

const AccountSummaryDashboard = () => {
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  // Backend plan usage: posts per day and effective char limit
  const { data: planUsageData } = useQuery({
    queryKey: ["plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    staleTime: 60 * 1000,
  });

  // Plan change and billing history
  const { data: planHistoryData } = useQuery({
    queryKey: ["plan-history"],
    queryFn: getUserPlanHistoryAPI,
    staleTime: 2 * 60 * 1000,
  });

  const hasPlan = data?.user?.hasSelectedPlan;
  const userPlan = data?.user?.plan;
  // Removed email verification functionality

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
  // const totalEarnings = 0;

  // Get plan information
  const planTier = getPlanTier(userPlan);
  const planInfo = getPlanInfo(userPlan);
  const canPost = canCreatePost(userPlan, userPosts);
  const upgradeButton = getUpgradeButton(userPlan);

  // Calculate plan usage
  // Prefer backend usage (per-day) when available
  const backendPostsLimit = planUsageData?.usage?.posts?.limit ?? planInfo?.postLimit;
  const backendPostsUsed = planUsageData?.usage?.posts?.current ?? userPosts;
  const postsRemaining = backendPostsLimit != null ? Math.max(backendPostsLimit - backendPostsUsed, 0) : null;
  const usagePercentage = backendPostsLimit ? (backendPostsUsed / backendPostsLimit) * 100 : 0;

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
    <div className={`${r.spacing.containerSmall} space-y-4 sm:space-y-6`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className={`${r.text.h1} font-bold text-gray-900 dark:text-white`}>
          Welcome back, {data?.user?.username}! 👋
        </h1>
    {userPlan && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {planTier === PLAN_TIERS.PREMIUM && (
              <FaCrown className="text-yellow-500 text-xl" />
            )}
            {planTier === PLAN_TIERS.PRO && (
              <FaInfinity className="text-indigo-500 text-xl" />
      )}
            <span className={`px-3 py-1 rounded-full ${r.text.bodySmall} font-semibold ${
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
                className={`px-3 sm:px-4 py-2 rounded-lg ${r.text.bodySmall} font-semibold transition duration-200 ${upgradeButton.className}`}
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
              <h3 className={`${r.text.bodySmall} font-medium text-yellow-800 dark:text-yellow-200`}>
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

      {/* Removed email verification alert */}

      {/* {!hasEmail && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`${r.text.bodySmall} font-medium text-blue-800 dark:text-blue-200`}>
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
      )} */}

      {/* Plan Usage Section */}
      {userPlan && backendPostsLimit && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
            <h3 className={`${r.text.h4} font-semibold text-gray-900 dark:text-white`}>
              Plan Usage
            </h3>
            <span className={`${r.text.bodySmall} text-gray-500 dark:text-gray-400`}>
              {backendPostsUsed} / {backendPostsLimit} posts today
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
              ⚠️ Only {postsRemaining} posts remaining today. Consider upgrading your plan.
            </div>
          )}
          {postsRemaining === 0 && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              🚫 Daily post limit reached. Please upgrade your plan to continue posting.
            </div>
          )}
          {/* Character cap info */}
          {(() => {
            const charCap = planTier === PLAN_TIERS.FREE ? 1500 : planTier === PLAN_TIERS.PREMIUM ? 5000 : 10000;
            return (
              <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                Character limit per post: <b>{charCap.toLocaleString()}</b>
              </div>
            );
          })()}
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <h3 className={`${r.text.h4} font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4`}>
          Quick Actions
        </h3>
        <div className={`${r.layout.grid3} gap-3 sm:gap-4`}>
          {quickActions.map((action, index) => (
            <div key={index} className={`p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
              action.isLocked 
                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' 
                : 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <span className="text-xl sm:text-2xl">{action.icon}</span>
                {action.isLocked ? (
                  <FaLock className="text-gray-400 text-xs sm:text-sm" />
                ) : (
                  <FaUnlock className="text-green-500 text-xs sm:text-sm" />
                )}
              </div>
              <h4 className={`font-semibold text-gray-900 dark:text-white mb-1 ${r.text.bodySmall}`}>
                {action.title}
              </h4>
              <p className={`${r.text.bodySmall} text-gray-600 dark:text-gray-400 mb-2 sm:mb-3`}>
                {action.description}
              </p>
              {action.isLocked ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className={`${r.text.bodySmall} text-gray-500 dark:text-gray-400`}>
                    Requires {action.planRequired}
                  </span>
                  <Link
                    to="/pricing"
                    className="px-2 sm:px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition duration-200 text-center"
                  >
                    Upgrade
                  </Link>
                </div>
              ) : (
                <Link
                  to={action.href}
                  className="inline-block w-full text-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded-lg transition duration-200"
                >
                  {action.action}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`${r.layout.grid4} gap-3 sm:gap-4`}>
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} text-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-200`}>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="text-xl sm:text-2xl">{stat.icon}</div>
              <div>
                <div className={`${r.text.h3} font-semibold`}>{stat.value}</div>
                <div className={`${r.text.bodySmall} opacity-90`}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Features and History */}
      {userPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <h3 className={`${r.text.h4} font-semibold text-gray-900 dark:text-white mb-2`}>
              Your Plan Features
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {(userPlan?.features || []).filter(f => typeof f === 'string' && !/image\s*(customization|optimization)/i.test(f)).map((feat, i) => (
                <li key={i}>{feat}</li>
              ))}
              {(!userPlan?.features || userPlan.features.length === 0) && (
                <li>Standard access based on {planTier} plan.</li>
              )}
            </ul>
          </div>

          {/* History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <h3 className={`${r.text.h4} font-semibold text-gray-900 dark:text-white mb-2`}>
              Recent Plan & Billing Activity
            </h3>
            <div className="space-y-3">
              {/* Plan changes */}
              <div>
                <h4 className={`${r.text.bodySmall} font-semibold text-gray-800 dark:text-gray-200 mb-1`}>Plan Changes</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 max-h-48 overflow-auto">
                  {(planHistoryData?.history || [])
                    .slice()
                    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0,5)
                    .map((h) => (
                    <li key={h._id} className="flex items-center justify-between">
                      <span>
                        {new Date(h.createdAt).toLocaleDateString()} • {h.action} {h.fromPlan?.planName || h.fromPlan?.tier} → {h.toPlan?.planName || h.toPlan?.tier}
                      </span>
                      {h.discountApplied ? (
                        <span className="text-green-600 dark:text-green-400">- Discount</span>
                      ) : h.refundProcessed ? (
                        <span className="text-yellow-600 dark:text-yellow-400">Refunded</span>
                      ) : null}
                    </li>
                  ))}
                  {(!planHistoryData?.history || planHistoryData.history.length === 0) && (
                    <li>No plan changes yet.</li>
                  )}
                </ul>
              </div>

              {/* Billing */}
              <div>
                <h4 className={`${r.text.bodySmall} font-semibold text-gray-800 dark:text-gray-200 mb-1`}>Billing</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 max-h-48 overflow-auto">
                  {(planHistoryData?.billing || [])
                    .slice()
                    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0,5)
                    .map((b) => (
                    <li key={b.id} className="flex items-center justify-between">
                      <span>
                        {new Date(b.createdAt).toLocaleDateString()} • {b.plan?.planName || b.plan?.tier} • {new Intl.NumberFormat(undefined, { style: 'currency', currency: (b.currency || 'USD').toUpperCase() }).format(b.amount ?? 0)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${(['succeeded','success','paid'].includes((b.status||'').toLowerCase())) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {b.status}
                      </span>
                    </li>
                  ))}
                  {(!planHistoryData?.billing || planHistoryData.billing.length === 0) && (
                    <li>No billing records yet.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSummaryDashboard;
