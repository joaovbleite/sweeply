import React from 'react';

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
const Separator: React.FC<SeparatorProps> = ({ 
  type = 'section',
  className = ''
}) => {
  if (type === 'section') {
    return (
      <div className={`w-full h-2 bg-gray-50 -mx-4 px-4 mb-8 shadow-inner ${className}`}></div>
    );
  }
  
  return (
    <div className={`w-full border-t border-gray-200 -mx-4 px-4 mb-4 ${className}`}></div>
  );
};

export default Separator;
