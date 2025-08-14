import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userProfileAPI } from '../../APIServices/users/usersAPI';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import PlanUpgradePrompt from '../Plans/PlanUpgradePrompt';
import { Link } from 'react-router-dom';
import { 
  FaEye, 
  FaThumbsUp, 
  FaComment, 
  FaUsers, 
  FaChartLine, 
  FaCalendarAlt,
  FaGlobe,
  FaExternalLinkAlt,
  FaTimes
} from 'react-icons/fa';

const Analytics = () => {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showMonthDetails, setShowMonthDetails] = useState(false);
  
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  const { canAccessFeature, userPlan } = usePlanAccess();

  // Check if user can access analytics
  const canAccess = canAccessFeature("Advanced analytics");

  if (!canAccess) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <PlanUpgradePrompt 
            feature="Advanced Analytics"
            currentPlan={userPlan}
            requiredPlan="Premium"
            variant="default"
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">Failed to load analytics data. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const user = userData?.user;
  const posts = user?.posts || [];

  // Calculate analytics data from real user data
  const totalViews = posts.reduce((acc, post) => acc + (post.viewers?.length || 0), 0);
  const totalLikes = posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0);
  const totalComments = posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0);
  const totalFollowers = user?.followers?.length || 0;
  const totalFollowing = user?.following?.length || 0;
  const totalPosts = posts.length;

  const avgViewsPerPost = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;
  const avgLikesPerPost = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0;
  const avgCommentsPerPost = totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0;
  const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100).toFixed(1) : 0;

  // Generate real monthly data from user posts
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyData = {};

    // Initialize all months with 0
    months.forEach(month => {
      monthlyData[month] = 0;
    });

    // Calculate views for each month based on post creation dates
    posts.forEach(post => {
      if (post.createdAt) {
        const postDate = new Date(post.createdAt);
        if (postDate.getFullYear() === currentYear) {
          const monthName = months[postDate.getMonth()];
          const postViews = post.viewers?.length || 0;
          monthlyData[monthName] += postViews;
        }
      }
    });

    return months.map(month => ({
      month,
      views: monthlyData[month]
    }));
  };

  const monthlyViews = generateMonthlyData();
  const maxViews = Math.max(...monthlyViews.map(d => d.views), 1); // Prevent division by zero

  // Get top performing posts based on real data
  const topPosts = posts
    .map(post => ({
      ...post,
      views: post.viewers?.length || 0,
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Calculate additional real metrics
  const postsThisMonth = posts.filter(post => {
    if (!post.createdAt) return false;
    const postDate = new Date(post.createdAt);
    const now = new Date();
    return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
  }).length;

  // Get posts for selected month
  const getPostsForMonth = (monthName) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = months.indexOf(monthName);
    const currentYear = new Date().getFullYear();
    
    return posts.filter(post => {
      if (!post.createdAt) return false;
      const postDate = new Date(post.createdAt);
      return postDate.getMonth() === monthIndex && postDate.getFullYear() === currentYear;
    });
  };

  const handleBarClick = (monthData) => {
    setSelectedMonth(monthData);
    setShowMonthDetails(true);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Advanced Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get detailed insights about your content performance
          </p>
        </div>

        {/* Overview Stats with Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/dashboard/posts" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaEye className="h-8 w-8 text-blue-500" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Views
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {totalViews.toLocaleString()}
                    </dd>
                  </div>
                </div>
                <FaExternalLinkAlt className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </Link>

          <Link to="/dashboard/posts" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaThumbsUp className="h-8 w-8 text-green-500" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Likes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {totalLikes.toLocaleString()}
                    </dd>
                  </div>
                </div>
                <FaExternalLinkAlt className="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" />
              </div>
            </div>
          </Link>

          <Link to="/dashboard/posts" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaComment className="h-8 w-8 text-purple-500" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Comments
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {totalComments.toLocaleString()}
                    </dd>
                  </div>
                </div>
                <FaExternalLinkAlt className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
              </div>
            </div>
          </Link>

          <Link to="/dashboard/my-followers" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaUsers className="h-8 w-8 text-orange-500" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Followers
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {totalFollowers.toLocaleString()}
                    </dd>
                  </div>
                </div>
                <FaExternalLinkAlt className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </div>
            </div>
          </Link>
        </div>

        {/* Additional Stats with Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/dashboard/posts" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaCalendarAlt className="h-8 w-8 text-indigo-500" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Posts
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {totalPosts.toLocaleString()}
                    </dd>
                  </div>
                </div>
                <FaExternalLinkAlt className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              </div>
            </div>
          </Link>

          <Link to="/dashboard/my-followings" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaGlobe className="h-8 w-8 text-teal-500" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Following
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {totalFollowing.toLocaleString()}
                    </dd>
                  </div>
                </div>
                <FaExternalLinkAlt className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
              </div>
            </div>
          </Link>

          <Link to="/dashboard/posts" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaChartLine className="h-8 w-8 text-pink-500" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Posts This Month
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {postsThisMonth}
                    </dd>
                  </div>
                </div>
                <FaExternalLinkAlt className="h-4 w-4 text-gray-400 group-hover:text-pink-500 transition-colors" />
              </div>
            </div>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaThumbsUp className="h-8 w-8 text-yellow-500" />
              <div className="ml-5">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Engagement Rate
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {engagementRate}%
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Average Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Views per post</span>
                <span className="font-medium text-gray-900 dark:text-white">{avgViewsPerPost}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Likes per post</span>
                <span className="font-medium text-gray-900 dark:text-white">{avgLikesPerPost}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Comments per post</span>
                <span className="font-medium text-gray-900 dark:text-white">{avgCommentsPerPost}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Engagement rate</span>
                <span className="font-medium text-gray-900 dark:text-white">{engagementRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <FaChartLine className="mr-2 text-blue-500" /> Monthly Views Trend ({new Date().getFullYear()})
            </h3>
            {totalViews > 0 ? (
              <div className="h-64 flex items-end justify-between space-x-2">
                {monthlyViews.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-blue-500 hover:bg-blue-600 rounded-t w-full cursor-pointer transition-all duration-200 transform hover:scale-105"
                      style={{ 
                        height: `${(data.views / maxViews) * 200}px`,
                        minHeight: '20px'
                      }}
                      onClick={() => handleBarClick(data)}
                      title={`Click to see ${data.month} details`}
                    ></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{data.month}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{data.views}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No view data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Top Performing Posts
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Post Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Published
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {topPosts.length > 0 ? topPosts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/posts/${post._id}`}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {post.title || 'Untitled'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {post.views.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {post.likes.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {post.comments.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No posts yet. Start creating content to see analytics!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Month Details Modal */}
      {showMonthDetails && selectedMonth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedMonth.month} {new Date().getFullYear()} Details
              </h3>
              <button
                onClick={() => setShowMonthDetails(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedMonth.views}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {getPostsForMonth(selectedMonth.month).length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Posts Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {selectedMonth.views > 0 ? Math.round(selectedMonth.views / getPostsForMonth(selectedMonth.month).length) : 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Avg Views/Post</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Posts Published in {selectedMonth.month}
                </h4>
                <div className="space-y-3">
                  {getPostsForMonth(selectedMonth.month).length > 0 ? (
                    getPostsForMonth(selectedMonth.month).map((post) => (
                      <div key={post._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Link 
                              to={`/posts/${post._id}`}
                              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              {post.title || 'Untitled'}
                            </Link>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Published: {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {post.viewers?.length || 0} views
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {post.likes?.length || 0} likes • {post.comments?.length || 0} comments
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No posts published in {selectedMonth.month}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
