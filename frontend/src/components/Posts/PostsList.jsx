import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaSearch, FaEye, FaHeart, FaComment, FaTimes, FaFilter, FaSort } from 'react-icons/fa';
import { fetchAllPosts, fetchTrendingPostsAPI, getPopularTagsAPI } from '../../APIServices/posts/postsAPI';
import { fetchCategoriesAPI } from '../../APIServices/category/categoryAPI';
import { r } from '../../utils/unifiedResponsive';
import { stripHtmlTags, truncateText } from '../../utils/responsiveUtils';

const PostsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Handle URL parameters for tag filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tags = urlParams.get('tags');
    if (tags) {
      setSelectedTags(tags.split(',').filter(Boolean));
    }
  }, []);

  // Fetch posts with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["posts", page, searchTerm, selectedTags],
    queryFn: () => {
      const params = {
        page,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedTags.length > 0 && { tags: selectedTags.join(',') }),
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

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchTerm(searchTerm.trim());
      setPage(1);
    }
  };

  // Handle category filter
  const handleCategoryFilter = (categoryId) => {
    setSelectedTags(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    setPage(1);
  };

  // Handle tag filter
  const handleTagFilter = (tagName) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(tag => tag !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
    setPage(1);
  };

  // Remove specific tag
  const removeTag = (tagToRemove) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
    setPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setPage(1);
  };

  // Carousel state and touch functions
  const [carouselPosition, setCarouselPosition] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Track carousel scroll position
  useEffect(() => {
    const carousel = document.querySelector('.trending-carousel');
    if (carousel) {
      const handleScroll = () => {
        setCarouselPosition(carousel.scrollLeft);
      };
      
      carousel.addEventListener('scroll', handleScroll);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, [trendingData]);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    const scrollAmount = window.innerWidth >= 1024 ? 640 : 320; // 2 posts for large, 1 post for small

    if (isLeftSwipe) {
      // Swipe left - go to next
      const carousel = document.querySelector('.trending-carousel');
      if (carousel) {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setCarouselPosition(carouselPosition + scrollAmount);
      }
    } else if (isRightSwipe) {
      // Swipe right - go to previous
      const carousel = document.querySelector('.trending-carousel');
      if (carousel) {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        setCarouselPosition(Math.max(0, carouselPosition - scrollAmount));
      }
    }
  };

  const scrollToPosition = (position) => {
    const carousel = document.querySelector('.trending-carousel');
    if (carousel) {
      carousel.scrollTo({ left: position, behavior: 'smooth' });
      setCarouselPosition(position);
    }
  };

  // Handle responsive post display
  const [visiblePosts, setVisiblePosts] = useState(8);
  
  useEffect(() => {
    const updateVisiblePosts = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisiblePosts(3); // Small screens: 3 posts
      } else if (width < 1024) {
        setVisiblePosts(6); // Medium screens: 6 posts
      } else {
        setVisiblePosts(8); // Large screens: 8 posts
      }
    };

    // Set initial value
    updateVisiblePosts();

    // Add resize listener
    window.addEventListener('resize', updateVisiblePosts);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateVisiblePosts);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full overflow-x-hidden main-content content-wrapper">
      {/* Filters Section - Open Layout */}
      <div className="container-with-sidebar py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Search and Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search stories, topics, or authors..."
                  className="w-full px-4 py-2 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </form>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <FaFilter className="h-4 w-4" />
              Filters
            </button>

            {/* Sort Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <FaSort className="h-4 w-4" />
              Sort
            </button>
          </div>

          {/* Right: Clear Filters */}
          {(searchTerm || selectedTags.length > 0) && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            >
              <FaTimes className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Filters Dropdown - Open Layout */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories?.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryFilter(category._id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedTags.includes(category._id)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags?.slice(0, 10).map((tag) => (
                    <button
                      key={tag._id}
                      onClick={() => handleTagFilter(tag.name)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedTags.includes(tag.name)
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters Display */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  Active Filters
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-green-600 dark:hover:text-green-300"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trending Posts Section */}
      <div className="container-with-sidebar py-6 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              🔥
            </div>
            <div>
              <h2 className={`${r.text.h3} text-gray-900 dark:text-white font-bold`}>
                Trending Now
              </h2>
              <p className={`${r.text.body} text-gray-600 dark:text-gray-400`}>
                Most popular stories this week
              </p>
            </div>
          </div>
          
          <Link
            to="/trending"
            className="flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors"
          >
            See All Trending
            →
          </Link>
        </div>

        {/* Trending Carousel */}
        <div className="relative trending-carousel-container">
          {/* Scroll Hint */}
          <div className="absolute top-2 right-2 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur px-2 py-1 rounded-full text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 scroll-hint">
            ← Scroll to see more →
          </div>

          {/* Previous Button */}
          <button
            onClick={() => {
              const carousel = document.querySelector('.trending-carousel');
              if (carousel) {
                const scrollAmount = window.innerWidth >= 1024 ? 640 : 320; // 2 posts for large, 1 post for small
                carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                setCarouselPosition(Math.max(0, carouselPosition - scrollAmount));
              }
            }}
            disabled={carouselPosition <= 0}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 backdrop-blur border rounded-full p-2 shadow-lg transition-all duration-300 trending-nav-btn ${
              carouselPosition <= 0
                ? 'bg-gray-300 dark:bg-gray-600 border-gray-200 dark:border-gray-500 cursor-not-allowed opacity-50'
                : 'bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 hover:scale-110'
            }`}
            title="Previous Posts"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={() => {
              const carousel = document.querySelector('.trending-carousel');
              if (carousel) {
                const scrollAmount = window.innerWidth >= 1024 ? 640 : 320; // 2 posts for large, 1 post for small
                carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                setCarouselPosition(carouselPosition + scrollAmount);
              }
            }}
            disabled={carouselPosition >= (trendingData?.posts?.length || 0) * (window.innerWidth >= 1024 ? 320 : 280) - (window.innerWidth >= 1024 ? 640 : 320)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 backdrop-blur border rounded-full p-2 shadow-lg transition-all duration-300 trending-nav-btn ${
              carouselPosition >= (trendingData?.posts?.length || 0) * (window.innerWidth >= 1024 ? 320 : 280) - (window.innerWidth >= 1024 ? 640 : 320)
                ? 'bg-gray-300 dark:bg-gray-600 border-gray-200 dark:border-gray-500 cursor-not-allowed opacity-50'
                : 'bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 hover:scale-110'
            }`}
            title="Next Posts"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            className="overflow-x-auto trending-carousel"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="flex gap-4 sm:gap-4 md:gap-6 lg:gap-6 py-4 w-max min-w-full">
              {trendingLoading ? (
                <div className="flex items-center justify-center w-full py-12 min-w-[280px] sm:min-w-[320px] md:min-w-[400px] lg:min-w-[320px] xl:min-w-[360px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : !trendingData?.posts ? (
                <div className="flex items-center justify-center w-full py-12 min-w-[280px] sm:min-w-[320px] md:min-w-[400px] lg:min-w-[320px] xl:min-w-[360px]">
                  <div className="text-gray-500 dark:text-gray-400 text-center">
                    <div className="text-4xl mb-2">📝</div>
                    <p>No trending posts available</p>
                  </div>
                </div>
              ) : (
                trendingData.posts.slice(0, 6).map((post) => (
                  <Link
                    to={`/posts/${post._id}`}
                    key={post._id}
                    className="group flex-shrink-0 w-[280px] sm:w-[320px] md:w-[400px] lg:w-[320px] xl:w-[360px] bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-gray-700 trending-carousel-item"
                    title={post.title}
                  >
                    {/* Post Image */}
                    <div className="relative h-48 overflow-hidden">
                      {post.image ? (
                        <img
                          src={post.image.url || post.image.path || post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                          <span className="text-4xl">📝</span>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      {post.category && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {post.category.name}
                          </span>
                        </div>
                      )}
                      
                      {/* Reading Time */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 backdrop-blur">
                          {Math.ceil((post.content?.length || 0) / 200)} min read
                        </span>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                        {post.content}
                      </p>
                      
                      {/* Author Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {post.author?.profilePicture ? (
                            <img
                              src={post.author.profilePicture.url || post.author.profilePicture.path || post.author.profilePicture}
                              alt={post.author.name || post.author.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {(post.author?.name || post.author?.username || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {post.author?.name || post.author?.username || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Post Stats */}
                        <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <FaEye className="w-3 h-3 mr-1" />
                            {post.views || 0}
                          </span>
                          <span className="flex items-center">
                            <FaHeart className="w-3 h-3 mr-1" />
                            {post.likes?.length || 0}
                          </span>
                          <span className="flex items-center">
                            <FaComment className="w-3 h-3 mr-1" />
                            {post.comments?.length || 0}
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
              {trendingData?.posts ? Array.from({ length: trendingData.posts.length }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToPosition(index * 280)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 carousel-indicator ${
                    Math.floor(carouselPosition / 280) === index
                      ? 'bg-orange-500 scale-125 active'
                      : 'bg-orange-300 hover:bg-orange-400'
                  }`}
                  title={`Go to post ${index + 1}`}
                />
              )) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Main Posts Grid */}
      <div className="container-with-sidebar py-8 sm:py-12 main-posts-section posts-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1 min-w-0">
            <h2 className={`${r.text.h2} text-gray-900 dark:text-white font-bold post-title`}>
              {selectedTags.length > 0 ? `Posts tagged with #${selectedTags.join(', ')}` : 'Latest Stories'}
            </h2>
            <p className={`${r.text.body} text-gray-600 dark:text-gray-400 mt-2`}>
              {data?.totalPosts ? `${data.totalPosts} stories found` : 'Discover amazing content from our community'}
            </p>
          </div>
          
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600 flex-shrink-0">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              Loading...
            </div>
          )}
        </div>

          {/* Posts Grid - Show only 3 posts on small screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 posts-grid">
            {isLoading ? (
              // Loading skeleton for responsive post count
              Array.from({ length: visiblePosts }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 sm:h-28 md:h-32 lg:h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-4 sm:p-3 md:p-4 lg:p-4">
                    <div className="h-4 sm:h-3 md:h-3.5 lg:h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 sm:mb-1 md:mb-2 lg:mb-2"></div>
                    <div className="h-3 sm:h-2.5 md:h-3 lg:h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 sm:mb-1 md:mb-2 lg:mb-2"></div>
                    <div className="h-3 sm:h-2.5 md:h-3 lg:h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : !data?.posts || data.posts.length === 0 ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Start creating content to see it here!</p>
                </div>
              </div>
            ) : (
              // Show responsive number of posts based on screen size
              data.posts.slice(0, visiblePosts).map((post) => (
                <article key={post._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-200 dark:border-gray-700">
                  {/* Post Image */}
                  <div className="relative h-48 sm:h-28 md:h-32 lg:h-48 overflow-hidden">
                    {post.image ? (
                      <img
                        src={post.image.url || post.image.path || post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                        <span className="text-4xl sm:text-2xl md:text-3xl lg:text-4xl">📝</span>
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    {post.category && (
                      <div className="absolute top-2 sm:top-1 md:top-2 lg:top-3 left-2 sm:left-1 md:left-2 lg:left-3">
                        <span className="inline-flex items-center px-2 py-1 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 lg:px-2 lg:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {post.category.name}
                        </span>
                      </div>
                    )}
                    
                    {/* Reading Time */}
                    <div className="absolute top-2 sm:top-1 md:top-2 lg:top-3 right-2 sm:right-1 md:right-2 lg:right-3">
                      <span className="inline-flex items-center px-2 py-1 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 lg:px-2 lg:py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 backdrop-blur">
                        {Math.ceil((post.content?.length || 0) / 200)} min read
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-4 sm:p-3 md:p-4 lg:p-4">
                    <h3 className="text-lg sm:text-sm md:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-1 md:mb-2 lg:mb-2 line-clamp-2 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm sm:text-xs md:text-sm lg:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-2 md:mb-3 lg:mb-3 line-clamp-3">
                      {post.content}
                    </p>
                    
                    {/* Author Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-1 md:space-x-2 lg:space-x-2">
                        {post.author?.profilePicture ? (
                          <img
                            src={post.author.profilePicture.url || post.author.profilePicture.path || post.author.profilePicture}
                            alt={post.author.name || post.author.username}
                            className="w-8 h-8 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                            <span className="text-white text-sm sm:text-xs md:text-xs lg:text-sm font-medium">
                              {(post.author?.name || post.author?.username || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm sm:text-xs md:text-xs lg:text-sm font-medium text-gray-900 dark:text-white">
                            {post.author?.name || post.author?.username || 'Anonymous'}
                          </p>
                          <p className="text-xs sm:text-xs md:text-xs lg:text-xs text-gray-500 dark:text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Post Stats */}
                      <div className="flex items-center space-x-3 sm:space-x-2 md:space-x-2 lg:space-x-3 text-sm sm:text-xs md:text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <FaEye className="w-3 h-3 sm:w-2.5 sm:h-2.5 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 mr-1" />
                          {post.views || 0}
                        </span>
                        <span className="flex items-center">
                          <FaHeart className="w-3 h-3 sm:w-2.5 sm:h-2.5 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 mr-1" />
                          {post.likes?.length || 0}
                        </span>
                        <span className="flex items-center">
                          <FaComment className="w-3 h-3 sm:w-2.5 sm:h-2.5 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 mr-1" />
                          {post.comments?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))
          )}
        </div>

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
