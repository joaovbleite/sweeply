import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar as CalendarIcon, Search, Settings, Plus, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks, addMonths, subMonths, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { jobsApi } from '../lib/api/jobs';
import { Job } from '../types/job';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import ViewOptionsModal, { ViewOptionsState } from '../components/schedule/ViewOptionsModal';
import MonthSelector from '../components/Calendar/MonthSelector';
import { AnimatePresence, motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';

// Add an interface for the HTMLDivElement with scrollTimeout
interface DivWithScrollTimeout extends HTMLDivElement {
  scrollTimeout?: number;
}

const Schedule = () => {
  const { t } = useTranslation(['calendar', 'common']);
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewOptionsModalOpen, setIsViewOptionsModalOpen] = useState(false);
  const [weekDirection, setWeekDirection] = useState<'left' | 'right' | null>(null);
  const [animatingWeekChange, setAnimatingWeekChange] = useState(false);
  
  // Ref for week day scroll container
  const weekDaysRef = useRef<HTMLDivElement>(null);
  
  // Touch handling for swipe detection
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // View options state
  const [viewOptions, setViewOptions] = useState<ViewOptionsState>({
    view: 'Day',
    showUnscheduledAppointments: false,
    showWeekends: true,
    selectedTeamMembers: ['1'] // Default to victor leite selected
  });
  
  // Load jobs data
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const jobsData = await jobsApi.getAllWithInstances();
        setJobs(jobsData);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadJobs();
  }, []);
  
  // Get week dates for display - show 3 weeks for scrolling (prev, current, next)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const prevWeekStart = subWeeks(weekStart, 1);
  const nextWeekStart = addWeeks(weekStart, 1);
  
  // Create an array with 21 days (3 weeks)
  const allWeekDays = [
    ...Array.from({ length: 7 }, (_, i) => addDays(prevWeekStart, i)),
    ...Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    ...Array.from({ length: 7 }, (_, i) => addDays(nextWeekStart, i))
  ];
  
  // Current week days (for other parts of the app that use this)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Get jobs for the selected day
  const dayJobs = jobs.filter(job => {
    if (!job.scheduled_date) return false;
    const matches = isSameDay(new Date(job.scheduled_date), currentDate);
    
    if (searchTerm && job.client?.name) {
      return matches && job.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return matches;
  });
  
  // Handle date selection
  const handleDateSelect = (date: Date, index?: number) => {
    setCurrentDate(date);
    
    // If selected day is in prev/next week, update current date for proper week display
    if (index !== undefined) {
      if (index < 7) {
        // Previous week selection
        setWeekDirection('left');
        setCurrentDate(subWeeks(date, 1));
      } else if (index >= 14) {
        // Next week selection
        setWeekDirection('right');
        setCurrentDate(addWeeks(date, 1));
      }
    }
  };

  // Handle week navigation with improved animation
  const navigateWeek = (direction: 'prev' | 'next') => {
    if (animatingWeekChange) return; // Prevent multiple animations at once
    
    setAnimatingWeekChange(true);
    setWeekDirection(direction === 'prev' ? 'left' : 'right');
    
    // First animate visually, then update the actual data
    setTimeout(() => {
      // Then update the actual data - always move exactly one week
      const newDate = direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
      setCurrentDate(newDate);
      setAnimatingWeekChange(false);
    }, 150); // Reduced from 300ms to 150ms for faster transitions
  };

  // Go to today
  const goToToday = () => {
    // If we're already on today, don't animate
    if (isSameDay(currentDate, new Date())) return;
    
    // Determine which direction to animate based on current date vs today
    const today = new Date();
    const direction = today > currentDate ? 'right' : 'left';
    setWeekDirection(direction);
    setAnimatingWeekChange(true);
    
    // First animate visually
    setTimeout(() => {
      // Then update the actual data
      setCurrentDate(today);
      setAnimatingWeekChange(false);
    }, 150); // Reduced from 300ms to 150ms to match other animations
  };

  // Handling touch events for swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    if (animatingWeekChange) return; // Prevent interaction during animation
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (animatingWeekChange) return; // Prevent interaction during animation
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (animatingWeekChange) return; // Prevent interaction during animation
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      navigateWeek('next');
    }
    
    if (isRightSwipe) {
      navigateWeek('prev');
    }
  };

  // Handle wheel event handler for desktop scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (animatingWeekChange) return; // Prevent interaction during animation
    
    // Prevent default browser scroll behavior
    e.preventDefault();
    
    // Check scroll direction
    if (e.deltaX > 50) {
      // Scrolling right (next week)
      navigateWeek('next');
    } else if (e.deltaX < -50) {
      // Scrolling left (previous week)
      navigateWeek('prev');
    }
  };

  // Open view options modal
  const openViewOptionsModal = () => {
    setIsViewOptionsModalOpen(true);
  };

  // Close view options modal
  const closeViewOptionsModal = () => {
    setIsViewOptionsModalOpen(false);
  };

  // Apply view options
  const applyViewOptions = (options: ViewOptionsState) => {
    setViewOptions(options);
  };

  // Render week day selector with improved horizontal sliding animation
  const renderHorizontalDayScroller = () => {
    // Animation direction for Framer Motion
    const variants = {
      enter: (direction: 'left' | 'right' | null) => ({
        x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
        opacity: 0,
      }),
      center: {
        x: 0,
        opacity: 1,
        transition: { 
          x: { type: 'spring', stiffness: 400, damping: 25, duration: 0.15 }, 
          opacity: { duration: 0.1 } 
        },
      },
      exit: (direction: 'left' | 'right' | null) => ({
        x: direction === 'left' ? '100%' : direction === 'right' ? '-100%' : 0,
        opacity: 0,
        transition: { 
          x: { type: 'spring', stiffness: 400, damping: 25, duration: 0.15 }, 
          opacity: { duration: 0.1 } 
        },
      }),
    };

    // Preload next and previous week data to avoid white flash
    const prevWeekDays = Array.from({ length: 7 }, (_, i) => addDays(subWeeks(weekStart, 1), i));
    const nextWeekDays = Array.from({ length: 7 }, (_, i) => addDays(addWeeks(weekStart, 1), i));

    return (
      <div 
        className="px-0 pb-4 border-b border-gray-200 relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Week days carousel */}
        <AnimatePresence initial={false} custom={weekDirection} mode="wait">
          <motion.div
            key={format(weekStart, 'yyyy-MM-dd')}
            custom={weekDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex justify-between px-4"
          >
            {weekDays.map((day, index) => {
              const isSelectedDay = isSameDay(day, currentDate);
              const isDayToday = isToday(day);
              
            return (
                <div 
                  key={index}
                onClick={() => handleDateSelect(day)}
                  className="flex-1 flex flex-col items-center py-3 cursor-pointer"
                >
                  <div className="text-sm text-gray-500 font-medium">
                    {format(day, 'EEE')}
                  </div>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mt-1
                    ${isSelectedDay 
                      ? 'bg-blue-600 text-white' 
                        : isDayToday
                        ? 'border-2 border-blue-600 text-blue-600' 
                        : 'text-gray-800'
                    }
                  `}>
                    {format(day, 'd')}
                  </div>
                </div>
            );
          })}
          </motion.div>
        </AnimatePresence>

        {/* Hidden preload elements to ensure next/prev weeks are ready */}
        <div className="hidden">
          {prevWeekDays.map((day, index) => (
            <span key={`prev-${index}`}>{format(day, 'EEE d')}</span>
          ))}
          {nextWeekDays.map((day, index) => (
            <span key={`next-${index}`}>{format(day, 'EEE d')}</span>
          ))}
        </div>
      </div>
    );
  };

  // Render Day View with updated styling
  const renderDayView = () => {
    // Generate hours from 12 AM to 11 PM
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Ref for the scrollable container
    const hoursContainerRef = useRef<HTMLDivElement>(null);
    
    // Scroll to current time on mount or when currentDate changes to today
    useEffect(() => {
      if (hoursContainerRef.current) {
        // Each hour row is about 80px tall
        const scrollTo = isToday(currentDate) 
          ? currentHour * 80 + (currentMinute / 60) * 80 - 120 // Offset for header
          : 0; // Start at top if not today
        
        hoursContainerRef.current.scrollTo({ top: Math.max(scrollTo, 0), behavior: 'smooth' });
      }
    }, [currentDate, hoursContainerRef.current]);

    // Calculate position for current time indicator
    const currentTimePosition = ((currentHour * 60 + currentMinute) / (24 * 60)) * 100;

    return (
      <div className="flex flex-col h-full">
        {/* User row */}
        <div className="flex items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="text-lg font-semibold text-gray-800">
            {user?.user_metadata?.full_name || 'Joao'}
          </div>
          <div className="ml-auto text-sm font-medium text-gray-500">
            0/1
          </div>
        </div>
        {/* Scrollable hours container */}
        <div className="flex-1 overflow-y-auto" ref={hoursContainerRef}>
          <div className="relative">
            {/* Current time indicator */}
            {isToday(currentDate) && (
              <div
                className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                style={{ top: `${currentTimePosition}%` }}
              >
                <div className="w-2 h-2 rounded-full bg-blue-600 ml-4"></div>
                <div className="h-0.5 bg-blue-600 flex-1"></div>
              </div>
            )}
            {/* Hours */}
            {hours.map((hour) => (
              <div key={hour} className="flex border-t border-gray-200 first:border-t-0">
                {/* Time column */}
                <div className="w-16 py-6 px-2 text-right text-gray-600 font-medium">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                {/* Content column */}
                <div className="flex-1 min-h-[80px]">
                  {dayJobs.filter(job => {
                    if (!job.scheduled_date) return false;
                    const jobDate = new Date(job.scheduled_date);
                    return jobDate.getHours() === hour;
                  }).map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="block bg-blue-100 border-l-4 border-blue-600 p-2 m-1 rounded"
                    >
                      <div className="font-medium text-blue-800">{job.client?.name}</div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(job.scheduled_date), 'h:mm a')}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render List View with updated styling
  const renderListView = () => {
    try {
      if (loading) {
        return (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        );
      }

      if (!dayJobs || dayJobs.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center h-64 bg-[#f8f8f6]">
            <p className="text-gray-600 font-medium">No visits scheduled today</p>
          </div>
        );
      }

      return (
        <div className="bg-[#f8f8f6] h-full overflow-y-auto">
          <div className="flex items-center justify-between p-4 sticky top-0 bg-[#f8f8f6] z-10">
            <div className="text-lg font-semibold text-gray-800">
              {user?.user_metadata?.full_name || 'Joao'}
            </div>
            <div className="text-sm font-medium text-gray-500">
              {`0/${dayJobs?.length || 0}`}
            </div>
          </div>
          
          <div className="p-4 pt-0">
            {(dayJobs || []).map(job => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="block bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
              >
                <div className="flex">
                  {/* Blue vertical line */}
                  <div className="w-1.5 bg-blue-600 self-stretch"></div>
                  
                  <div className="p-4 flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{job.title || 'Untitled Job'}</h3>
                    <p className="text-base text-gray-800 mt-1">{job.client?.name || 'Unknown Client'}</p>
                    <p className="text-base text-gray-700 mt-2">
                      {job.scheduled_time 
                        ? `${format(new Date(`2000-01-01T${job.scheduled_time}`), 'h:mm a')} - ${format(new Date(`2000-01-01T${job.scheduled_time}`).setHours(new Date(`2000-01-01T${job.scheduled_time}`).getHours() + 2), 'h:mm a')}`
                        : 'No time specified'}
                    </p>
                    <p className="text-base text-gray-700 mt-1">{job.address || 'No address'}</p>
                    {job.description && (
                      <p className="text-base text-gray-700 mt-2">{job.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error rendering list view:", error);
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-[#f8f8f6]">
          <p className="text-red-600 font-medium">Something went wrong displaying the list view</p>
          <button 
            onClick={() => setViewOptions(prev => ({ ...prev, view: 'Day' }))}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Switch to Day View
          </button>
        </div>
      );
    }
  };
  
  return (
    <AppLayout>
      {/* Page Header with Month as title */}
        <PageHeader
        title={format(currentDate, 'MMMM')}
          rightElement={
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              aria-label="Calendar"
            >
              <CalendarIcon className="w-4 h-4" />
              </button>
            <button
              onClick={openViewOptionsModal}
              className="p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              aria-label={t('calendar:settings')}
            >
              <Settings className="w-4 h-4" />
              </button>
            </div>
          }
        />
        
      {/* View selector tabs */}
      <div className="px-4 py-2">
        <div className="w-full bg-gray-100 p-1 rounded-full flex">
          {['Day', 'List'].map(view => (
              <button 
                key={view}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
                  viewOptions.view === view 
                    ? 'bg-white text-blue-600 shadow' 
                    : 'text-gray-600'
                }`}
              onClick={() => setViewOptions(prev => ({ ...prev, view: view as 'Day' | 'List' }))}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
        
      {/* Calendar View */}
      <div className="flex-1 flex flex-col">
        {/* Render the horizontal day scroller (without initials) */}
        {renderHorizontalDayScroller()}
        
        {/* Render the appropriate view based on viewOptions */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {viewOptions.view === 'Day' && renderDayView()}
          {viewOptions.view === 'List' && renderListView()}
        </div>
      </div>

      {/* View Options Modal */}
      <ViewOptionsModal
        isOpen={isViewOptionsModalOpen}
        onClose={closeViewOptionsModal}
        onApply={applyViewOptions}
        initialOptions={viewOptions}
      />
    </AppLayout>
  );
};

export default Schedule; 