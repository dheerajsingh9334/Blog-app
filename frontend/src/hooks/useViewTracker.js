import { useEffect, useRef } from 'react';
import { trackPostViewAPI } from '../APIServices/posts/postsAPI';

const useViewTracker = (postId, isAuthenticated = false) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    const trackView = async () => {
      // Only track if user is authenticated, post exists, and hasn't been tracked yet
      if (!isAuthenticated || !postId || hasTracked.current) {
        return;
      }

      try {
        await trackPostViewAPI(postId);
        hasTracked.current = true;
        console.log('View tracked for post:', postId);
      } catch (error) {
        // Silently fail - view tracking shouldn't interrupt user experience
        console.warn('Failed to track view:', error.message);
      }
    };

    // Track view after a short delay to ensure user actually viewed the content
    const timer = setTimeout(() => {
      trackView();
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [postId, isAuthenticated]);

  return null;
};

export default useViewTracker;
