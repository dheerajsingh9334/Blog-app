import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPen, FaBell, FaUser, FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlices";
import { useDarkMode } from "./DarkModeContext";
import SearchBar from "../Search/SearchBar";
import UserPlanStatus from "./UserPlanStatus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserPlanAndUsageAPI, logoutAPI } from "../../APIServices/users/usersAPI";
import { getUnreadNotificationCountAPI } from "../../APIServices/notifications/nofitificationsAPI";
import Avatar from "../User/Avatar";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { userAuth } = useSelector((state) => state.auth);

  // Get user's current plan to conditionally show/hide free plan link
  const { data: usageData } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    enabled: !!userAuth, // Only fetch if user is authenticated
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const currentPlan = usageData?.usage?.plan;
  const hasFreePlan = currentPlan && (currentPlan.tier === 'free' || currentPlan.planName === 'Free');

  // Real unread notifications count
  const { data: unreadData } = useQuery({
    queryKey: ["notification-count"],
    queryFn: getUnreadNotificationCountAPI,
    enabled: !!userAuth,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleMobileMenuClickOutside = (event) => {
      const mobileMenuButton = event.target.closest('button');
      const mobileMenu = event.target.closest('.mobile-menu');
      
      if (!mobileMenuButton && !mobileMenu) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", handleMobileMenuClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleMobileMenuClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side session
      await logoutAPI();
      // Clear Redux state
      dispatch(logout());
      // Clear all cached queries
      queryClient.clear();
      // Close dropdown
      setDropdownOpen(false);
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local state
      dispatch(logout());
      queryClient.clear();
      setDropdownOpen(false);
      window.location.href = '/';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 lg:ml-72 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Enhanced Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/posts"
              className="text-2xl font-serif font-bold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
            >
              WisdomShare
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar placeholder="Search posts, users, or content..." />
          </div>

          {/* Enhanced Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
            >
              {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>

          {/* Center: Enhanced Main Navigation (visible on lg and up) */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to="/posts"
              className="px-4 py-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium"
            >
              Posts
            </Link>
            <Link
              to="/plan-management"
              className="px-4 py-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium"
            >
              Plan Management
            </Link>
            <Link
              to="/ranking"
              className="px-4 py-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium"
            >
              Ranking
            </Link>
            {/* Only show Free Plan link if user doesn't already have a free plan */}
            {!hasFreePlan && (
              <Link
                to="/free-subscription"
                className="px-4 py-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium"
              >
                Free Plan
              </Link>
            )}
          </div>

          {/* Right: Enhanced Actions */}
          <div className="flex items-center space-x-3">
            {userAuth ? (
              <>
                {/* User Plan Status */}
                <UserPlanStatus />

                <Link
                  to="/dashboard/create-post"
                  className="hidden md:flex items-center px-4 py-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium"
                >
                  <FaPen className="mr-2 w-4 h-4" />
                  <span>Write</span>
                </Link>

                <Link
                  to="/dashboard/notifications"
                  className="relative p-2.5 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  <FaBell className="w-5 h-5" />
                  {unreadData?.unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                      {unreadData.unreadCount}
                    </span>
                  )}
                </Link>

                {/* Enhanced Dark mode toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-lg text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  aria-label="Toggle dark mode"
                  title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
                </button>

                {/* Enhanced Profile dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    title="Profile menu"
                  >
                    <Avatar 
                      user={userAuth} 
                      size="md" 
                      className="w-full h-full"
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-3 z-50 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <Avatar user={userAuth} size="lg" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {userAuth?.username || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {userAuth?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaUser className="mr-3 text-gray-400 w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaUser className="mr-3 text-gray-400 w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          to="/dashboard/plan-management"
                          className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaUser className="mr-3 text-gray-400 w-4 h-4" />
                          Plan Management
                        </Link>
                        {userAuth?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <FaUser className="mr-3 text-gray-400 w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                      </div>

                      {/* Logout Section */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FaUser className="mr-3 text-red-400 w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Get started
                </Link>
                {/* Quick Pricing link for non-authenticated users on small screens */}
                <Link
                  to="/pricing"
                  className="md:hidden px-4 py-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium"
                >
                  Pricing
                </Link>

                {/* Enhanced Dark mode toggle for non-authenticated users */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-lg text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  aria-label="Toggle dark mode"
                  title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Navigation Menu */}
      {mobileMenuOpen && userAuth && (
        <div className="mobile-menu md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 relative z-40">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {/* User Info Section */}
            <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
              <Avatar user={userAuth} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {userAuth?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {userAuth?.email || 'No email'}
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <Link
              to="/posts"
              className="flex items-center px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaUser className="mr-3 text-gray-400 w-4 h-4" />
              Posts
            </Link>
            <Link
              to="/plan-management"
              className="flex items-center px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaUser className="mr-3 text-gray-400 w-4 h-4" />
              Plan Management
            </Link>
            <Link
              to="/ranking"
              className="flex items-center px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaUser className="mr-3 text-gray-400 w-4 h-4" />
              Ranking
            </Link>
            {/* Only show Free Plan link if user doesn't already have a free plan */}
            {!hasFreePlan && (
              <Link
                to="/free-subscription"
                className="flex items-center px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaUser className="mr-3 text-gray-400 w-4 h-4" />
                Free Plan
              </Link>
            )}
            <Link
              to="/dashboard/create-post"
              className="flex items-center px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaPen className="mr-3 text-gray-400 w-4 h-4" />
              Write
            </Link>
            <Link
              to="/dashboard/notifications"
              className="flex items-center px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaBell className="mr-3 text-gray-400 w-4 h-4" />
              Notifications
            </Link>

            {/* Dark Mode Toggle */}
            <div className="px-3 py-3">
              <button
                onClick={toggleDarkMode}
                className="flex items-center w-full px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <>
                    <FaSun className="mr-3 text-yellow-500 w-4 h-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <FaMoon className="mr-3 text-gray-400 w-4 h-4" />
                    Dark Mode
                  </>
                )}
              </button>
            </div>

            {/* Logout Button */}
            <div className="px-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <FaUser className="mr-3 text-red-400 w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;