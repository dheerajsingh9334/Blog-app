import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaSearch, FaEye, FaHeart, FaComment, FaRegBookmark, FaFire, FaChevronLeft, FaChevronRight, FaTimes, FaFilter, FaSort } from 'react-icons/fa';
import { fetchAllPosts, fetchTrendingPostsAPI } from '../../APIServices/posts/postsAPI';
import { fetchCategoriesAPI } from '../../APIServices/category/categoryAPI';
import { truncateText } from '../../utils/responsiveUtils';

const PostsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // Category name for display
  const [selectedCategoryId, setSelectedCategoryId] = useState(""); // Category ID for API
  const [carouselPosition, setCarouselPosition] = useState(0);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [savedPosts, setSavedPosts] = useState(new Set()); // Track saved posts

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
        
        const params = {
          page,
          limit: postsLimit,
        };
        
        // Add title parameter if search term exists (backend expects 'title' not 'search')
        if (searchTerm && searchTerm.trim()) {
          params.title = searchTerm.trim();
          console.log("🔍 Adding title param:", params.title);
        }
        
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

  // Fetch trending posts for the featured section
  const { data: trendingData } = useQuery({
    queryKey: ["trending-posts-preview"],
    queryFn: fetchTrendingPostsAPI,
  });

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
        
        // Also check trending posts for tags
        if (trendingData?.posts) {
          trendingData.posts.forEach(post => {
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
    enabled: !!data?.posts || !!trendingData?.posts, // Only run when posts data is available
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log("🔍 Search submitted:", searchTerm.trim());
      setSearchTerm(searchTerm.trim());
      setPage(1);
      refetch(); // Trigger refetch immediately
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
    console.log("🗑️ Clearing all filters");
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedCategoryId("");
    setSelectedTags([]);
    setPage(1);
    refetch(); // Refetch posts after clearing
  };

  // Carousel functions for trending section - Show multiple cards
  const scrollLeft = () => {
    setCarouselPosition(prev => Math.max(0, prev - 1));
  };

  const scrollRight = () => {
    if (trendingData?.posts) {
      const maxScroll = Math.max(0, trendingData.posts.length - 4); // Show 4 cards at once
      setCarouselPosition(prev => Math.min(maxScroll, prev + 1));
    }
  };

  // Save post functionality - Fixed to actually work and persist
  const handleSavePost = async (postId) => {
    try {
      console.log('💾 Saving post:', postId);
      
      // Get current saved state
      const isCurrentlySaved = savedPosts.has(postId);
      
      // Toggle saved state immediately for UI feedback
      setSavedPosts(prev => {
        const newSet = new Set(prev);
        if (isCurrentlySaved) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
      
      // TODO: Make actual API call to save/unsave post
      // const response = await savePostAPI(postId);
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Save to localStorage for persistence
      const updatedSavedPosts = Array.from(savedPosts);
      if (!isCurrentlySaved) {
        updatedSavedPosts.push(postId);
      } else {
        const index = updatedSavedPosts.indexOf(postId);
        if (index > -1) {
          updatedSavedPosts.splice(index, 1);
        }
      }
      localStorage.setItem('savedPosts', JSON.stringify(updatedSavedPosts));
      
      console.log(`✅ Post ${isCurrentlySaved ? 'unsaved' : 'saved'} successfully:`, postId);
      
      // Show success message
      if (!isCurrentlySaved) {
        alert('Post saved successfully!');
      } else {
        alert('Post removed from saved!');
      }
      
    } catch (error) {
      console.error('❌ Error saving post:', error);
      
      // Revert the UI state if API call failed
      setSavedPosts(prev => {
        const newSet = new Set(prev);
        if (savedPosts.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
      
      alert('Failed to save post. Please try again.');
    }
  };

  // Load saved posts from localStorage on component mount
  useEffect(() => {
    const savedPostsFromStorage = localStorage.getItem('savedPosts');
    if (savedPostsFromStorage) {
      try {
        const parsed = JSON.parse(savedPostsFromStorage);
        setSavedPosts(new Set(parsed));
        console.log('📚 Loaded saved posts from storage:', parsed.length);
      } catch (error) {
        console.error('❌ Error loading saved posts from storage:', error);
        localStorage.removeItem('savedPosts');
      }
    }
  }, []);



  // Handle responsive post display
  const [visiblePosts, setVisiblePosts] = useState(1);
  
  useEffect(() => {
    const updateVisiblePosts = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisiblePosts(12); // Mobile: 12 posts total (1 per row)
      } else if (width < 1024) {
        setVisiblePosts(24); // Small screens: 24 posts total (2 per row for 12 rows)
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

  // Reset carousel position when trending data changes
  useEffect(() => {
    setCarouselPosition(0);
  }, [trendingData?.posts]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 w-full overflow-x-hidden">
      {/* Search Section */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search stories, topics, or authors..."
                    className="w-full px-4 py-3 pl-10 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                </form>
              </div>
              {(searchTerm || selectedCategory || selectedTags.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="ml-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Categories and Tags */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCategorySuggestions(!showCategorySuggestions)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <FaFilter className="h-4 w-4" />
                  <span>Categories</span>
                  <svg className={`w-4 h-4 transition-transform ${showCategorySuggestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCategorySuggestions && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-60 overflow-y-auto">
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

              {/* Tags Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowTagSuggestions(!showTagSuggestions)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <FaSort className="h-4 w-4" />
                  <span>Tags</span>
                  <svg className={`w-4 h-4 transition-transform ${showTagSuggestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showTagSuggestions && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-60 overflow-y-auto">
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
              <div className="flex flex-wrap justify-center gap-2">
                {/* Selected Category */}
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    📂 {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {/* Selected Tags */}
                {selectedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    #{tag}
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trending Posts Section */}
        {trendingData?.posts && trendingData.posts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FaFire className="text-3xl text-red-500" />
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Trending Now</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Most popular stories this week</p>
                </div>
              </div>
              <Link 
                to="/trending" 
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
              >
                See All Trending →
              </Link>
            </div>
            
            {/* Trending Posts Horizontal Carousel - Show multiple cards like the image */}
            <div className="relative">
              {/* Carousel Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={scrollLeft}
                  disabled={carouselPosition === 0}
                  className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <FaChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {carouselPosition + 1} of {Math.max(1, trendingData.posts.length - 3)}
                </div>
                
                <button
                  onClick={scrollRight}
                  disabled={carouselPosition >= Math.max(0, trendingData.posts.length - 4)}
                  className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <FaChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Carousel Container - Show 4 cards at once */}
              <div className="relative overflow-hidden rounded-xl">
                <div 
                  className="flex space-x-6 transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${carouselPosition * 320}px)` }}
                >
                  {trendingData.posts.map((post) => (
                    <div key={post._id} className="flex-shrink-0 w-80">
                      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="relative">
                          {post.image ? (
                            <img
                              src={post.image.url || post.image.path || post.image}
                              alt={post.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                              <span className="text-5xl">📝</span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                              🔥
                            </span>
                          </div>
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 bg-black bg-opacity-75 text-white text-xs font-medium rounded-full">
                              1 min read
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 leading-tight">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm line-clamp-2 leading-relaxed">
                            {truncateText(post.content, 80)}
                          </p>
                          
                          {/* Author & Meta */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {post.author?.profilePicture ? (
                                <img
                                  src={post.author.profilePicture.url || post.author.profilePicture.path || post.author.profilePicture}
                                  alt={post.author.name || post.author.username}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <span className="text-gray-600 dark:text-gray-300 text-xs font-medium">
                                    {(post.author?.name || post.author?.username || 'U').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                  {post.author?.name || post.author?.username || 'Anonymous'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
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
                      </article>

                      {/* Category and Tags - Outside the trending card */}
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll indicator */}
              <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                ← Scroll to see more →
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: Math.max(1, Math.ceil(trendingData.posts.length / 4)) }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => setCarouselPosition(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === carouselPosition
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Latest Stories Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Latest Stories</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {data?.totalPosts ? `${data.totalPosts} stories found` : 'Discover amazing content from our community'}
              </p>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
