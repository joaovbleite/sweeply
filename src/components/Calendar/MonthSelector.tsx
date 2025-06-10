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
            isCurrentDay ? 'border-2 border-[#307842] text-[#307842]' : 'text-gray-700'
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
    <div className="calendar-month-selector relative" ref={containerRef}>
      {/* Month header with toggle */}
      <button 
        className="flex items-center px-2 py-1 rounded-lg hover:bg-green-50 transition-colors cursor-pointer" 
        onClick={toggleDropdown}
        aria-expanded={isExpanded}
        aria-haspopup="true"
      >
        <div className="text-2xl font-bold text-[#1a2e35]">
          {format(currentDate, 'MMMM')}
        </div>
        <div className="ml-2">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-[#307842]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#307842]" />
          )}
        </div>
      </button>

      {/* Inline calendar dropdown - fixed positioning */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-20" onClick={() => setIsExpanded(false)}>
          <div 
            className="absolute left-4 right-4 top-[130px] md:left-auto md:right-auto md:w-[320px] bg-white rounded-xl shadow-xl border border-gray-200 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ transform: 'translateX(0)', maxWidth: '100%' }}
          >
            {/* Title with month/year */}
            <div className="text-center p-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    changeMonth('prev');
                  }}
                  className="p-1.5 hover:bg-green-50 rounded-full"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-5 w-5 text-[#307842]" />
                </button>
                <div className="text-lg font-bold text-gray-900">
                  {format(selectedMonth, 'MMMM yyyy')}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    changeMonth('next');
                  }}
                  className="p-1.5 hover:bg-green-50 rounded-full"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-5 w-5 text-[#307842]" />
                </button>
              </div>
            </div>

            {/* Week day labels */}
            <div className="grid grid-cols-7 gap-1 px-3 py-2 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-sm font-medium text-[#307842]">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 px-3 pb-3">
              {generateCalendarDays()}
            </div>
            
            {/* User info and job count */}
            {userName && (
              <div className="p-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm font-medium text-[#1a2e35] truncate max-w-[160px]">
                  {userName}
                </div>
                <div className="bg-green-100 text-[#307842] px-2 py-1 rounded-full text-xs font-medium">
                  {jobCount} jobs
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthSelector; 