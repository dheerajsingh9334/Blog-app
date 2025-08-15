import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboardStatsAPI, getActivityFeedAPI, getAllUsersAPI, sendNotificationToAllAPI } from '../../APIServices/admin/adminAPI';
import AdminStats from './AdminStats';
import AdminDebug from './AdminDebug';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FaUsers, 
  FaFileAlt, 
  FaComments, 
  FaTags, 
  FaBell, 
  FaCog, 
  FaChartBar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaHeart,
  FaRocket
} from 'react-icons/fa';

const AdminMainDashboard = () => {
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: getDashboardStatsAPI,
    retry: 3,
    retryDelay: 1000,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-activity-feed'],
    queryFn: () => getActivityFeedAPI({ limit: 10 }),
    retry: 3,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  // Get top users by followers using real data
  const { data: topUsersData, isLoading: topUsersLoading } = useQuery({
    queryKey: ['admin-top-users'],
    queryFn: () => getAllUsersAPI({ limit: 10, sortBy: 'followers', sortOrder: 'desc' }),
    retry: 3,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  // Test notification mutation
  const queryClient = useQueryClient();
  const testNotificationMutation = useMutation({
    mutationFn: () => sendNotificationToAllAPI({
      title: "Test Admin Notification",
      message: "This is a test notification from the admin panel to verify the notification system is working properly.",
      type: "admin"
    }),
    onSuccess: () => {
      alert("Test notification sent successfully! Check the bell icon in the navbar.");
      queryClient.invalidateQueries(['admin-notifications']);
      queryClient.invalidateQueries(['admin-notification-count']);
    },
    onError: (error) => {
      alert("Failed to send test notification: " + (error.message || "Unknown error"));
    }
  });
  
  // Generate daily trend data from dashboard stats (last 7 days)
  const generateDailyTrendData = () => {
    const today = new Date();
    const dailyTrendData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Use dashboard data if available, otherwise use mock data
      const posts = dashboardData?.stats?.weeklyPosts?.[i] || Math.floor(Math.random() * 20) + 10;
      const likes = dashboardData?.stats?.weeklyLikes?.[i] || Math.floor(Math.random() * 50) + 30;
      const comments = dashboardData?.stats?.weeklyComments?.[i] || Math.floor(Math.random() * 30) + 15;
      const users = dashboardData?.stats?.weeklyUsers?.[i] || Math.floor(Math.random() * 15) + 8;
      
      dailyTrendData.push({
        date: dayName,
        posts,
        likes,
        comments,
        users
      });
    }
    
    return dailyTrendData;
  };
  
  // Generate user growth data (last 30 days)
  const generateUserGrowthData = () => {
    const today = new Date();
    const userGrowthData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Use real data if available, otherwise generate realistic mock data
      const newUsers = dashboardData?.stats?.dailyUsers?.[i] || Math.floor(Math.random() * 8) + 2;
      const cumulativeUsers = dashboardData?.stats?.cumulativeUsers?.[i] || (dashboardData?.stats?.totalUsers || 0) - (29 - i) * 5 + newUsers;
      
      userGrowthData.push({
        date: dateStr,
        newUsers,
        cumulativeUsers
      });
    }
    
    return userGrowthData;
  };

  // Generate category distribution data
  const generateCategoryData = () => {
    if (dashboardData?.stats?.categoryDistribution) {
      return dashboardData.stats.categoryDistribution.map(cat => ({
        name: cat.name,
        posts: cat.count,
        percentage: ((cat.count / dashboardData.stats.totalPosts) * 100).toFixed(1)
      }));
    }
    
    // Mock data if no real data available
    return [
      { name: 'Technology', posts: 45, percentage: 25.0 },
      { name: 'Lifestyle', posts: 38, percentage: 21.1 },
      { name: 'Business', posts: 32, percentage: 17.8 },
      { name: 'Health', posts: 28, percentage: 15.6 },
      { name: 'Entertainment', posts: 22, percentage: 12.2 },
      { name: 'Other', posts: 15, percentage: 8.3 }
    ];
  };

  // Generate engagement metrics
  const generateEngagementData = () => {
    const totalPosts = dashboardData?.stats?.totalPosts || 0;
    const totalLikes = dashboardData?.stats?.totalLikes || 0;
    const totalComments = dashboardData?.stats?.totalComments || 0;
    const totalViews = dashboardData?.stats?.totalViews || 0;
    
    return [
      { name: 'Likes', value: totalLikes, percentage: totalPosts > 0 ? ((totalLikes / totalPosts) * 100).toFixed(1) : 0 },
      { name: 'Comments', value: totalComments, percentage: totalPosts > 0 ? ((totalComments / totalPosts) * 100).toFixed(1) : 0 },
      { name: 'Views', value: totalViews, percentage: totalPosts > 0 ? ((totalViews / totalPosts) * 100).toFixed(1) : 0 }
    ];
  };
  
  const dailyTrendData = generateDailyTrendData();
  const userGrowthData = generateUserGrowthData();
  const categoryData = generateCategoryData();
  const engagementData = generateEngagementData();

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: FaUsers,
      href: '/admin/users',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Content Moderation',
      description: 'Review and moderate posts and comments',
      icon: FaFileAlt,
      href: '/admin/posts',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: FaCog,
      href: '/admin/settings',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Notifications',
      description: 'Send announcements to users',
      icon: FaBell,
      href: '/admin/notifications',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Categories',
      description: 'Manage content categories',
      icon: FaTags,
      href: '/admin/categories',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: FaChartBar,
      href: '/admin/analytics',
      color: 'bg-teal-500',
      hoverColor: 'hover:bg-teal-600',
      gradient: 'from-teal-500 to-teal-600'
    },
    {
      title: 'Plan Management',
      description: 'Manage subscription plans',
      icon: FaRocket,
      href: '/admin/plans',
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      gradient: 'from-pink-500 to-pink-600'
    }
  ];

  // Real activity feed data from API
  const activityFeed = activityData?.activities || [];

  // Real performance metrics from dashboard data
  const performanceMetrics = [
    { 
      name: 'Total Users', 
      value: dashboardData?.stats?.totalUsers || 0, 
      change: dashboardData?.stats?.recentUsers ? `+${dashboardData.stats.recentUsers}` : '+0', 
      trend: 'up', 
      icon: FaUsers 
    },
    { 
      name: 'Total Posts', 
      value: dashboardData?.stats?.totalPosts || 0, 
      change: '+0', 
      trend: 'up', 
      icon: FaFileAlt 
    },
    { 
      name: 'Total Comments', 
      value: dashboardData?.stats?.totalComments || 0, 
      change: '+0', 
      trend: 'up', 
      icon: FaComments 
    },
    { 
      name: 'Total Views', 
      value: dashboardData?.stats?.totalViews || 0, 
      change: '+0', 
      trend: 'up', 
      icon: FaChartBar 
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-center">
            <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Unable to load dashboard statistics. Please try again later.</p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-sm p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                             <p className="text-blue-100 text-lg">
                 Welcome back! Here&apos;s what&apos;s happening with your platform today.
               </p>
              <div className="flex items-center mt-4 text-blue-100">
                <FaClock className="mr-2" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="hidden md:block">
              <FaRocket className="h-16 w-16 text-blue-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${metric.trend === 'up' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                  <Icon className={`h-6 w-6 ${metric.color || 'text-gray-600 dark:text-gray-400'}`} />
                </div>
              </div>
              <div className="flex items-center mt-2">
                {metric.trend === 'up' ? (
                  <FaArrowUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <FaArrowDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <AdminStats stats={dashboardData?.stats} isLoading={isLoading} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.title}
                href={action.href}
                className={`group p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 bg-gradient-to-r ${action.gradient} text-white`}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-lg bg-white/20 mr-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {action.title}
                  </h3>
                </div>
                <p className="text-blue-100 text-sm">
                  {action.description}
                </p>
              </a>
            );
          })}
        </div>
      </div>

      {/* System Status & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <FaCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">System Online</p>
                <p className="text-sm text-green-600 dark:text-green-400">All services operational</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FaUsers className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Active Users</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">{dashboardData?.stats?.totalUsers || 0} registered</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <FaFileAlt className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <p className="font-medium text-purple-900 dark:text-purple-100">Content</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">{dashboardData?.stats?.totalPosts || 0} posts</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <FaComments className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
              <div>
                <p className="font-medium text-orange-900 dark:text-orange-100">Comments</p>
                <p className="text-sm text-orange-600 dark:text-orange-400">{dashboardData?.stats?.totalComments || 0} total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Engagement Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">User Engagement Analytics</h2>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Likes', value: dashboardData?.stats?.totalLikes || 0, color: '#ef4444' },
                  { name: 'Comments', value: dashboardData?.stats?.totalComments || 0, color: '#3b82f6' },
                  { name: 'Views', value: dashboardData?.stats?.totalViews || 0, color: '#10b981' },
                  { name: 'Shares', value: dashboardData?.stats?.totalShares || 0, color: '#f59e0b' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Users Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Users by Followers</h2>
            {topUsersLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : topUsersData?.users && topUsersData.users.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topUsersData.users.slice(0, 5).map((user, index) => ({
                  name: user.username || user.name || 'Unknown User',
                  followers: Array.isArray(user.followers) ? user.followers.length : (typeof user.followers === 'object' ? Object.keys(user.followers || {}).length : 0),
                  posts: Array.isArray(user.posts) ? user.posts.length : (typeof user.posts === 'object' ? Object.keys(user.posts || {}).length : 0),
                  color: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][index % 5]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="followers" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>No user data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Post Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Daily Trends - Last 7 Days</h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={2} name="Posts Created" />
                <Line type="monotone" dataKey="likes" stroke="#ef4444" strokeWidth={2} name="Total Likes" />
                <Line type="monotone" dataKey="comments" stroke="#10b981" strokeWidth={2} name="Total Comments" />
                <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">User Growth - Last 30 Days</h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="newUsers" stroke="#10b981" strokeWidth={2} name="New Users" />
                <Line yAxisId="right" type="monotone" dataKey="cumulativeUsers" stroke="#3b82f6" strokeWidth={2} name="Total Users" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Content by Category</h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 50}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Engagement Metrics Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Engagement Metrics</h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === 'value' ? 'Count' : 'Percentage']} />
                <Legend />
                <Bar dataKey="value" fill="#ef4444" name="Count" />
                <Bar dataKey="percentage" fill="#10b981" name="Percentage" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          {activityLoading ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start space-x-3 p-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activityFeed.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activityFeed.map((activity) => {
                // Map icon strings to actual icon components
                let IconComponent;
                switch (activity.icon) {
                  case 'FaUsers':
                    IconComponent = FaUsers;
                    break;
                  case 'FaFileAlt':
                    IconComponent = FaFileAlt;
                    break;
                  case 'FaComments':
                    IconComponent = FaComments;
                    break;
                  case 'FaCrown':
                    IconComponent = FaRocket; // Using rocket as crown alternative
                    break;
                  default:
                    IconComponent = FaUsers;
                }
                
                // Format time
                const timeAgo = (() => {
                  const now = new Date();
                  const activityTime = new Date(activity.time);
                  const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
                  
                  if (diffInMinutes < 1) return 'Just now';
                  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
                  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
                  return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
                })();
                
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${activity.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timeAgo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
              View all activity →
            </button>
          </div>
        </div>
      </div>

      {/* Debug Component */}
      <AdminDebug />
    </div>
  );
};

export default AdminMainDashboard;
