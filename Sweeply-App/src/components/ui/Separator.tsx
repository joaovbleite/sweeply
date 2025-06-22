import React, { forwardRef } from 'react';

interface SeparatorProps {
  type?: 'section' | 'item';
  className?: string;
}

/**
 * A reusable separator component for visual separation between sections or items.
 * 
 * @param type - 'section' for major section breaks (thicker with background), 'item' for minor separations (thin line)
 * @param className - Additional classes to apply to the separator
 */
const Separator = forwardRef<HTMLDivElement, SeparatorProps>(({ 
  type = 'section',
  className = ''
}, ref) => {
  if (type === 'section') {
    return (
      <div 
        ref={ref}
        className={`w-full h-2 bg-gray-50 -mx-4 px-4 mb-8 shadow-inner ${className}`}
      ></div>
    );
  }
  
  return (
    <div 
      ref={ref}
      className={`w-full border-t border-gray-200 -mx-4 px-4 mb-4 ${className}`}
    ></div>
  );
});

Separator.displayName = 'Separator';

export default Separator;
