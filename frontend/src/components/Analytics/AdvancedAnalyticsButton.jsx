import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaEye, FaHeart, FaComment, FaChartLine, FaTimes, FaCrown, FaClock } from 'react-icons/fa';
import { hasAnalytics, hasReaderAnalytics } from '../../utils/planUtils';
import { getPostAnalyticsAPI } from '../../APIServices/posts/postsAPI';

const AdvancedAnalyticsButton = ({ post, userPlan, isAuthor = false }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const hasAnalyticsAccess = hasAnalytics(userPlan);
  const hasReaderAccess = hasReaderAnalytics(userPlan);

  // Fetch detailed analytics when opening modal
  const fetchAnalytics = useCallback(async () => {
    if (!post?._id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await getPostAnalyticsAPI(post._id);
      setAnalyticsData(response.analytics);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      // Fallback to basic post data
      setAnalyticsData({
        totalViews: post.viewsCount || 0,
        totalLikes: post.likes?.length || 0,
        totalComments: post.comments?.length || 0,
        viewers: post.viewers || [],
        likers: post.likes || [],
        comments: post.comments || []
      });
    } finally {
      setLoading(false);
    }
  }, [post]);

  useEffect(() => {
    if (showAnalytics && !analyticsData) {
      fetchAnalytics();
    }
  }, [showAnalytics, analyticsData, fetchAnalytics]);

  if (!hasAnalyticsAccess || !isAuthor) {
    return null;
  }

  const handleDeleteComment = (commentId) => {
    // Handle comment deletion
    console.log('Deleting comment:', commentId);
  };

  return (
    <>
      <button
        onClick={() => setShowAnalytics(true)}
        className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        title="View Advanced Analytics"
      >
        <FaChartLine size={16} />
        <span className="text-sm font-medium">Analytics</span>
        <FaCrown size={12} className="text-yellow-300" />
      </button>

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600">
              <div className="flex items-center space-x-3">
                <FaChartLine className="text-white" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-white">Advanced Analytics</h2>
                  <p className="text-purple-100 text-sm">Detailed insights for your post</p>
                </div>
                <FaCrown className="text-yellow-300" size={20} />
              </div>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-2">⚠️ Error loading detailed analytics</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</div>
                  <button 
                    onClick={fetchAnalytics}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : analyticsData ? (
                <>
                  {/* Stats Overview */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                      <FaEye className="mx-auto text-blue-600 dark:text-blue-400 mb-2" size={24} />
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analyticsData.totalViews}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Total Views</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                      <FaHeart className="mx-auto text-red-600 dark:text-red-400 mb-2" size={24} />
                      <div className="text-2xl font-bold text-red-900 dark:text-red-100">{analyticsData.totalLikes}</div>
                      <div className="text-sm text-red-600 dark:text-red-400">Total Likes</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                      <FaComment className="mx-auto text-green-600 dark:text-green-400 mb-2" size={24} />
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100">{analyticsData.totalComments}</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Total Comments</div>
                    </div>
                  </div>

                  {/* Detailed Analytics Tabs */}
                  <div className="space-y-6">
                    {/* Who Viewed */}
                    {hasReaderAccess && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <FaEye className="mr-2 text-blue-600" />
                          Who Viewed Your Post
                          <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">PRO</span>
                        </h3>
                        <div className="space-y-3">
                          {analyticsData.viewers.length > 0 ? analyticsData.viewers.map((viewer, index) => (
                            <div key={viewer._id || index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={viewer.profilePicture || '/default-avatar.png'}
                                  alt={viewer.username || 'User'}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{viewer.username || 'Anonymous'}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Recent viewer</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                  <FaClock className="mr-1" size={12} />
                                  Recently
                                </p>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                              No viewers yet
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Who Liked */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <FaHeart className="mr-2 text-red-600" />
                        Who Liked Your Post
                      </h3>
                      <div className="space-y-3">
                        {analyticsData.likers.length > 0 ? analyticsData.likers.map((liker, index) => (
                          <div key={liker._id || index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <img
                                src={liker.profilePicture || '/default-avatar.png'}
                                alt={liker.username || 'User'}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <p className="font-medium text-gray-900 dark:text-white">{liker.username || 'Anonymous'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <FaClock className="mr-1" size={12} />
                                Recently
                              </p>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                            No likes yet
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comments Management */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <FaComment className="mr-2 text-green-600" />
                        Comment Management
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">AUTHOR</span>
                      </h3>
                      <div className="space-y-3">
                        {analyticsData.comments && analyticsData.comments.length > 0 ? analyticsData.comments.map((comment, index) => (
                          <div key={comment._id || index} className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <img
                                  src={comment.author?.profilePicture || '/default-avatar.png'}
                                  alt={comment.author?.username || 'User'}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="font-medium text-gray-900 dark:text-white">{comment.author?.username || 'Anonymous'}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                      <FaClock className="mr-1" size={12} />
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.content || comment.text || 'No content'}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                                title="Delete comment"
                              >
                                <FaTimes size={14} />
                              </button>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                            No comments yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

AdvancedAnalyticsButton.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    viewsCount: PropTypes.number,
    likes: PropTypes.array,
    comments: PropTypes.array,
    viewers: PropTypes.array
  }).isRequired,
  userPlan: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  isAuthor: PropTypes.bool
};

export default AdvancedAnalyticsButton;
