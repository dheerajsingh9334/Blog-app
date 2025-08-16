// Responsive utility system - eliminates duplication of responsive patterns

// Responsive breakpoint system
export const breakpoints = {
  sm: 'sm',
  md: 'md', 
  lg: 'lg',
  xl: 'xl',
  '2xl': '2xl'
};

// Responsive spacing utilities
export const responsiveSpacing = {
  // Padding
  p: {
    xs: 'p-2 sm:p-3 md:p-4 lg:p-6',
    sm: 'p-3 sm:p-4 md:p-5 lg:p-6',
    md: 'p-4 sm:p-6 md:p-8 lg:p-10',
    lg: 'p-6 sm:p-8 md:p-10 lg:p-12'
  },
  
  // Margin
  m: {
    xs: 'm-2 sm:m-3 md:m-4 lg:m-6',
    sm: 'm-3 sm:m-4 md:m-5 lg:m-6',
    md: 'm-4 sm:m-6 md:m-8 lg:m-10',
    lg: 'm-6 sm:m-8 md:m-10 lg:m-12'
  },
  
  // Margin bottom
  mb: {
    xs: 'mb-2 sm:mb-3',
    sm: 'mb-3 sm:mb-4',
    md: 'mb-4 sm:mb-6',
    lg: 'mb-6 sm:mb-8',
    xl: 'mb-8 sm:mb-10'
  },
  
  // Margin top
  mt: {
    xs: 'mt-2 sm:mt-3',
    sm: 'mt-3 sm:mt-4',
    md: 'mt-4 sm:mt-6',
    lg: 'mt-6 sm:mt-8'
  },
  
  // Gap
  gap: {
    xs: 'gap-2 sm:gap-3',
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  }
};

// Responsive text utilities
export const responsiveText = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  md: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl md:text-2xl',
  xl: 'text-xl sm:text-2xl md:text-3xl',
  '2xl': 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
};

// Responsive sizing utilities
export const responsiveSize = {
  // Width
  w: {
    full: 'w-full',
    auto: 'w-auto',
    screen: 'w-screen',
    min: 'w-min',
    max: 'w-max',
    fit: 'w-fit'
  },
  
  // Height
  h: {
    full: 'h-full',
    auto: 'h-auto',
    screen: 'h-screen',
    min: 'h-min',
    max: 'h-max',
    fit: 'h-fit'
  },
  
  // Icon sizes
  icon: {
    xs: 'h-3 w-3 sm:h-4 sm:w-4',
    sm: 'h-4 w-4 sm:h-5 sm:w-5',
    md: 'h-5 w-5 sm:h-6 sm:w-6',
    lg: 'h-6 w-6 sm:h-8 sm:w-8',
    xl: 'h-8 w-8 sm:h-10 sm:w-10'
  }
};

// Responsive layout utilities
export const responsiveLayout = {
  // Grid
  grid: {
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-1 sm:grid-cols-2',
    cols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    cols5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
  },
  
  // Flex direction
  flex: {
    col: 'flex-col',
    row: 'flex-row',
    'col-reverse': 'flex-col-reverse',
    'row-reverse': 'flex-row-reverse',
    'col-sm-row': 'flex-col sm:flex-row',
    'row-sm-col': 'flex-row sm:flex-col'
  },
  
  // Justify content
  justify: {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
    'center-sm-between': 'justify-center sm:justify-between'
  },
  
  // Align items
  items: {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
    'center-sm-start': 'items-center sm:items-start'
  }
};

// Responsive visibility utilities
export const responsiveVisibility = {
  hidden: {
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block',
    xl: 'hidden xl:block'
  },
  block: {
    sm: 'block sm:hidden',
    md: 'block md:hidden',
    lg: 'block lg:hidden',
    xl: 'block xl:hidden'
  }
};

