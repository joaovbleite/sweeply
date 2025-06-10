import React, { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MonthSelectorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  userName?: string;
  jobCount?: number;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ 
  currentDate, 
  onDateChange,
  userName,
  jobCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [monthDirection, setMonthDirection] = useState<'left' | 'right' | null>(null);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMonthDirection('left');
    onDateChange(subMonths(currentDate, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMonthDirection('right');
    onDateChange(addMonths(currentDate, 1));
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Animation variants for month transitions
  const monthVariants = {
    initial: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -20 : 20,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? 20 : -20,
      opacity: 0,
      transition: { duration: 0.2 }
    })
  };

  return (
    <div className="relative">
      <motion.button 
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-lg font-medium text-gray-800 focus:outline-none p-1 rounded-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex flex-col">
          <div className="flex items-center">
            <AnimatePresence mode="wait" initial={false} custom={monthDirection}>
              <motion.span
                key={format(currentDate, 'MMMM-yyyy')}
                custom={monthDirection}
                variants={monthVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="mr-1"
              >
                {format(currentDate, 'MMMM yyyy')}
              </motion.span>
            </AnimatePresence>
            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          {userName && (
            <div className="text-sm text-gray-500 font-normal">
              {userName}
            </div>
          )}
        </div>
      </motion.button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-lg z-20">
          <div className="flex justify-between items-center p-2">
            <motion.button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.button>
            <AnimatePresence mode="wait" initial={false} custom={monthDirection}>
              <motion.span
                key={format(currentDate, 'MMMM-yyyy-dropdown')}
                custom={monthDirection}
                variants={monthVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="font-medium"
              >
                {format(currentDate, 'MMMM yyyy')}
              </motion.span>
            </AnimatePresence>
            <motion.button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthSelector; 