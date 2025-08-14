// Avatar Configuration and Utilities

/**
 * Get default profile picture URL
 * @param {string} username - User's username
 * @param {string} size - Size of the avatar (xs, sm, md, lg, xl, 2xl, 3xl)
 * @returns {string} Default profile picture URL
 */
export const getDefaultProfilePic = (username = "User", size = "md") => {
  // You can customize this to return different default images
  // For now, returning a placeholder service URL
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 64,
    xl: 80,
    "2xl": 96,
    "3xl": 128
  };
  
  const pixelSize = sizeMap[size] || sizeMap.md;
  
  // Using DiceBear API for placeholder avatars with better fallback
  try {
    // Primary: DiceBear initials
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}&size=${pixelSize}&backgroundColor=4f46e5&textColor=ffffff`;
  } catch (error) {
    // Fallback: Simple placeholder
    return `https://via.placeholder.com/${pixelSize}x${pixelSize}/4f46e5/ffffff?text=${encodeURIComponent(username?.charAt(0)?.toUpperCase() || 'U')}`;
  }
};

/**
 * Get fallback initials for when profile picture fails to load
 * @param {string} username - User's username
 * @returns {string} User initials (max 2 characters)
 */
export const getInitials = (username = "U") => {
  if (!username) return "U";
  
  const names = username.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return username.substring(0, 2).toUpperCase();
};

/**
 * Generate gradient background class based on username
 * @param {string} username - User's username
 * @returns {string} Tailwind CSS gradient class
 */
export const getGradientClass = (username = "User") => {
  if (!username) return "from-gray-400 to-gray-600";
  
  const gradients = [
    "from-blue-400 to-blue-600",
    "from-green-400 to-green-600", 
    "from-purple-400 to-purple-600",
    "from-pink-400 to-pink-600",
    "from-yellow-400 to-yellow-600",
    "from-red-400 to-red-600",
    "from-indigo-400 to-indigo-600",
    "from-teal-400 to-teal-600"
  ];
  
  const hash = username.split("").reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return gradients[Math.abs(hash) % gradients.length];
};
