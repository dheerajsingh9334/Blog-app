import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for handling swipe gestures on touch devices
 * @param {Object} options - Configuration options
 * @param {number} options.minSwipeDistance - Minimum distance for a swipe to be registered (default: 50)
 * @param {number} options.maxSwipeTime - Maximum time for a swipe gesture (default: 300ms)
 * @param {boolean} options.preventDefaultTouchmove - Whether to prevent default touchmove behavior (default: false)
 * @returns {Object} - Object containing swipe handlers and current swipe state
 */
const useSwipeHandler = ({
  minSwipeDistance = 50,
  maxSwipeTime = 300,
  preventDefaultTouchmove = false
} = {}) => {
  const [swipeState, setSwipeState] = useState({
    isSwiping: false,
    direction: null,
    distance: 0,
    velocity: 0
  });

  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const swipeStartTimeRef = useRef(null);

  // Reset swipe state
  const resetSwipe = () => {
    setSwipeState({
      isSwiping: false,
      direction: null,
      distance: 0,
      velocity: 0
    });
    touchStartRef.current = null;
    touchEndRef.current = null;
    swipeStartTimeRef.current = null;
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    swipeStartTimeRef.current = Date.now();
    
    setSwipeState(prev => ({
      ...prev,
      isSwiping: true
    }));
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;

    if (preventDefaultTouchmove) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    setSwipeState(prev => ({
      ...prev,
      distance,
      direction: getSwipeDirection(deltaX, deltaY)
    }));
  };

  // Handle touch end
  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || !touchEndRef.current) {
      resetSwipe();
      return;
    }

    const swipeTime = Date.now() - swipeStartTimeRef.current;
    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / swipeTime;

    // Check if swipe meets minimum requirements
    if (distance >= minSwipeDistance && swipeTime <= maxSwipeTime) {
      const direction = getSwipeDirection(deltaX, deltaY);
      
      setSwipeState(prev => ({
        ...prev,
        direction,
        distance,
        velocity,
        isSwiping: false
      }));

      // Trigger custom event for swipe completion
      const swipeEvent = new CustomEvent('swipeComplete', {
        detail: {
          direction,
          distance,
          velocity,
          deltaX,
          deltaY,
          duration: swipeTime
        }
      });
      
      if (e.target) {
        e.target.dispatchEvent(swipeEvent);
      }
    } else {
      resetSwipe();
    }
  };

  // Determine swipe direction based on deltas
  const getSwipeDirection = (deltaX, deltaY) => {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine primary direction
    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  };

  // Handle mouse events for desktop testing
  const handleMouseDown = (e) => {
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY
    };
    swipeStartTimeRef.current = Date.now();
    
    setSwipeState(prev => ({
      ...prev,
      isSwiping: true
    }));
  };

  const handleMouseMove = (e) => {
    if (!touchStartRef.current || !swipeState.isSwiping) return;

    touchEndRef.current = {
      x: e.clientX,
      y: e.clientY
    };

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    setSwipeState(prev => ({
      ...prev,
      distance,
      direction: getSwipeDirection(deltaX, deltaY)
    }));
  };

  const handleMouseUp = (e) => {
    if (!touchStartRef.current || !touchEndRef.current) {
      resetSwipe();
      return;
    }

    const swipeTime = Date.now() - swipeStartTimeRef.current;
    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / swipeTime;

    if (distance >= minSwipeDistance && swipeTime <= maxSwipeTime) {
      const direction = getSwipeDirection(deltaX, deltaY);
      
      setSwipeState(prev => ({
        ...prev,
        direction,
        distance,
        velocity,
        isSwiping: false
      }));

      const swipeEvent = new CustomEvent('swipeComplete', {
        detail: {
          direction,
          distance,
          velocity,
          deltaX,
          deltaY,
          duration: swipeTime
        }
      });
      
      if (e.target) {
        e.target.dispatchEvent(swipeEvent);
      }
    } else {
      resetSwipe();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetSwipe();
    };
  }, []);

  // Auto-reset swipe state after a delay
  useEffect(() => {
    if (swipeState.direction && !swipeState.isSwiping) {
      const timer = setTimeout(() => {
        resetSwipe();
      }, 100); // Reset after 100ms

      return () => clearTimeout(timer);
    }
  }, [swipeState.direction, swipeState.isSwiping]);

  // Create gesture handlers object
  const gestureHandlers = {
    // Touch events
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    
    // Mouse events (for desktop testing)
    onMouseDown: handleMouseDown,
    onMouseMove: swipeState.isSwiping ? handleMouseMove : undefined,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp, // Treat mouse leave as mouse up
  };

  // Utility functions for common swipe patterns
  const isSwipeLeft = () => swipeState.direction === 'left';
  const isSwipeRight = () => swipeState.direction === 'right';
  const isSwipeUp = () => swipeState.direction === 'up';
  const isSwipeDown = () => swipeState.direction === 'down';
  const isHorizontalSwipe = () => ['left', 'right'].includes(swipeState.direction);
  const isVerticalSwipe = () => ['up', 'down'].includes(swipeState.direction);

  // Advanced swipe detection
  const isFastSwipe = (threshold = 0.5) => swipeState.velocity > threshold;
  const isLongSwipe = (threshold = 100) => swipeState.distance > threshold;

  return {
    // Handlers to attach to elements
    gestureHandlers,
    
    // Current swipe state
    swipeState,
    
    // Utility functions
    isSwipeLeft,
    isSwipeRight,
    isSwipeUp,
    isSwipeDown,
    isHorizontalSwipe,
    isVerticalSwipe,
    isFastSwipe,
    isLongSwipe,
    
    // Manual control
    resetSwipe
  };
};

export default useSwipeHandler;
