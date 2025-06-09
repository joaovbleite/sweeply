import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isCurrentDay ? 'today' : ''}`}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="calendar-month-selector">
      {/* Month header with toggle */}
      <div 
        className="flex items-center cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
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
      </div>

      {/* Expandable calendar */}
      {isExpanded && (
        <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-full max-w-md animate-slide-down">
          {/* Month navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button 
              onClick={() => changeMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronDown className="h-5 w-5 text-gray-600 rotate-90" />
            </button>
            
            <div className="text-lg font-semibold text-gray-900">
              {format(selectedMonth, 'MMMM yyyy')}
            </div>
            
            <button 
              onClick={() => changeMonth('next')}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronDown className="h-5 w-5 text-gray-600 -rotate-90" />
            </button>
          </div>
          
          {/* Weekday headers */}
          <div className="calendar-month-grid p-4 pb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="calendar-month-grid p-4 pt-0">
            {generateCalendarDays()}
          </div>
        </div>
      )}
      
      {/* User info and job count - only shown when calendar is expanded */}
      {isExpanded && userName && (
        <div className="absolute left-0 top-full mt-[340px] bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-full max-w-md p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium text-[#1a2e35]">
              {userName}
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
              {jobCount}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthSelector; 