// Responsive modal sizes
export const responsiveModal = {
  sm: 'max-w-xs sm:max-w-sm',
  md: 'max-w-sm sm:max-w-md lg:max-w-lg',
  lg: 'max-w-md sm:max-w-lg lg:max-w-xl',
  xl: 'max-w-lg sm:max-w-xl lg:max-w-2xl',
  full: 'max-w-full sm:max-w-2xl lg:max-w-4xl'
};

// Utility function to combine responsive classes
export const r = {
  // Responsive spacing
  p: (size) => responsiveSpacing.p[size] || '',
  m: (size) => responsiveSpacing.m[size] || '',
  mb: (size) => responsiveSpacing.mb[size] || '',
  mt: (size) => responsiveSpacing.mt[size] || '',
  gap: (size) => responsiveSpacing.gap[size] || '',
  
  // Responsive text
  text: (size) => responsiveText[size] || '',
  
  // Responsive size
  icon: (size) => responsiveSize.icon[size] || '',
  
  // Responsive layout
  grid: (cols) => responsiveLayout.grid[cols] || '',
  flex: (dir) => responsiveLayout.flex[dir] || '',
  justify: (pos) => responsiveLayout.justify[pos] || '',
  items: (pos) => responsiveLayout.items[pos] || '',
  
  // Responsive visibility
  hidden: (breakpoint) => responsiveVisibility.hidden[breakpoint] || '',
  block: (breakpoint) => responsiveVisibility.block[breakpoint] || '',
  
  // Responsive modal
  modal: (size) => responsiveModal[size] || '',
  
  // Pre-built responsive combinations
  button: {
    primary: 'px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-xs sm:text-sm lg:text-base',
    secondary: 'px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm',
    success: 'px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-xs sm:text-sm',
    danger: 'px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-xs sm:text-sm',
    outline: 'px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm'
  },
  
  input: {
    base: 'w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm',
    select: 'w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm',
    textarea: 'w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm resize-none'
  },
  
  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4',
    container: 'bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-xs sm:max-w-sm lg:max-w-md w-full max-h-[90vh] overflow-y-auto',
    header: 'flex items-center justify-between mb-3 sm:mb-4',
    title: 'text-base sm:text-lg font-semibold text-gray-900 dark:text-white',
    closeButton: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
    closeIcon: 'h-5 w-5 sm:h-6 sm:w-6',
    content: 'p-4 sm:p-6',
    form: 'space-y-3 sm:space-y-4',
    footer: 'flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700'
  },
  
  formField: {
    label: 'block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3',
    grid2: 'grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3',
    checkbox: 'h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
    checkboxLabel: 'ml-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300'
  },
  
  card: {
    base: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
    padding: 'p-3 sm:p-4 md:p-5 lg:p-6',
    hover: 'hover:shadow-md transition-shadow',
    header: 'mb-3 sm:mb-4 lg:mb-6',
    title: 'text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3'
  },
  
  text: {
    heading: {
      h1: 'text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white',
      h2: 'text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white',
      h3: 'text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white'
    },
    body: {
      base: 'text-sm sm:text-base text-gray-600 dark:text-gray-400',
      small: 'text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      large: 'text-base sm:text-lg text-gray-600 dark:text-gray-400'
    }
  }
};

// Common responsive combinations
export const responsiveCombos = {
  // Container with responsive padding
  container: responsiveSpacing.p.xs,
  
  // Section with responsive margin
  section: responsiveSpacing.mb.xl,
  
  // Card with responsive padding
  card: responsiveSpacing.p.sm,
  
  // Button with responsive text and padding
  button: `${responsiveSpacing.p.md} ${responsiveText.sm}`,
  
  // Input with responsive text and padding
  input: `${responsiveSpacing.p.sm} ${responsiveText.xs}`,
  
  // Modal with responsive sizing
  modal: responsiveModal.md,
  
  // Grid with responsive columns and gap
  grid: `${responsiveLayout.grid.cols2} ${responsiveSpacing.gap.sm}`,
  grid3: `${responsiveLayout.grid.cols3} ${responsiveSpacing.gap.sm}`
};
