import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaSearch, FaEye, FaHeart, FaComment, FaRegBookmark, FaTimes, FaFilter, FaSort, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { fetchAllPosts } from '../../APIServices/posts/postsAPI';
import { fetchCategoriesAPI } from '../../APIServices/category/categoryAPI';
import { truncateText } from '../../utils/responsiveUtils';
import { fetchTrendingPostsAPI } from '../../APIServices/posts/postsAPI';
import './postCss.css';

const PostsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // Category name for display
  const [selectedCategoryId, setSelectedCategoryId] = useState(""); // Category ID for API
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [savedPosts, setSavedPosts] = useState(new Set()); // Track saved posts
  const [trendingIndex, setTrendingIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4); // 2 on mobile, 4 (two pairs) on larger

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
    queryKey: ["posts", page, searchTerm, selectedCategoryId, selectedTags],
    queryFn: async () => {
      try {
      const screenWidth = window.innerWidth;
      const postsLimit = screenWidth < 1024 ? 12 : 24; // 12 for mobile/tablet, 24 for desktop
      
        // If we have a search term, use the search endpoint
        if (searchTerm && searchTerm.trim()) {
          console.log("🔍 Using search endpoint for:", searchTerm.trim());
          const searchParams = {
            q: searchTerm.trim(),
            type: "posts", // Only search posts, not users
            page,
            limit: postsLimit,
          };
          
          // Add category filter if selected
          if (selectedCategoryId) {
            // For search, we need to filter results after search
            console.log("📂 Category filter will be applied after search");
          }
          
          // Add tags filter if selected
          if (selectedTags.length > 0) {
            // For search, we need to filter results after search
            console.log("🏷️ Tags filter will be applied after search");
          }
          
          console.log("🔍 Search params:", searchParams);
          
          // Convert searchParams to URL query string
          const queryString = new URLSearchParams(searchParams).toString();
          const searchUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/posts/search?${queryString}`;
          
          console.log("🔍 Search URL:", searchUrl);
          
          const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
          }
          
          const searchResults = await response.json();
          console.log("🔍 Search results:", searchResults);
          
          // Return in the same format as fetchAllPosts
          return {
            posts: searchResults.results?.posts || [],
            totalPosts: searchResults.results?.totalPosts || 0,
            totalPages: Math.ceil((searchResults.results?.totalPosts || 0) / postsLimit),
            currentPage: page,
            perPage: postsLimit,
            hasNextPage: (page * postsLimit) < (searchResults.results?.totalPosts || 0),
          };
        }
        
        // If no search term, use the regular posts endpoint
      const params = {
        page,
        limit: postsLimit,
        };
        
        // Add category parameter if category is selected
        if (selectedCategoryId) {
          params.category = selectedCategoryId;
          console.log("📂 Adding category param:", params.category);
        }
        
        // Add tags parameter if tags are selected
        if (selectedTags.length > 0) {
          params.tags = selectedTags.join(',');
          console.log("🏷️ Adding tags param:", params.tags);
        }
        
      console.log("🔍 Fetching posts with params:", params);
        const response = await fetchAllPosts(params);
        console.log("📄 Posts response:", response);
        return response;
      } catch (error) {
        console.error("❌ Error fetching posts:", error);
        throw error;
      }
    },
    enabled: true, // Always enable the query
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Fetch trending posts for the carousel
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useQuery({
    queryKey: ['trending-inline'],
    queryFn: fetchTrendingPostsAPI,
    staleTime: 5 * 60 * 1000,
  });

  // Determine how many trending items to show per view (2 on mobile, 4 on larger)
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      const perView = width < 640 ? 2 : 4; // 2 on small, 4 (two pairs) otherwise
      setItemsPerView(perView);
      setTrendingIndex(0); // reset to start when layout changes
    };
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const totalTrending = trendingData?.posts?.length || 0;
  const canPage = totalTrending > itemsPerView;
  const pageNext = () => {
    if (!totalTrending) return;
    setTrendingIndex((prev) => (prev + itemsPerView) % totalTrending);
  };
  const pagePrev = () => {
    if (!totalTrending) return;
    // Proper modulo wrap for negative
    const next = ((trendingIndex - itemsPerView) % totalTrending + totalTrending) % totalTrending;
    setTrendingIndex(next);
  };

  // Compute visible slice with wrap-around to always show itemsPerView cards when possible
  const visibleTrending = (() => {
    if (!totalTrending) return [];
    if (totalTrending <= itemsPerView) return trendingData.posts;
    const end = trendingIndex + itemsPerView;
    if (end <= totalTrending) {
      return trendingData.posts.slice(trendingIndex, end);
    }
    // wrap
    const first = trendingData.posts.slice(trendingIndex);
    const second = trendingData.posts.slice(0, end - totalTrending);
    return [...first, ...second];
  })();

  // Refetch when selectedTags change
  useEffect(() => {
    console.log("🔄 selectedTags changed:", selectedTags);
    setPage(1); // Reset to first page when filters change
      refetch();
  }, [selectedTags, refetch]);

  // Refetch when selectedCategoryId changes
  useEffect(() => {
    console.log("📂 selectedCategoryId changed:", selectedCategoryId);
    setPage(1); // Reset to first page when filters change
    refetch();
  }, [selectedCategoryId, refetch]);

  // Refetch when searchTerm changes (debounced)
  useEffect(() => {
    console.log("🔍 searchTerm changed:", searchTerm);
    const timeoutId = setTimeout(() => {
      setPage(1); // Reset to first page when searching
      refetch();
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, refetch]);

  // Debug logging
  console.log("Posts data:", data);
  console.log("Posts error:", error);
  console.log("Posts loading:", isLoading);

  // Fetch categories for the sidebar
  const { data: categoriesData, error: categoriesError, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        console.log("🔍 Fetching categories...");
        const response = await fetchCategoriesAPI();
        console.log("📂 Categories response:", response);
        
        // Check if response has the expected structure
        if (response && response.categories) {
          console.log("✅ Categories found:", response.categories.length);
          return response;
        } else {
          console.warn("⚠️ Unexpected categories response structure:", response);
          return { categories: [] };
        }
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
        return { categories: [] };
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch popular tags for search - Get real tags from posts data
  const { data: popularTagsData, error: tagsError, isLoading: tagsLoading } = useQuery({
    queryKey: ["popular-tags", data?.posts],
    queryFn: async () => {
      try {
        console.log("🔍 Extracting tags from posts data...");
        
        // Extract unique tags from all posts
        const allTags = new Set();
        if (data?.posts) {
          data.posts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
              post.tags.forEach(tag => {
                if (tag && typeof tag === 'string') {
                  allTags.add(tag.trim());
                }
              });
            }
          });
        }
        
        const tagsArray = Array.from(allTags).sort();
        console.log("🏷️ Extracted tags from posts:", tagsArray.length, tagsArray);
        return { tags: tagsArray };
      } catch (error) {
        console.error("❌ Error extracting tags:", error);
        return { tags: [] };
      }
    },
    enabled: !!data?.posts, // Only run when posts data is available
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && searchTerm.trim().length >= 2) {
      console.log("🔍 Search submitted:", searchTerm.trim());
      setSearchTerm(searchTerm.trim());
      setPage(1);
      refetch(); // Trigger refetch immediately
    } else if (searchTerm.trim().length < 2) {
      alert("Search query must be at least 2 characters long");
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Don't refetch here - let the useEffect handle it with debouncing
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    console.log('🏷️ Category selected:', category);
    if (selectedCategory === category.categoryName) {
      // If same category is clicked, clear it
      setSelectedCategory("");
      setSelectedCategoryId("");
    } else {
      // Set new category
      setSelectedCategory(category.categoryName);
      setSelectedCategoryId(category._id);
    }
    setShowCategorySuggestions(false);
    setPage(1); // Reset to first page
  };

  // Handle tag selection
  const handleTagSelect = (tag) => {
    console.log('🏷️ Tag selected:', tag);
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
    setPage(1); // Reset to first page
  };

  // Handle tag removal
  const handleTagRemove = (tagToRemove) => {
    console.log('🗑️ Tag removed:', tagToRemove);
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
    setPage(1); // Reset to first page
  };

  // Handle clear all categories
  const handleClearCategories = () => {
    console.log('🗑️ Clearing all categories');
    setSelectedCategory("");
    setSelectedCategoryId("");
    setShowCategorySuggestions(false);
    setPage(1); // Reset to first page
  };

  // Handle clear all tags
  const handleClearTags = () => {
    console.log('🗑️ Clearing all tags');
    setSelectedTags([]);
    setShowTagSuggestions(false);
    setPage(1); // Reset to first page
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedCategoryId("");
    setSelectedTags([]);
    setPage(1);
  };

  // Handle save post
  const handleSavePost = (postId) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        // Remove from localStorage
        const saved = JSON.parse(localStorage.getItem('savedPosts') || '[]');
        const filtered = saved.filter(id => id !== postId);
        localStorage.setItem('savedPosts', JSON.stringify(filtered));
      } else {
        newSet.add(postId);
        // Add to localStorage
        const saved = JSON.parse(localStorage.getItem('savedPosts') || '[]');
        saved.push(postId);
        localStorage.setItem('savedPosts', JSON.stringify(saved));
      }
      return newSet;
    });
  };

  // Load saved posts from localStorage on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedPosts');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedPosts(new Set(parsed));
        console.log('📚 Loaded saved posts from storage:', parsed.length);
      }
    } catch (error) {
      console.error('❌ Error loading saved posts from storage:', error);
      localStorage.removeItem('savedPosts');
    }
  }, []);

  // Handle responsive post display
  const [visiblePosts, setVisiblePosts] = useState(1);
  
  useEffect(() => {
    const updateVisiblePosts = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisiblePosts(6); // Mobile: 6 posts total (1 per row)
      } else if (width < 1024) {
        setVisiblePosts(12); // Small screens: 12 posts total (2 per row for 6 rows)
      } else {
        setVisiblePosts(24); // Large screens: 24 posts total (3 per row for 8 rows)
      }
    };

    // Set initial value
    updateVisiblePosts();

    // Add resize listener
    window.addEventListener('resize', updateVisiblePosts);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateVisiblePosts);
  }, []);

  // Update displayed posts when data changes
  useEffect(() => {
    if (data?.posts) {
      // Posts are now handled directly by the query
    }
  }, [data?.posts]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedTags]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 w-full overflow-x-hidden">
      {/* Search Section - Improved Mobile Layout */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 sm:py-4 lg:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            {/* Search Bar - Better Mobile Layout */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search stories, topics, or authors (min 2 characters)..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-8 sm:pl-10 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 text-sm sm:text-base"
                  />
                  <FaSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                </form>
              </div>
              {(searchTerm || selectedCategory || selectedTags.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="ml-2 sm:ml-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-xs sm:text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Trending carousel (paged: 2 on mobile, 4 on larger) */}
            {!trendingLoading && !trendingError && totalTrending > 0 && (
              <section aria-label="Trending" className="trending-carousel-container">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Trending</h2>
                </div>
                <div className="w-full relative">
                  {/* Left/Right overlay buttons */}
                  <button
                    type="button"
                    onClick={pagePrev}
                    className="trending-nav-btn absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
                    aria-label="Previous"
                    disabled={!canPage}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={pageNext}
                    className="trending-nav-btn absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
                    aria-label="Next"
                    disabled={!canPage}
                  >
                    <FaChevronRight />
                  </button>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {visibleTrending.map((post, idx) => {
                      const imageUrl = typeof post.image === 'string' ? post.image : (post.image?.path || '');
                      const rank = (trendingIndex + idx) % totalTrending;
                      return (
                        <Link
                          to={`/posts/${post._id}`}
                          key={`${post._id}-${rank}`}
                          className="trending-carousel-item"
                          title={post.title || 'Post'}
                        >
                          <div className="relative w-full h-[124px] sm:h-[146px] overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={post.title || 'Post image'}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                            )}
                            {rank < 3 && (
                              <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-red-600 text-white shadow">#{rank + 1}</span>
                            )}
                          </div>
                          <div className="mt-2">
                            <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-gray-100">{truncateText(post.title || 'Untitled', 70)}</h3>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
                              <span className="flex items-center gap-1"><FaEye />{post.viewers?.length || 0}</span>
                              <span className="flex items-center gap-1"><FaHeart className="text-red-500" />{post.likes?.length || 0}</span>
                              <span className="flex items-center gap-1"><FaComment className="text-green-600" />{post.comments?.length || 0}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Categories and Tags - Improved Mobile Layout */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-center items-center">
              {/* Categories Dropdown - Better Mobile Positioning */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowCategorySuggestions(!showCategorySuggestions)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center sm:justify-start space-x-2 text-sm"
                >
                  <FaFilter className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Categories</span>
                  <svg className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showCategorySuggestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCategorySuggestions && (
                  <div className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-60 overflow-y-auto">
                    {categoriesLoading ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Loading categories...
                      </div>
                    ) : categoriesError ? (
                      <div className="p-4 text-center text-red-500">
                        Error loading categories
                      </div>
                    ) : categoriesData?.categories && categoriesData.categories.length > 0 ? (
                      <>
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <button
                            onClick={handleClearCategories}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedCategory === ""
                        ? 'bg-green-500 text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                            All Categories
                  </button>
                        </div>
                  {categoriesData.categories.map((category) => (
                    <button
                      key={category._id}
                            onClick={() => handleCategorySelect(category)}
                            className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              selectedCategory === category.categoryName
                          ? 'bg-green-500 text-white'
                                : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                            {category.categoryName}
                    </button>
                  ))}
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No categories found
                      </div>
                    )}
                </div>
              )}
              </div>

              {/* Tags Dropdown - Better Mobile Positioning */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowTagSuggestions(!showTagSuggestions)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center sm:justify-start space-x-2 text-sm"
                >
                  <FaSort className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Tags</span>
                  <svg className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showTagSuggestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showTagSuggestions && (
                  <div className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-60 overflow-y-auto">
                    {tagsLoading ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Loading tags...
                      </div>
                    ) : tagsError ? (
                      <div className="p-4 text-center text-red-500">
                        Error loading tags
                      </div>
                    ) : popularTagsData?.tags && popularTagsData.tags.length > 0 ? (
                      <>
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <button
                            onClick={handleClearTags}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            Clear All Tags
                          </button>
                        </div>
                        {popularTagsData.tags.slice(0, 15).map((tag) => (
                    <button
                      key={tag}
                            onClick={() => handleTagSelect(tag)}
                            className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                                : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No tags found
                      </div>
                    )}
                </div>
              )}
              </div>
            </div>

            {/* Selected Tags Display */}
            {(selectedCategory || selectedTags.length > 0) && (
              <div className="flex flex-wrap justify-center gap-2 sm:gap-2">
                {/* Selected Category */}
                {selectedCategory && (
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    📂 {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="ml-1 sm:ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {/* Selected Tags */}
                {selectedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    #{tag}
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1 sm:ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Main Content - Only Latest Stories Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Latest Stories Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Latest Stories</h2>
              <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">
                {data?.totalPosts ? `${data.totalPosts} stories found` : 'Discover amazing content from our community'}
              </p>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                      {isLoading ? (
              // Loading skeleton
              Array.from({ length: visiblePosts }).map((_, index) => (
                <article key={index} className="animate-pulse">
                  <div className="mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </article>
              ))
            ) : !data?.posts || data.posts.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No posts found</h3>
                <p className="text-gray-600 dark:text-gray-400">Start creating content to see it here!</p>
              </div>
            ) : (
              data.posts.map((post) => (
                              <article key={post._id} className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Post Image */}
                  <div className="relative overflow-hidden">
                    {post.image ? (
                      <img
                        src={post.image.url || post.image.path || post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                        <span className="text-4xl">📝</span>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="p-4 space-y-3">
                    {/* Title */}
                    <Link to={`/posts/${post._id}`}>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2 leading-tight">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                      {truncateText(post.content, 120)}
                    </p>

                    {/* Author & Meta */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        {post.author?.profilePicture ? (
                          <img
                            src={post.author.profilePicture.url || post.author.profilePicture.path || post.author.profilePicture}
                            alt={post.author.name || post.author.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                              {(post.author?.name || post.author?.username || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {post.author?.name || post.author?.username || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Save Button - Fixed Responsiveness */}
                      <button 
                        onClick={() => handleSavePost(post._id)}
                        className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0 ${
                          savedPosts.has(post._id) ? 'bg-green-500 text-white' : ''
                        }`}
                        aria-label="Save post"
                      >
                        <FaRegBookmark className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 pt-2">
                      <span className="flex items-center space-x-1">
                        <FaEye className="h-3 w-3" />
                        <span>{post.views || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FaHeart className="h-3 w-3" />
                        <span>{post.likes?.length || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FaComment className="h-3 w-3" />
                        <span>{post.comments?.length || 0}</span>
                      </span>
                    </div>
                  </div>

                  {/* Category and Tags - Outside the card */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {post.category && (
                      <button
                        onClick={() => handleCategorySelect(post.category)}
                        className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors cursor-pointer"
                      >
                        {post.category.categoryName || post.category.name || 'Uncategorized'}
                      </button>
                    )}
                    {post.tags && post.tags.slice(0, 3).map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => handleTagSelect(tag)}
                        className={`px-2 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </article>
            ))
          )}
        </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                {/* Previous Page */}
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1 || isLoading}
                  className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pageNum
                          ? 'bg-green-500 text-white'
                          : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Page */}
                <button
                  onClick={() => setPage(prev => Math.min(data.totalPages, prev + 1))}
                  disabled={page === data.totalPages || isLoading}
                  className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* Page Info */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {data?.totalPages || 1} • Showing {data?.posts?.length || 0} of {data?.totalPosts || 0} stories
              </p>
            </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showTagSuggestions || showCategorySuggestions) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowTagSuggestions(false);
            setShowCategorySuggestions(false);
          }}
        />
      )}
    </div>
  );
};

export default PostsList;
