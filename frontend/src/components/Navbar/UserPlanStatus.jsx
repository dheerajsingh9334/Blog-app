import { useQuery } from "@tanstack/react-query";
import { getUserPlanAndUsageAPI } from "../../APIServices/users/usersAPI";
import { getPlanBadge, getUpgradeButton } from "../../utils/planUtils";
import { Link } from "react-router-dom";
import { FaCrown, FaChartLine, FaExclamationTriangle } from "react-icons/fa";

const UserPlanStatus = () => {
  const { data: usageData, isLoading, error } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-4 w-20 rounded"></div>
      </div>
    );
  }

  if (error || !usageData?.usage) {
    return null;
  }

  const { usage } = usageData;
  const { plan, posts } = usage;
  const planBadge = getPlanBadge(plan);
  const upgradeButton = getUpgradeButton(plan);
  const isFreePlan = (plan?.tier?.toLowerCase?.() === 'free') || (/^free$/i.test(plan?.planName || ''));
  
  // Check if user is approaching or has reached limit
  const isNearLimit = posts.unlimited ? false : posts.current >= posts.limit * 0.8;
  const hasReachedLimit = posts.unlimited ? false : posts.current >= posts.limit;

  return (
    <div className="flex items-center space-x-2">
      {/* Plan Badge - Always show current plan */}
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${planBadge.className}`}>
        {plan.tier === 'pro' && <FaCrown className="mr-1" />}
        {plan.tier === 'premium' && <FaChartLine className="mr-1" />}
        {planBadge.text}
      </div>

      {/* Usage Status for non-unlimited plans */}
      {!posts.unlimited && (
        <div className="flex items-center space-x-1">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {posts.current}/{posts.limit}
          </div>
          {hasReachedLimit && (
            <FaExclamationTriangle className="text-red-500 text-xs" title="Post limit reached" />
          )}
          {isNearLimit && !hasReachedLimit && (
            <FaExclamationTriangle className="text-yellow-500 text-xs" title="Approaching post limit" />
          )}
        </div>
      )}

      {/* Upgrade Button for Free plan only */}
      {isFreePlan && upgradeButton && (
        <Link
          to="/dashboard/plan-management"
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${upgradeButton.className} hover:opacity-90 transition-opacity`}
        >
          {upgradeButton.text}
        </Link>
      )}
    </div>
  );
};

export default UserPlanStatus;
