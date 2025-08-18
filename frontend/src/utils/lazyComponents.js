import React, { Suspense } from 'react';
import LazyErrorBoundary, { PageLoader } from '../components/Lazy/LazyWrapper';

// HOC for wrapping lazy components
export const withLazyLoading = (Component, fallbackMessage = "Loading...") => {
  const WrappedComponent = React.forwardRef((props, ref) => (
    <LazyErrorBoundary>
      <Suspense fallback={<PageLoader message={fallbackMessage} />}>
        <Component {...props} ref={ref} />
      </Suspense>
    </LazyErrorBoundary>
  ));
  
  WrappedComponent.displayName = `withLazyLoading(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
};

// Lazy load main components
export const LazyPostsList = withLazyLoading(
  React.lazy(() => import('../components/Posts/PostsList')),
  "Loading posts..."
);

export const LazyDashboard = withLazyLoading(
  React.lazy(() => import('../components/User/Dashboard')),
  "Loading dashboard..."
);

export const LazyProfile = withLazyLoading(
  React.lazy(() => import('../components/User/Profile')),
  "Loading profile..."
);

export const LazyCreatePost = withLazyLoading(
  React.lazy(() => import('../components/Posts/CreatePost')),
  "Loading editor..."
);

export const LazyPricing = withLazyLoading(
  React.lazy(() => import('../components/Plans/Pricing')),
  "Loading pricing..."
);

export const LazyPlanManagement = withLazyLoading(
  React.lazy(() => import('../components/Plans/PlanManagement')),
  "Loading plan management..."
);

export const LazyCheckoutForm = withLazyLoading(
  React.lazy(() => import('../components/Plans/CheckoutForm')),
  "Loading checkout..."
);

export const LazyTrendingPosts = withLazyLoading(
  React.lazy(() => import('../components/Posts/TrendingPosts')),
  "Loading trending posts..."
);

export const LazySavedPosts = withLazyLoading(
  React.lazy(() => import('../components/Posts/SavedPosts')),
  "Loading saved posts..."
);

export const LazyUserProfile = withLazyLoading(
  React.lazy(() => import('../components/User/UserProfile')),
  "Loading user profile..."
);

export const LazySearchResults = withLazyLoading(
  React.lazy(() => import('../components/Search/SearchResults')),
  "Loading search results..."
);

export const LazyAnalytics = withLazyLoading(
  React.lazy(() => import('../components/Analytics/Analytics')),
  "Loading analytics..."
);

export const LazyContentCalendar = withLazyLoading(
  React.lazy(() => import('../components/Calendar/ContentCalendar')),
  "Loading calendar..."
);

export const LazyAdvancedAnalytics = withLazyLoading(
  React.lazy(() => import('../components/Analytics/AdvancedAnalytics')),
  "Loading advanced analytics..."
);

export const LazyNotifications = withLazyLoading(
  React.lazy(() => import('../components/Notification/Notifications')),
  "Loading notifications..."
);

export const LazySettings = withLazyLoading(
  React.lazy(() => import('../components/User/Settings')),
  "Loading settings..."
);

// Admin components - separate chunk
export const LazyAdminMainDashboard = withLazyLoading(
  React.lazy(() => import('../components/Admin/AdminMainDashboard')),
  "Loading admin dashboard..."
);

export const LazyAdminAnalytics = withLazyLoading(
  React.lazy(() => import('../components/Admin/AdminAnalytics')),
  "Loading admin analytics..."
);

export const LazyUserManagement = withLazyLoading(
  React.lazy(() => import('../components/Admin/UserManagement')),
  "Loading user management..."
);

export const LazyPostManagement = withLazyLoading(
  React.lazy(() => import('../components/Admin/PostManagement')),
  "Loading post management..."
);

export const LazyCommentManagement = withLazyLoading(
  React.lazy(() => import('../components/Admin/CommentManagement')),
  "Loading comment management..."
);

export const LazyAdminPlanManagement = withLazyLoading(
  React.lazy(() => import('../components/Admin/PlanManagement')),
  "Loading admin plan management..."
);

export const LazySystemSettings = withLazyLoading(
  React.lazy(() => import('../components/Admin/SystemSettings')),
  "Loading system settings..."
);

export const LazyAdminProfile = withLazyLoading(
  React.lazy(() => import('../components/Admin/AdminProfile')),
  "Loading admin profile..."
);

export const LazyAdminNotifications = withLazyLoading(
  React.lazy(() => import('../components/Admin/AdminNotifications')),
  "Loading admin notifications..."
);
