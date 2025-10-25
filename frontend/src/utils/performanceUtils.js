/**
 * Performance utilities for optimizing React components
 */

/**
 * Debounce function to limit the rate at which a function can fire
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to ensure a function is called at most once in a specified time period
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} - The throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Preload an image
 * @param {string} src - The image source URL
 * @returns {Promise} - Resolves when image is loaded
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Lazy load images that enter the viewport
 * @param {HTMLElement} element - The element to observe
 * @param {Function} callback - Callback when element enters viewport
 */
export const observeIntersection = (element, callback) => {
  const options = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, options);

  observer.observe(element);
  return observer;
};

/**
 * Check if reduced motion is preferred
 * @returns {boolean}
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get connection speed for adaptive loading
 * @returns {string} - Connection type (slow-2g, 2g, 3g, 4g, unknown)
 */
export const getConnectionSpeed = () => {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  return connection?.effectiveType || 'unknown';
};

/**
 * Check if connection is slow
 * @returns {boolean}
 */
export const isSlowConnection = () => {
  const speed = getConnectionSpeed();
  return speed === 'slow-2g' || speed === '2g';
};

/**
 * Measure and log performance metrics
 * @param {string} name - Metric name
 */
export const measurePerformance = (name) => {
  if (import.meta.env.DEV && performance.mark) {
    performance.mark(name);
    const measures = performance.getEntriesByName(name);
    if (measures.length > 0) {
      console.log(`⚡ ${name}:`, measures[measures.length - 1].duration, 'ms');
    }
  }
};

/**
 * Request idle callback with fallback
 * @param {Function} callback - Function to execute when idle
 * @param {Object} options - Options for requestIdleCallback
 */
export const requestIdleCallbackPolyfill = (callback, options) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  // Fallback for browsers that don't support requestIdleCallback
  return setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 1);
};
