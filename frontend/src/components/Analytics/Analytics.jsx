import { useQuery } from '@tanstack/react-query';
import { userProfileAPI } from '../../APIServices/users/usersAPI';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import PlanUpgradePrompt from '../Plans/PlanUpgradePrompt';
import { Link } from 'react-router-dom';
import { 
  FaEye, 
  FaThumbsUp, 
  FaComment, 
  FaCalendarAlt,
  FaGlobe,
  FaExternalLinkAlt
} from 'react-icons/fa';

const Analytics = () => {
  
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  const { canAccessFeature, userPlan } = usePlanAccess();

  // Check if user can access analytics
  const canAccess = canAccessFeature("advancedAnalytics");

  if (!canAccess) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <PlanUpgradePrompt 
            feature="Analytics"
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
  const totalFollowing = user?.following?.length || 0;
  const totalPosts = posts.length;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
    </div>
  );
};

export default Analytics;
