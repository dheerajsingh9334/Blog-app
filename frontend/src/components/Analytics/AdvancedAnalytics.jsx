import { ChartBarIcon, ChartPieIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const AdvancedAnalytics = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Detailed insights and performance metrics for your content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Traffic Overview */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
                <h3 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">Traffic Overview</h3>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">12.5K</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total visitors this month</div>
              </div>
            </div>

            {/* Engagement Rate */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
                <h3 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">Engagement Rate</h3>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">68%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Average engagement rate</div>
              </div>
            </div>

            {/* Content Performance */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ChartPieIcon className="h-8 w-8 text-purple-500" />
                <h3 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">Content Performance</h3>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">94%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Content performance score</div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Metrics</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Page Views</span>
                  <span className="font-semibold text-gray-900 dark:text-white">25,430</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Unique Visitors</span>
                  <span className="font-semibold text-gray-900 dark:text-white">12,543</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Bounce Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">32%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Average Session Duration</span>
                  <span className="font-semibold text-gray-900 dark:text-white">4m 23s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
