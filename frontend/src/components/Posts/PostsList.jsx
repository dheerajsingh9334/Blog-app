import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaBookmark, FaRegBookmark, FaSort, FaEye, FaHeart, FaComment, FaTags } from "react-icons/fa";
import { fetchAllPosts, fetchTrendingPostsAPI, getPopularTagsAPI } from "../../APIServices/posts/postsAPI";
import { fetchCategoriesAPI } from "../../APIServices/category/categoryAPI";
import { savePostAPI, unsavePostAPI, userProfileAPI } from "../../APIServices/users/usersAPI";
import Avatar from "../User/Avatar";

const PostsList = () => {
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("latest");
  const [selectedTags, setSelectedTags] = useState([]);
  const navigate = useNavigate();

  // Handle URL parameters for tag filtering
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tagParam = searchParams.get('tag');
    if (tagParam && !selectedTags.includes(tagParam)) {
      setSelectedTags([tagParam]);
      setPage(1);
    }
  }, [window.location.search]);

  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ["posts", { ...filters, page, tags: selectedTags }],
    queryFn: () => {
      const params = { 
        ...filters, 
        title: searchTerm, 
        page, 
        limit: 20,
        tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined
      };
      console.log("🔍 Fetching posts with params:", params);
      return fetchAllPosts(params);
    },
  });

  // Refetch when selectedTags change
  useEffect(() => {
    console.log("🔄 selectedTags changed:", selectedTags);
    if (selectedTags.length > 0 || selectedTags.length === 0) {
      console.log("🔄 Triggering refetch due to tag change");
      refetch();
    }
  }, [selectedTags, refetch]);

  // Debug logging
  console.log("Posts data:", data);
  console.log("Posts error:", error);
  console.log("Posts loading:", isLoading);

  const { data: categories } = useQuery({
    queryKey: ["category-lists"],
    queryFn: fetchCategoriesAPI,
  });

  // Fetch popular tags for filtering
  const { data: popularTags } = useQuery({
    queryKey: ["popular-tags"],
    queryFn: () => getPopularTagsAPI(30),
  });

  // Fetch trending posts for the scroll card
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-posts-preview"],
    queryFn: fetchTrendingPostsAPI,
  });

  // Fetch profile for save functionality
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  const queryClient = useQueryClient();

  // Save/unsave mutations
  const savePostMutation = useMutation({
    mutationFn: savePostAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });

  const unsavePostMutation = useMutation({
    mutationFn: unsavePostAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Save post handler
  const handleSavePost = async (postId) => {
    if (!profileData?.user) return;
    
    const isSaved = profileData.user.savedPosts?.some(
      (savedPostId) => savedPostId?.toString() === postId?.toString()
    );
    
    if (isSaved) {
      await unsavePostMutation.mutateAsync(postId);
    } else {
      await savePostMutation.mutateAsync(postId);
    }
  };

  const handleCategoryFilter = (categoryId) => {
    setFilters({ ...filters, category: categoryId });
    setPage(1);
    refetch();
  };

  const handleTagFilter = (tag) => {
    console.log("🔍 Tag filter clicked:", tag);
    console.log("🔍 Current selectedTags:", selectedTags);
    
    if (selectedTags.includes(tag)) {
      const newTags = selectedTags.filter(t => t !== tag);
      console.log("🔍 Removing tag, new tags:", newTags);
      setSelectedTags(newTags);
    } else {
      const newTags = [...selectedTags, tag];
      console.log("🔍 Adding tag, new tags:", newTags);
      setSelectedTags(newTags);
    }
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilters({});
    setSelectedTags([]);
    setSearchTerm("");
    setPage(1);
    refetch();
  };


  // Estimate reading time from HTML (~200 wpm)
  const estimateReadingTimeFromHtml = useMemo(() => (html) => {
    if (!html) return 1;
    const text = String(html).replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 w-full">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Discover Amazing Stories
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore the latest posts, trending topics, and stories from our community of writers and creators.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between w-full">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md w-full">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </form>

            {/* Sort and Filter Controls */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Popular</option>
                  <option value="trending">Trending</option>
                  <option value="oldest">Oldest</option>
                </select>
                <FaSort className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category Filters - Always Visible */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg w-full">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Filter by Category</h3>
            <div className="flex flex-wrap gap-2 w-full">
              <button
                onClick={() => {
                  setFilters({});
                  setPage(1);
                  refetch();
                }}
                className={`px-2 py-1 rounded-full text-xs transition-colors ${
                  !filters.category
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500'
                }`}
              >
                All Categories
              </button>
              {categories?.categories?.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryFilter(category._id)}
                  className={`px-2 py-1 rounded-full text-xs transition-colors ${
                    filters.category === category._id
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500'
                  }`}
                >
                  {category.categoryName}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Filters - Always Visible */}
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg w-full">
            <div className="flex items-center gap-2 mb-2">
              <FaTags className="text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filter by Tags</h3>
            </div>
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Selected tags:</p>
                  <div className="flex flex-wrap gap-1 w-full">
                    {selectedTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagFilter(tag)}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        {tag} ×
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Tags */}
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Popular tags:</p>
                <div className="flex flex-wrap gap-1 w-full">
                  {popularTags?.popularTags?.slice(0, 12).map((tagData) => (
                    <button
                      key={tagData._id}
                      onClick={() => handleTagFilter(tagData._id)}
                      className={`px-1.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        selectedTags.includes(tagData._id)
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500'
                      }`}
                    >
                      #{tagData._id} ({tagData.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear All Filters Button */}
              {(selectedTags.length > 0 || filters.category || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="mt-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors text-xs"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Trending Scroll Card */}
      <div className="mb-8 w-full overflow-x-hidden px-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Trending Now</h2>
          <Link
            to="/trending"
            className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
          >
            See All Trending
          </Link>
        </div>
        <div className="overflow-x-auto flex gap-6 py-2 w-full">
          {trendingLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            trendingData?.posts?.slice(0, 8).map((post) => (
              <Link
                to={`/posts/${post._id}`}
                key={post._id}
                className="min-w-[260px] bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col"
                title={post.title}
              >
                <img
                  src={
                    typeof post.image === "string"
                      ? post.image
                      : post.image?.path || "https://via.placeholder.com/260x120"
                  }
                  alt={post.title || "Trending post image"}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="text-md font-semibold mb-1 truncate">
                    {post.title || "Untitled"}
                  </h3>
                  <span className="text-xs text-gray-500 mb-1">
                    {post.author?.username || "Unknown"}
                  </span>
                  <span className="text-xs text-green-700">
                    {post.category?.categoryName}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="w-full px-2 sm:px-4 lg:px-6 py-6 overflow-x-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {selectedTags.length > 0 ? `Posts tagged with #${selectedTags.join(', ')}` : 'Latest Posts'}
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {data?.totalPosts ? `${data.totalPosts} posts found` : ''}
          </div>
        </div>

        {data?.posts?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-3">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilters({});
                setPage(1);
                refetch();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 w-full">
            {data?.posts?.map((post) => {
              // 🌟 Ensure image path is accessed safely
              const imageUrl =
                typeof post.image === "string"
                  ? post.image
                  : post.image?.path || "";

              const readingMins = estimateReadingTimeFromHtml(post?.description);
              const isSaved = profileData?.user?.savedPosts?.some(
                (savedPostId) => savedPostId?.toString() === post._id?.toString()
              );

              return (
                <article key={post._id} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 hover:border-green-300 dark:hover:border-green-600">
                  {/* Post Image */}
                  {imageUrl && (
                    <div className="relative h-32 overflow-hidden">
                      <Link to={`/posts/${post._id}`}>
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </Link>
                      {profileData?.user && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSavePost(post._id);
                          }}
                          disabled={savePostMutation.isPending || unsavePostMutation.isPending}
                          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all duration-200 ${
                            isSaved
                              ? 'bg-blue-600 text-white shadow-lg' 
                              : 'bg-white/90 text-gray-700 hover:text-blue-600 hover:bg-white shadow-md'
                          }`}
                          title={isSaved ? 'Unsave post' : 'Save post'}
                        >
                          {isSaved ? <FaBookmark className="h-3 w-3" /> : <FaRegBookmark className="h-3 w-3" />}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="p-3">
                    {/* Category */}
                    {post.category && (
                      <div className="mb-3">
                        <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                          {post.category.categoryName}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <Link to={`/posts/${post._id}`}>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-green-600 transition-colors leading-tight">
                        {post.title || "Untitled Post"}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2 leading-tight text-xs">
                      {post.description ? 
                        post.description.replace(/<[^>]*>/g, '').substring(0, 80) + '...' : 
                        'No description available'
                      }
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Author & Meta */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <Link to={`/user/${post.author?._id}`} className="flex items-center gap-3">
                        <Avatar user={post.author} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {post.author?.username || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })} • {readingMins} min
                          </p>
                        </div>
                      </Link>

                      {/* Post Stats */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaEye className="text-blue-500" /> 
                          <span className="font-medium">{post.viewers?.length || 0}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <FaHeart className="text-red-500" /> 
                          <span className="font-medium">{post.likes?.length || 0}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <FaComment className="text-green-500" /> 
                          <span className="font-medium">{post.comments?.length || 0}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}


          </div>

        )}

        {/* Pagination */}
        {data?.posts?.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => {
                setPage(page - 1);
                refetch();
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, Math.ceil((data?.totalPosts || 0) / 20)) }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => {
                    setPage(pageNum);
                    refetch();
                  }}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    pageNum === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              disabled={!data?.hasNextPage}
              onClick={() => {
                setPage(page + 1);
                refetch();
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsList;
