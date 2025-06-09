import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay } from 'date-fns';

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
  jobCount = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentDate);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update selectedMonth when currentDate changes
  useEffect(() => {
    setSelectedMonth(currentDate);
  }, [currentDate]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Navigate to previous/next month
  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'prev' 
      ? subMonths(selectedMonth, 1) 
      : addMonths(selectedMonth, 1);
    
    setSelectedMonth(newMonth);
  };

  // Handle day selection
  const selectDay = (day: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setDate(day);
    onDateChange(newDate);
    setIsExpanded(false);
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDayOfMonth = getDay(startOfMonth(selectedMonth));
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day invisible"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = 
        day === currentDate.getDate() && 
        selectedMonth.getMonth() === currentDate.getMonth() && 
        selectedMonth.getFullYear() === currentDate.getFullYear();
      
      const isSelected = 
        day === currentDate.getDate() && 
        selectedMonth.getMonth() === currentDate.getMonth() && 
        selectedMonth.getFullYear() === currentDate.getFullYear();
      
      days.push(
        <div 
          key={day} 
          onClick={() => selectDay(day)}
          className={`calendar-day cursor-pointer h-9 w-9 flex items-center justify-center rounded-full hover:bg-green-100 transition-colors ${
            isSelected ? 'bg-[#307842] text-white' : 
            isCurrentDay ? 'border-2 border-[#307842] text-[#307842]' : ''
          }`}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  // Toggle dropdown
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="calendar-month-selector relative z-50" ref={containerRef}>
      {/* Month header with toggle */}
      <button 
        className="flex items-center px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
        onClick={toggleDropdown}
        aria-expanded={isExpanded}
        aria-haspopup="true"
      >
        <div className="text-2xl font-bold text-[#1a2e35]">
          {format(currentDate, 'MMMM')}
        </div>
        <div className="ml-2">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-[#1a2e35]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#1a2e35]" />
          )}
        </div>
      </button>

      {/* Expandable calendar */}
      {isExpanded && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40" 
            onClick={() => setIsExpanded(false)}
            aria-hidden="true"
          ></div>
          <div className="fixed inset-x-0 top-0 bottom-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-xs mx-4 overflow-hidden">
              {/* Title with month/year */}
              <div className="text-center p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      changeMonth('prev');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <div className="text-xl font-bold text-gray-900">
                    {format(selectedMonth, 'MMMM yyyy')}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      changeMonth('next');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Week day labels */}
              <div className="grid grid-cols-7 gap-1 px-4 py-3 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1 px-4 pb-4">
                {generateCalendarDays()}
              </div>
              
              {/* User info and job count */}
              {userName && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-lg font-medium text-[#1a2e35]">
                    {userName}
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                    {jobCount} jobs
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthSelector; 