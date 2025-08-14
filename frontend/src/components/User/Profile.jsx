import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { userProfileAPI, getUserPlanAndUsageAPI } from "../../APIServices/users/usersAPI";
import { Link } from "react-router-dom";
import { FaCamera, FaExclamationTriangle, FaCrown, FaChartLine, FaGift, FaDollarSign, FaEdit, FaUser, FaEnvelope, FaCalendar, FaMapMarkerAlt, FaLink, FaSpinner, FaFileAlt, FaSun, FaMoon } from "react-icons/fa";
import { getPlanBadge, getUpgradeButton } from "../../utils/planUtils";
import Avatar from "./Avatar";

const Profile = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode state
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldBeDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const { isError, isLoading, data, error, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaExclamationTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Profile Loading Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error?.message || "Unable to load your profile. Please try again."}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const user = data?.user;
  const usage = usageData?.usage;
  const planBadge = usage ? getPlanBadge(usage.plan) : null;
  const upgradeButton = usage ? getUpgradeButton(usage.plan) : null;

  // Check if user is approaching or has reached limit
  const isNearLimit = usage && !usage.posts.unlimited ? usage.posts.current >= usage.posts.limit * 0.8 : false;
  const hasReachedLimit = usage && !usage.posts.unlimited ? usage.posts.current >= usage.posts.limit : false;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaUser className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No User Data</h2>
          <p className="text-gray-500">Unable to load user information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Plan Status Banner */}
      {usage && (
        <div className="mb-6 p-6 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {usage.plan.tier === 'pro' && <FaCrown className="text-yellow-500 text-2xl" />}
              {usage.plan.tier === 'premium' && <FaChartLine className="text-green-500 text-2xl" />}
              {usage.plan.tier === 'free' && <FaGift className="text-blue-500 text-2xl" />}
              
              <div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${planBadge?.className}`}>
                    {planBadge?.text}
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {usage.plan.planName || 'Current Plan'}
                  </span>
                </div>
                
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {usage.posts.unlimited ? (
                    <span className="text-green-600 dark:text-green-400">Unlimited posts available</span>
                  ) : (
                    <span className={hasReachedLimit ? 'text-red-600 dark:text-red-400' : isNearLimit ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}>
                      {usage.posts.current} of {usage.posts.limit} posts used
                      {hasReachedLimit && ' - Limit reached!'}
                      {isNearLimit && !hasReachedLimit && ' - Approaching limit!'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {upgradeButton && (
              <Link
                to={upgradeButton.href}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${upgradeButton.className}`}
              >
                {upgradeButton.icon && <upgradeButton.icon className="mr-2" />}
                {upgradeButton.text}
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="h-32 w-32">
                <Avatar
                  user={user}
                  size="3xl"
                  className="h-32 w-32"
                />
              </div>
              <Link
                to="/dashboard/upload-profile-photo"
                className="absolute bottom-2 right-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 shadow-lg transition-colors"
                title="Edit Profile Image"
              >
                <FaCamera className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{user?.username}</h1>
              <p className="text-blue-100 text-lg mb-4">{user?.email}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">{user?.followers?.length || 0}</div>
                  <div className="text-blue-100">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{user?.following?.length || 0}</div>
                  <div className="text-blue-100">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{user?.posts?.length || 0}</div>
                  <div className="text-blue-100">Posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Link
              to="/dashboard/plan-management"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <FaCrown className="mr-2" />
              Manage Plan
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Toggle dark mode"
              >
                {isDarkMode ? (
                  <FaSun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <FaMoon className="h-5 w-5 text-gray-600" />
                )}
              </button>
              <Link
                to="/dashboard/settings"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <FaEnvelope className="mr-3 text-gray-400 w-4" />
                  <span className="text-gray-600 dark:text-gray-300">{user?.email || 'No email provided'}</span>
                </div>
                {user?.bio && (
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-300">{user.bio}</span>
                  </div>
                )}
                {user?.location && (
                  <div className="flex items-center text-sm">
                    <FaMapMarkerAlt className="mr-3 text-gray-400 w-4" />
                    <span className="text-gray-600 dark:text-gray-300">{user.location}</span>
                  </div>
                )}
                {user?.website && (
                  <div className="flex items-center text-sm">
                    <FaLink className="mr-3 text-gray-400 w-4" />
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {user.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <FaCalendar className="mr-3 text-gray-400 w-4" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Joined {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user?.isBanned ? 'Banned' : 'Active'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Role</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user?.role || 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Your Posts</h3>
            {user?.posts?.length === 0 ? (
              <div className="text-center py-12">
                <FaFileAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No posts yet</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Start creating content to see your posts here.</p>
                <Link
                  to="/dashboard/create-post"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Create Your First Post
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user?.posts?.map((post) => {
                  const imageUrl = typeof post.image === 'string' ? post.image : post.image?.path;
                  return (
                    <div key={post._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {imageUrl && (
                        <img src={imageUrl} alt="Post" className="w-full h-48 object-cover" />
                      )}
                      <div className="p-4">
                        <Link to={`/posts/${post._id}`} className="block">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title || "Untitled"}
                          </h4>
                        </Link>
                        <div className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3" 
                             dangerouslySetInnerHTML={{ __html: post.description }} />
                        <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                          Created: {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/posts/${post._id}`}
                            className="flex-1 text-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-sm transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            to={`/edit-post/${post._id}`}
                            className="flex-1 text-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
