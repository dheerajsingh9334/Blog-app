import { useState } from 'react';

/**
 * Optimized Image Component with lazy loading and error handling
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/vite.svg',
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
