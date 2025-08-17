import { useState, useEffect } from "react";
import {
  Cog6ToothIcon,
  HomeIcon,
  BellIcon,
  BookOpenIcon,
  UserGroupIcon,
  CalendarIcon,
  TagIcon,
  CheckIcon,
  BookmarkIcon,
  ChartBarIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { FaBlog, FaPen, FaBell, FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserPlanAndUsageAPI, logoutAPI } from "../../APIServices/users/usersAPI";
import { useNotifications } from "../../contexts/NotificationContext";
import { logout } from "../../redux/slices/authSlices";
import { useDarkMode } from "../Navbar/DarkModeContext";
import SearchBar from "../Search/SearchBar";
import UserPlanStatus from "../Navbar/UserPlanStatus";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: false },
  { name: "Create Post", href: "/dashboard/create-post", icon: BookOpenIcon, current: false },
  { name: "My Posts", href: "/dashboard/posts", icon: BookOpenIcon, current: false },
  { name: "Analytics", href: "/dashboard/analytics", icon: ChartBarIcon, current: false },
  { name: "Content Calendar", href: "/dashboard/content-calendar", icon: CalendarIcon, current: false },
  { name: "Saved Posts", href: "/dashboard/saved-posts", icon: BookmarkIcon, current: false },
  { name: "Followers", href: "/dashboard/my-followers", icon: UserGroupIcon, current: false },
  { name: "Following", href: "/dashboard/my-followings", icon: UserGroupIcon, current: false },
  { name: "Categories", href: "/dashboard/add-category", icon: TagIcon, current: false },
  { name: "Trending", href: "/trending", icon: FaBlog, current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Get user initials for profile picture fallback
const getUserInitials = (user) => {
  if (!user) return "U";
  
  const name = user.name || user.username || "";
  if (name.length === 0) return "U";
  
  const names = name.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * @param {{ userAuth: boolean, children: React.ReactNode }} props
 */
// eslint-disable-next-line react/prop-types
export default function GlobalLayout({ userAuth, children }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarSidebarOpen, setNavbarSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { userAuth: authUser } = useSelector((state) => state.auth);
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Use shared notification context - no more duplicate API calls!
  const { unreadCount } = useNotifications();

  // Get user's current plan
  const { data: usageData } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    enabled: !!userAuth,
    refetchInterval: 300000,
  });

  const currentPlan = usageData?.usage?.plan;
  const hasFreePlan = currentPlan && (currentPlan.tier === 'free' || currentPlan.planName === 'Free');

  // Update current navigation item based on route
  useEffect(() => {
    navigation.forEach((item) => {
      item.current = location.pathname === item.href;
    });
  }, [location]);

  // Close navbar sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the sidebar and not on the toggle button
      const sidebar = document.querySelector('[data-sidebar]');
    const isToggleClick = event.target.closest('[data-sidebar-toggle]');
      
      if (navbarSidebarOpen && 
          sidebar && 
          !sidebar.contains(event.target) && 
      !isToggleClick) {
        setNavbarSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navbarSidebarOpen]);

  const handleLogout = async () => {
    try {
      await logoutAPI();
      dispatch(logout());
      queryClient.clear();
      setDropdownOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      queryClient.clear();
      setDropdownOpen(false);
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar Overlay - show when we do NOT shift content (e.g., trending) */}
      {(() => {
        const isTrendingPage = location.pathname.startsWith('/trending');
        const isPostsList = location.pathname === '/posts' || location.pathname.startsWith('/posts');
        const shouldShiftContent = navbarSidebarOpen && isPostsList && !isTrendingPage;
        return navbarSidebarOpen && !shouldShiftContent ? (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setNavbarSidebarOpen(false)}
          />
        ) : null;
      })()}

      {/* Left Sidebar */}
      <div 
        data-sidebar
        className={`fixed inset-y-0 left-0 z-40 w-40 sm:w-48 md:w-56 lg:w-64 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          navbarSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-3 sm:px-4 lg:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h3>
          <button
            onClick={() => setNavbarSidebarOpen(false)}
            className="p-2 rounded-md text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors lg:hidden"
            title="Close Sidebar"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto h-full" style={{ scrollbarWidth: 'thin', scrollbarColor: '#10b981 #374151' }}>
          <div className="px-3 sm:px-4 lg:px-6 py-4">
            {/* Main Navigation */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Main Navigation
              </h3>
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.current
                        ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600",
                      "group flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-all duration-200"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current ? "text-green-600" : "text-gray-400 group-hover:text-green-600",
                        "h-5 w-5 mr-2 sm:mr-3"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                    {item.current && (
                      <CheckIcon className="h-5 w-5 text-green-500 ml-auto" aria-hidden="true" />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Plan Management */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Plan Management
              </h3>
              <div className="space-y-1">
                <Link
                  to="/plan-management"
                  className="group flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600"
                >
                  <CreditCardIcon className="mr-2 sm:mr-3 h-5 w-5 text-gray-400 group-hover:text-green-600" />
                  Manage Plans
                </Link>
                <Link
                  to="/pricing"
                  className="group flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600"
                >
                  <CurrencyDollarIcon className="mr-2 sm:mr-3 h-5 w-5 text-gray-400 group-hover:text-green-600" />
                  View Pricing
                </Link>
                {hasFreePlan && (
                  <Link
                    to="/upgrade"
                    className="group flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600"
                  >
                    <SparklesIcon className="mr-2 sm:mr-3 h-5 w-5 text-gray-400 group-hover:text-green-600" />
                    Upgrade to Pro
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-1">
                <Link
                  to="/dashboard/notifications"
                  className="group flex items-center justify-between px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600"
                >
                  <span className="flex items-center">
                    <BellIcon className="mr-2 sm:mr-3 h-5 w-5 text-gray-400 group-hover:text-green-600" />
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-800 dark:text-red-400">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="group flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600"
                >
                  <Cog6ToothIcon className="mr-2 sm:mr-3 h-5 w-5 text-gray-400 group-hover:text-green-600" />
                  Settings
                </Link>
              </div>
            </div>

            {/* User Profile Section */}
            {authUser && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={authUser.profilePicture?.url || authUser.profilePicture?.path || authUser.profilePicture || "https://via.placeholder.com/150"}
                    alt="User profile"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{authUser.name || authUser.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{authUser.username}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {(() => {
        const isTrendingPage = location.pathname.startsWith('/trending');
        const isPostsList = location.pathname === '/posts' || location.pathname.startsWith('/posts');
        const shouldShiftContent = navbarSidebarOpen && isPostsList && !isTrendingPage;
        return (
          <div className={`transition-all duration-300 ease-in-out flex-1 min-h-screen pt-16 ${
            shouldShiftContent ? 'ml-40 sm:ml-48 md:ml-56 lg:ml-64' : 'ml-0'
          }`}>
            {/* Navbar - Fixed Header */}
            <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Logo and Navbar Sidebar Toggle */}
              <div className="flex items-center space-x-4">
                {/* Navbar Sidebar Toggle Button */}
                {userAuth && (
                  <button
                    onClick={() => setNavbarSidebarOpen(!navbarSidebarOpen)}
                    className="p-2 rounded-md text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    title={navbarSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                    data-sidebar-toggle
                  >
                    {navbarSidebarOpen ? (
                      <FaTimes className="h-5 w-5" />
                    ) : (
                      <FaBars className="h-5 w-5" />
                    )}
                  </button>
                )}
                
                {/* Logo */}
                <Link
                  to="/posts"
                  className="text-xl font-serif font-bold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  WisdomShare
                </Link>
              </div>
 
              {/* Center: Search Bar */}
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <SearchBar placeholder="Search posts, users, or content..." />
              </div>
 
              {/* Center: Main Navigation (visible on lg and up) */}
              <div className="hidden lg:flex items-center space-x-6">
                <Link
                  to="/posts"
                  className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors"
                >
                  Posts
                </Link>
                <Link
                  to="/plan-management"
                  className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors"
                >
                  Plan Management
                </Link>
                <Link
                  to="/ranking"
                  className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors"
                >
                  Ranking
                </Link>
                {!hasFreePlan && (
                  <Link
                    to="/free-subscription"
                    className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors"
                  >
                    Free Plan
                  </Link>
                )}
              </div>
 
              {/* Right: Actions */}
              <div className="flex items-center space-x-4">
                {userAuth ? (
                  <>
                    {/* User Plan Status */}
                    <UserPlanStatus />
 
                    <Link
                      to="/dashboard/create-post"
                      className="hidden md:flex items-center text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Write Post"
                    >
                      <FaPen className="w-4 h-4" />
                    </Link>
 
                    <Link
                      to="/dashboard/notifications"
                      className="relative text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                    >
                      <FaBell />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
 
                    {/* Dark mode toggle */}
                    <button
                      onClick={toggleDarkMode}
                      className="p-2 rounded-full text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                    >
                      {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                    </button>
 
                    {/* User dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                      >
                        {authUser?.profilePicture ? (
                          <img
                            className="h-8 w-8 rounded-full object-cover border-2 border-white dark:border-gray-700"
                            src={authUser?.profilePicture?.url || authUser?.profilePicture?.path || authUser?.profilePicture || "https://via.placeholder.com/32"}
                            alt="User profile"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center border-2 border-white dark:border-gray-700 ${authUser?.profilePicture ? 'hidden' : 'flex'}`}
                          style={{ display: authUser?.profilePicture ? 'none' : 'flex' }}
                        >
                          <span className="text-xs text-white font-medium">
                            {getUserInitials(authUser)}
                          </span>
                        </div>
                        <span className="hidden md:block">{authUser?.name || authUser?.username}</span>
                      </button>
 
                      {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Profile
                          </Link>
                          <Link
                            to="/dashboard/settings"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
 
            {/* Page Content */}
            <div className="pt-16">
              <main className="min-h-screen">
                {/* Upgrade Plan Banner - Show for free plan users */}
                {userAuth && hasFreePlan && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-b border-green-200 dark:border-green-700 p-3 sm:p-4">
                    <div className="max-w-7xl mx-auto">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                        <div className="flex-1 mb-3 lg:mb-0">
                          <h2 className="text-lg sm:text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                            🚀 Upgrade Your Plan
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                            Unlock unlimited posts, advanced analytics, and premium features.
                          </p>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            <span className="bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
                              ✨ Unlimited Posts
                            </span>
                            <span className="bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                              📊 Analytics
                            </span>
                            <span className="bg-purple-100 dark:bg-purple-800/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs">
                              🎯 Support
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to="/plan-management"
                            className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                          >
                            View Plans
                          </Link>
                          <Link
                            to="/pricing"
                            className="border border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                          >
                            Compare
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
 
                {/* Page Content */}
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
                  {children || <Outlet />}
                </div>
              </main>
            </div>
          </div>
        );
  })()}

      {/* Mobile Navbar - Only visible on small devices */}
  <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Sidebar Toggle and Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Navbar Sidebar Toggle Button for Mobile */}
              {userAuth && (
                <button
                  onClick={() => setNavbarSidebarOpen(!navbarSidebarOpen)}
                  className="navbar-sidebar p-2 rounded-lg text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={navbarSidebarOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                  aria-expanded={navbarSidebarOpen}
                  data-sidebar-toggle
                >
                  {navbarSidebarOpen ? (
                    <FaTimes className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <FaBars className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              )}
              
              <Link
                to="/posts"
                className="text-base sm:text-lg font-serif font-bold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                WisdomShare
              </Link>
            </div>

            {/* Center: Search Bar - Always visible */}
            <div className="flex-1 max-w-xs mx-2 sm:mx-4">
              <SearchBar placeholder="Search posts, users..." />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {userAuth ? (
                <>
                  {/* User Plan Status - Compact for mobile */}
                  <div className="hidden sm:block">
                    <UserPlanStatus />
                  </div>

                  {/* Write Button */}
                  <Link
                    to="/dashboard/create-post"
                    className="p-2 rounded-lg text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Write Post"
                  >
                    <FaPen className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>

                  {/* Notifications */}
                  <Link
                    to="/dashboard/notifications"
                    className="relative p-2 rounded-lg text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Notifications"
                  >
                    <FaBell className="w-3 h-3 sm:w-4 sm:h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 min-w-3 sm:min-w-4 px-1 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Dark mode toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title={darkMode ? "Light Mode" : "Dark Mode"}
                  >
                    {darkMode ? <FaSun className="w-3 h-3 sm:w-4 sm:h-4" /> : <FaMoon className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </button>

                  {/* User Profile - Compact */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center p-2 rounded-lg text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Profile Menu"
                    >
                      {authUser?.profilePicture ? (
                        <img
                          className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover border-2 border-white dark:border-gray-700"
                          src={authUser?.profilePicture?.url || authUser?.profilePicture?.path || authUser?.profilePicture || "https://via.placeholder.com/32"}
                          alt="User profile"
                        />
                      ) : (
                        <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center border-2 border-white dark:border-gray-700">
                          <span className="text-xs text-white font-medium">
                            {getUserInitials(authUser)}
                          </span>
                        </div>
                      )}
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <div className="px-3 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                            {authUser?.name || authUser?.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            @{authUser?.username}
                          </p>
                        </div>
                        <Link
                          to="/dashboard/profile"
                          className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/dashboard/settings"
                          className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-green-600 text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-green-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}