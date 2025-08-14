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
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { FaBlog, FaPen, FaBell, FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUnreadNotificationCountAPI } from "../../APIServices/notifications/nofitificationsAPI";
import { getUserPlanAndUsageAPI, logoutAPI } from "../../APIServices/users/usersAPI";
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
          // Earnings removed
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { userAuth: authUser } = useSelector((state) => state.auth);
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Fetch real notification count
  const { data: unreadCount } = useQuery({
    queryKey: ["notification-count"],
    queryFn: getUnreadNotificationCountAPI,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/50 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="w-full px-8 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between h-20">
            {/* Left: Logo and Sidebar Toggle */}
            <div className="flex items-center space-x-8">
              {/* Sidebar Toggle Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors"
                title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
              >
                {sidebarOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
              </button>
              
              {/* Logo */}
              <Link
                to="/posts"
                className="text-2xl font-serif font-bold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                WisdomShare
              </Link>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <SearchBar placeholder="Search posts, users, or content..." />
            </div>



            {/* Mobile menu button - Only show on small screens when sidebar is closed */}
            <div className="lg:hidden">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors"
              >
                {sidebarOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
              </button>
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
            <div className="flex items-center space-x-6">
              {userAuth ? (
                <>
                  {/* User Plan Status */}
                  <UserPlanStatus />

                  <Link
                    to="/dashboard/create-post"
                    className="hidden md:flex items-center text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                  >
                    <FaPen className="mr-1" />
                    <span>Write</span>
                  </Link>

                  <Link
                    to="/dashboard/notifications"
                    className="relative text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                  >
                    <FaBell />
                    {unreadCount?.unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount.unreadCount}
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
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          style={{ top: '80px' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ top: '80px' }}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          {/* Empty space - logo removed */}
        </div>
        
        <nav className="flex-1 px-6 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={classNames(
                    item.current
                      ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600",
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={classNames(
                      item.current ? "text-green-600" : "text-gray-400 group-hover:text-green-600",
                      "h-5 w-5 mr-3"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                  {item.current && (
                    <CheckIcon className="h-5 w-5 text-green-500 ml-auto" aria-hidden="true" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile sidebar footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <Link 
            to="/dashboard/notifications" 
            className="group flex items-center justify-between mb-4"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-gray-400 group-hover:text-green-600" />
              Notifications
            </span>
            {unreadCount?.unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                {unreadCount.unreadCount}
              </span>
            )}
          </Link>
          
          <Link
            to="/dashboard/settings"
            className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600 rounded-md transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <Cog6ToothIcon
              className="h-5 w-5 mr-3 text-gray-400 group-hover:text-green-600"
              aria-hidden="true"
            />
            Settings
          </Link>

          {/* User profile */}
           {authUser && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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

      {/* Desktop sidebar - Using mobile sidebar design */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:w-64' : 'lg:w-0 lg:overflow-hidden'}`} style={{ top: '80px' }}>
        <div className={`flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white dark:bg-gray-800 px-6 pb-4 transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'lg:opacity-0'}`}>
          <div className="flex h-16 shrink-0 items-center justify-between">
            {/* Empty space - logo removed */}
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Navigation</h2>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600",
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
                  )}
                >
                  <item.icon
                    className={classNames(
                      item.current ? "text-green-600" : "text-gray-400 group-hover:text-green-600",
                      "h-5 w-5 mr-3"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                  {item.current && (
                    <CheckIcon className="h-5 w-5 text-green-500 ml-auto" aria-hidden="true" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link 
              to="/dashboard/notifications" 
              className="group flex items-center justify-between mb-4"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <BellIcon className="h-5 w-5 mr-2 text-gray-400 group-hover:text-green-600" />
                Notifications
              </span>
              {unreadCount?.unreadCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  {unreadCount.unreadCount}
                </span>
              )}
            </Link>
          </div>

          <div className="mt-4">
            <Link
              to="/dashboard/settings"
              className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600 rounded-md transition-colors"
            >
              <Cog6ToothIcon
                className="h-5 w-5 mr-3 text-gray-400 group-hover:text-green-600"
                aria-hidden="true"
              />
              Settings
            </Link>
          </div>

          {/* User profile section */}
          {authUser && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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

      {/* Main content area */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`} style={{ marginTop: '80px' }}>
        <main className="pt-12 pb-8 w-full min-w-0 overflow-x-hidden">
          <div className="px-8 sm:px-10 lg:px-16 w-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}