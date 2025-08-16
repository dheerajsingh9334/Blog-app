import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaBookmark, FaRegBookmark, FaSort, FaEye, FaHeart, FaComment, FaTags, FaFilter, FaTimes, FaFire, FaClock, FaUser, FaCalendar } from "react-icons/fa";
import { fetchAllPosts, fetchTrendingPostsAPI, getPopularTagsAPI } from "../../APIServices/posts/postsAPI";
import { fetchCategoriesAPI } from "../../APIServices/category/categoryAPI";
import { savePostAPI, unsavePostAPI, userProfileAPI } from "../../APIServices/users/usersAPI";
import Avatar from "../User/Avatar";
import { r } from "../../utils/unifiedResponsive";

const PostsList = () => {
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("latest");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full overflow-x-hidden">
      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20"></div>
        
        <div className={`relative w-full ${r.spacing.containerSmall} py-12 sm:py-16 lg:py-20`}>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`${r.text.h1} text-white mb-4 sm:mb-6 font-bold leading-tight`}>
              Discover Amazing Stories
            </h1>
            <p className={`${r.text.bodyLarge} text-blue-100 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed`}>
              Explore the latest posts, trending topics, and stories from our community of writers and creators.
            </p>

            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-6 text-blue-300 group-focus-within:text-blue-200 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search for stories, topics, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-2xl text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-white/30 focus:outline-none transition-all duration-300 text-lg"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-r-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Filters and Controls Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className={`${r.spacing.containerSmall} py-4`}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Sort Controls */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 pr-10 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Popular</option>
                  <option value="trending">Trending</option>
                  <option value="oldest">Oldest</option>
                </select>
                <FaSort className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
              </div>
              
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                  showFilters 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <FaFilter className="h-4 w-4" />
                Filters
                {selectedTags.length > 0 || filters.category ? (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {(selectedTags.length + (filters.category ? 1 : 0))}
                  </span>
                ) : null}
              </button>
            </div>

            {/* Active Filters Display */}
            {(selectedTags.length > 0 || filters.category || searchTerm) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                {filters.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                    {categories?.categories?.find(c => c._id === filters.category)?.categoryName}
                    <button
                      onClick={() => setFilters({ ...filters, category: undefined })}
                      className="ml-1 hover:text-blue-600"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedTags.slice(0, 3).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm rounded-full">
                    #{tag}
                    <button
                      onClick={() => handleTagFilter(tag)}
                      className="ml-1 hover:text-green-600"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedTags.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                    +{selectedTags.length - 3} more
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filters */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaTags className="text-blue-500" />
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setFilters({});
                        setPage(1);
                        refetch();
                      }}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        !filters.category
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories?.categories?.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => handleCategoryFilter(category._id)}
                        className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                          filters.category === category._id
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500'
                        }`}
                      >
                        {category.categoryName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tag Filters */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaTags className="text-green-500" />
                    Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags?.popularTags?.slice(0, 15).map((tagData) => (
                      <button
                        key={tagData._id}
                        onClick={() => handleTagFilter(tagData._id)}
                        className={`px-2 py-1 rounded-lg transition-all duration-200 ${
                          selectedTags.includes(tagData._id)
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500'
                        }`}
                      >
                        #{tagData._id} ({tagData.count})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trending Posts Section */}
      <div className="py-8 sm:py-12">
        <div className={`${r.spacing.containerSmall}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <FaFire className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className={`${r.text.h2} font-bold text-gray-900 dark:text-white`}>Trending Now</h2>
                <p className={`${r.text.body} text-gray-600 dark:text-gray-400`}>Most popular stories this week</p>
              </div>
            </div>
            <Link
              to="/trending"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              See All Trending
              <FaFire className="h-4 w-4" />
            </Link>
          </div>

          {/* Trending Posts Carousel */}
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide trending-carousel">
              <div className="flex gap-4 sm:gap-6 py-4 w-max min-w-full">
                {trendingLoading ? (
                  <div className="flex items-center justify-center w-full py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                  </div>
                ) : (
                  trendingData?.posts?.slice(0, 8).map((post, index) => (
                    <Link
                      to={`/posts/${post._id}`}
                      key={post._id}
                      className="group flex-shrink-0 min-w-[260px] sm:min-w-[280px] md:min-w-[320px] bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-gray-700"
                      title={post.title}
                    >
                      <div className="relative">
                        <img
                          src={
                            typeof post.image === "string"
                              ? post.image
                              : post.image?.path || "https://via.placeholder.com/320x180"
                          }
                          alt={post.title || "Trending post image"}
                          className="w-full h-32 sm:h-36 md:h-40 lg:h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          #{index + 1} Trending
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-3 sm:p-4 md:p-6">
                        <div className="mb-3">
                          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs sm:text-sm font-medium rounded-full">
                            {post.category?.categoryName}
                          </span>
                        </div>
                        <h3 className={`${r.text.h4} font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors`}>
                          {post.title || "Untitled"}
                        </h3>
                        <p className={`${r.text.bodySmall} text-gray-600 dark:text-gray-400 mb-4 line-clamp-2`}>
                          {post.description ? 
                            post.description.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 
                            'No description available'
                          }
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar user={post.author} size="sm" />
                            <span className={`${r.text.bodySmall} font-medium text-gray-900 dark:text-white`}>
                              {post.author?.username || "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FaEye className="text-blue-500" />
                              {post.viewers?.length || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaHeart className="text-red-500" />
                              {post.likes?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
            
            {/* Scroll Indicators for Mobile */}
            <div className="flex justify-center mt-4 sm:hidden">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                <div className="w-2 h-2 bg-orange-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Posts Grid */}
      <div className={`${r.spacing.containerSmall} py-8 sm:py-12`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className={`${r.text.h2} text-gray-900 dark:text-white font-bold`}>
              {selectedTags.length > 0 ? `Posts tagged with #${selectedTags.join(', ')}` : 'Latest Stories'}
            </h2>
            <p className={`${r.text.body} text-gray-600 dark:text-gray-400 mt-2`}>
              {data?.totalPosts ? `${data.totalPosts} stories found` : 'Discover amazing content from our community'}
            </p>
          </div>
          
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              Loading...
            </div>
          )}
        </div>

        {data?.posts?.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="text-gray-400 text-6xl sm:text-7xl mb-6">📝</div>
            <h3 className={`${r.text.h2} text-gray-900 dark:text-white mb-4`}>No stories found</h3>
            <p className={`${r.text.bodyLarge} text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto`}>
              Try adjusting your search or filter criteria to discover more amazing content.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilters({});
                setPage(1);
                refetch();
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FaTimes className="h-5 w-5" />
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {data?.posts?.map((post) => {
              const imageUrl =
                typeof post.image === "string"
                  ? post.image
                  : post.image?.path || "";

              const readingMins = estimateReadingTimeFromHtml(post?.description);
              const isSaved = profileData?.user?.savedPosts?.some(
                (savedPostId) => savedPostId?.toString() === post._id?.toString()
              );

              return (
                <article key={post._id} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:border-blue-300 dark:hover:border-blue-600">
                  {/* Post Image */}
                  {imageUrl && (
                    <div className="relative h-40 sm:h-44 md:h-48 lg:h-56 xl:h-64 overflow-hidden">
                      <Link to={`/posts/${post._id}`}>
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </Link>
                      
                      {/* Save Button */}
                      {profileData?.user && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSavePost(post._id);
                          }}
                          disabled={savePostMutation.isPending || unsavePostMutation.isPending}
                          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 ${
                            isSaved
                              ? 'bg-blue-600 text-white shadow-lg' 
                              : 'bg-white/90 text-gray-700 hover:text-blue-600 hover:bg-white shadow-md'
                          }`}
                          title={isSaved ? 'Unsave post' : 'Save post'}
                        >
                          {isSaved ? <FaBookmark className="h-4 w-4" /> : <FaRegBookmark className="h-4 w-4" />}
                        </button>
                      )}

                      {/* Category Badge */}
                      {post.category && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-full shadow-lg">
                            {post.category.categoryName}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-5 sm:p-6">
                    {/* Title */}
                    <Link to={`/posts/${post._id}`}>
                      <h3 className={`${r.text.h4} font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight`}>
                        {post.title || "Untitled Post"}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className={`text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed ${r.text.body}`}>
                      {post.description ? 
                        post.description.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : 
                        'No description available'
                      }
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            >
                              #{tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-lg">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Author & Meta */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <Link to={`/user/${post.author?._id}`} className="flex items-center gap-3 group">
                          <Avatar user={post.author} size="md" />
                          <div>
                            <p className={`${r.text.body} font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors`}>
                              {post.author?.username || "Anonymous"}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <FaCalendar className="h-3 w-3" />
                              <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                              <span>•</span>
                              <FaClock className="h-3 w-3" />
                              <span>{readingMins} min read</span>
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* Post Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                            <FaEye className="text-blue-500 h-4 w-4" /> 
                            <span className="font-medium">{post.viewers?.length || 0}</span>
                          </span>
                          <span className="flex items-center gap-1.5 hover:text-red-600 transition-colors">
                            <FaHeart className="text-red-500 h-4 w-4" /> 
                            <span className="font-medium">{post.likes?.length || 0}</span>
                          </span>
                          <span className="flex items-center gap-1.5 hover:text-green-600 transition-colors">
                            <FaComment className="text-green-500 h-4 w-4" /> 
                            <span className="font-medium">{post.comments?.length || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Modern Pagination */}
        {data?.posts?.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <button
                disabled={page === 1}
                onClick={() => {
                  setPage(page - 1);
                  refetch();
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  page === 1
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
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
                    className={`w-10 h-10 rounded-xl font-medium transition-all duration-300 ${
                      pageNum === page
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-110'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-400'
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
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  !data?.hasNextPage
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Next →
              </button>
            </div>
            
            {/* Page Info */}
            <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {Math.ceil((data?.totalPosts || 0) / 20)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsList;
