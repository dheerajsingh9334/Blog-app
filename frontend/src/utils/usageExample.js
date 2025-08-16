// Usage Examples - How the new responsive utilities eliminate duplication

// ❌ BEFORE - Duplicated responsive patterns everywhere
const oldWay = {
  container: "p-2 sm:p-3 md:p-4 lg:p-6",
  button: "px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base",
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3",
  icon: "h-4 w-4 sm:h-5 sm:w-5",
  text: "text-sm sm:text-base lg:text-lg",
  modal: "max-w-xs sm:max-w-sm lg:max-w-md"
};

// ✅ AFTER - No duplication, reusable utilities
import { r, responsiveCombos } from './responsiveUtils';

const newWay = {
  container: r.p('xs'),                    // "p-2 sm:p-3 md:p-4 lg:p-6"
  button: responsiveCombos.button,         // "p-3 sm:p-4 py-2 sm:py-2.5 text-sm sm:text-base"
  grid: r.grid('cols3') + ' ' + r.gap('sm'), // "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3"
  icon: r.icon('sm'),                      // "h-4 w-4 sm:h-5 sm:w-5"
  text: r.text('md'),                      // "text-base sm:text-lg"
  modal: r.modal('md')                     // "max-w-sm sm:max-w-md lg:max-w-lg"
};

// Example usage in components:
export const ComponentExample = () => {
  return (
    <div className={r.p('xs')}>                    {/* Container padding */}
      <h1 className={r.text('lg')}>               {/* Responsive heading */}
        Title
      </h1>
      
      <div className={`${r.grid('cols2')} ${r.gap('md')}`}>
        {/* Responsive grid with gap */}
        <div className={r.p('sm')}>                {/* Card padding */}
          <p className={r.text('sm')}>            {/* Responsive text */}
            Content
          </p>
        </div>
      </div>
      
      <button className={responsiveCombos.button}> {/* Pre-built button combo */}
        Click me
      </button>
    </div>
  );
};

// Benefits:
// 1. No more copying "sm:px-3 md:px-4 lg:px-6" everywhere
// 2. Change responsive behavior in one place
// 3. Consistent responsive patterns across all components
// 4. Easy to understand and maintain
// 5. Type-safe with autocomplete


