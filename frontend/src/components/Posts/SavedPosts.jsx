import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FaEye, FaHeart, FaComment, FaBookmark, FaTrash, FaArrowLeft } from "react-icons/fa";
import { getSavedPostsAPI, unsavePostAPI } from "../../APIServices/users/usersAPI";

const SavedPosts = () => {
  const queryClient = useQueryClient();

  // Fetch saved posts
  const { data: savedPostsData, isLoading, isError, error } = useQuery({
    queryKey: ["saved-posts"],
    queryFn: getSavedPostsAPI,
  });

  // Unsave post mutation
  const unsaveMutation = useMutation({
    mutationFn: unsavePostAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });

  const handleUnsave = async (postId) => {
    if (window.confirm("Remove this post from saved posts?")) {
      await unsaveMutation.mutateAsync(postId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading saved posts...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error loading saved posts</p>
          <p className="text-gray-600 dark:text-gray-300">{error.message}</p>
        </div>
      </div>
    );
  }

  const savedPosts = savedPostsData?.savedPosts || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Saved Posts
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Posts you&apos;ve saved for later reading • {savedPosts.length} posts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FaBookmark className="h-4 w-4" />
              <span>{savedPosts.length} saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {savedPosts.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBookmark className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              No saved posts yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              When you save posts, they&apos;ll appear here for easy access later.
              Start exploring and save posts you want to read again!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/posts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaEye className="h-4 w-4" />
                Explore Posts
              </Link>
              <Link
                to="/trending"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FaHeart className="h-4 w-4" />
                Trending Posts
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Post Image */}
                {post.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={typeof post.image === 'string' ? post.image : post.image?.path}
                      alt={post.title || "Post image"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {/* Unsave Button */}
                    <button
                      onClick={() => handleUnsave(post._id)}
                      disabled={unsaveMutation.isPending}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Remove from saved posts"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="p-6">
                  {/* Author Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/user/${post.author?._id}`}>
                        <img
                          src={post.author?.profilePicture?.path || post.author?.profilePicture || `https://ui-avatars.com/api/?name=${post.author?.username}&background=random&color=fff`}
                          alt={post.author?.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </Link>
                      <div>
                        <Link
                          to={`/user/${post.author?._id}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {post.author?.username}
                        </Link>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Title */}
                  <Link to={`/posts/${post._id}`}>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {post.title || "Untitled"}
                    </h3>
                  </Link>

                  {/* Category */}
                  {post.category && (
                    <div className="mb-4">
                      <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                        {post.category?.categoryName}
                      </span>
                    </div>
                  )}

                  {/* Post Description */}
                  <div
                    className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: post.description?.substring(0, 150) + (post.description?.length > 150 ? '...' : '')
                    }}
                  />

                  {/* Post Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <FaEye className="h-4 w-4" />
                        {post.viewers?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaHeart className="h-4 w-4" />
                        {post.likes?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaComment className="h-4 w-4" />
                        {post.comments?.length || 0}
                      </span>
                    </div>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Read More Button */}
                  <div className="mt-4">
                    <Link
                      to={`/posts/${post._id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPosts;