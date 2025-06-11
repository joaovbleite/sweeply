import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar as CalendarIcon, Search, Settings, Plus, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks, addMonths, subMonths, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { jobsApi } from '@/lib/api/jobs';
import { Job } from '@/types/job';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import ViewOptionsModal, { ViewOptionsState } from '@/components/schedule/ViewOptionsModal';
import MonthSelector from '@/components/Calendar/MonthSelector';
import { AnimatePresence, motion } from 'framer-motion';
import PageHeader from "@/components/ui/PageHeader";

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
    showWeekends: false,
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
    
    // First animate visually
    setTimeout(() => {
      // Then update the actual data
      const newDate = direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
      setCurrentDate(newDate);
      setAnimatingWeekChange(false);
    }, 300); // Match this with the animation duration
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
    }, 300);
  };

  // Handling touch events for swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
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

  // Render week day selector with smooth animations
  const renderWeekDaySelector = () => {
    // Calculate positions for week day slider
    const weekDayTouchScrollHandler = (event: React.TouchEvent) => {
      event.stopPropagation(); // Prevent parent containers from handling the touch
      // Touch scrolling is handled by browser's natural behavior
    };
    
    return (
      <div className="mx-4 mt-2 overflow-hidden">
        <div
          ref={weekDaysRef}
          className="flex overflow-x-auto hide-scrollbar pb-2 pt-1"
          onTouchStart={weekDayTouchScrollHandler}
          onTouchMove={weekDayTouchScrollHandler}
        >
          <AnimatePresence mode='wait' initial={false}>
            <motion.div 
              key={`week-${weekStart.toISOString()}`}
              className="flex space-x-2 px-1"
              initial={{ 
                x: weekDirection === 'left' ? -20 : weekDirection === 'right' ? 20 : 0,
                opacity: weekDirection ? 0.5 : 1 
              }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ 
                x: weekDirection === 'left' ? 20 : weekDirection === 'right' ? -20 : 0,
                opacity: 0.5 
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {weekDays.map((day, index) => {
                const formattedDate = format(day, 'd');
                const dayName = format(day, 'EEE');
                const isCurrentDate = isSameDay(day, currentDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <button
                    key={`day-${index}`}
                    onClick={() => handleDateSelect(day)}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-xl min-w-[56px] transition-colors
                      ${isCurrentDate ? 'bg-blue-100' : ''}
                    `}
                  >
                    <span className="text-xs font-medium text-gray-500">{dayName}</span>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full mt-1
                      ${isCurrentDate ? 'bg-blue-500 text-white' : isToday ? 'border border-blue-500 text-blue-500' : 'text-gray-800'}
                    `}>
                      {formattedDate}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // Render day view content
  const renderDayView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (dayJobs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-dark-900 mb-4">
            <CalendarIcon className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-700 text-lg mb-2 font-medium">No scheduled appointments</p>
          <Link
            to="/jobs/new"
            className="text-blue-500 font-medium flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Schedule a job
          </Link>
        </div>
      );
    }

    return (
      <div className="px-4">
        {dayJobs.map(job => (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className="block bg-white rounded-lg shadow mb-3 overflow-hidden"
          >
            <div className="border-l-4 border-blue-500 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{job.client?.name || 'Unknown Client'}</h3>
                  <p className="text-sm text-gray-600 mt-1">{job.address || 'No address'}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {job.scheduled_time ? format(new Date(`2000-01-01T${job.scheduled_time}`), 'h:mm a') : 'No time'}
                  </div>
                  <div className="text-sm text-blue-500 font-medium mt-1">
                    ${job.estimated_price || 0}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  // Render list view content
  const renderListView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (dayJobs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-dark-900 mb-4">
            <CalendarIcon className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-700 text-lg mb-2 font-medium">No scheduled appointments</p>
          <Link
            to="/jobs/new"
            className="text-blue-500 font-medium flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Schedule a job
          </Link>
        </div>
      );
    }

    return (
      <div className="px-4">
        {dayJobs.map(job => (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className="block bg-white rounded-lg shadow mb-3 overflow-hidden"
          >
            <div className="border-l-4 border-green-600 p-4">
              <h3 className="font-bold text-gray-900 text-lg">{job.title || 'Untitled Job'}</h3>
              <p className="text-gray-700 mt-1">{job.service_type || 'Test'}</p>
              
              <div className="flex items-center text-gray-600 mt-2">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">{job.scheduled_time ? `${format(new Date(`2000-01-01T${job.scheduled_time}`), 'h:mm a')} - 8:30 PM` : '6:30 PM - 8:30 PM'}</span>
              </div>
              
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{job.address || '704 Fairlane Drive'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  // Render map view content
  const renderMapView = () => {
    return (
      <div className="flex justify-center items-center h-64 px-4">
        <div className="text-center">
          <p className="text-gray-700 mb-2">Map view coming soon</p>
        </div>
      </div>
    );
  };
  
  return (
    <AppLayout>
      <PageHeader
        title="Schedule"
        rightElement={
          <div className="flex gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors text-xs sm:text-sm"
            >
              <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Today</span>
            </button>
            <button
              onClick={openViewOptionsModal}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors text-xs sm:text-sm"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Options</span>
            </button>
          </div>
        }
        compact
      />
      
      <div className="flex flex-col h-[calc(100vh-77px)] bg-gray-50 overflow-hidden">
        <div className="overflow-y-auto no-bounce flex-1">
          {/* Header with month selector */}
          <div className="sticky top-0 flex justify-between items-center px-4 pt-1 pb-2 z-20 bg-gray-50">
            <div className="flex items-center">
              <MonthSelector 
                currentDate={currentDate} 
                onDateChange={(date) => {
                  const direction = date > currentDate ? 'right' : 'left';
                  setWeekDirection(direction);
                  setAnimatingWeekChange(true);
                  
                  setTimeout(() => {
                    setCurrentDate(date);
                    setAnimatingWeekChange(false);
                  }, 300);
                }}
                userName={user?.user_metadata?.name || user?.email}
                jobCount={dayJobs.length}
              />
            </div>
          </div>
          
          {/* View selector tabs */}
          <div className="bg-gray-100 rounded-lg mx-4 p-1.5 flex relative z-10">
            <motion.button 
              className={`flex-1 py-3 rounded-md text-center font-medium ${viewOptions.view === 'Day' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
              onClick={() => setViewOptions(prev => ({ ...prev, view: 'Day' }))}
              whileTap={{ scale: 0.95 }}
            >
              Day
            </motion.button>
            <motion.button 
              className={`flex-1 py-3 rounded-md text-center font-medium ${viewOptions.view === 'List' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
              onClick={() => setViewOptions(prev => ({ ...prev, view: 'List' }))}
              whileTap={{ scale: 0.95 }}
            >
              List
            </motion.button>
            <motion.button 
              className={`flex-1 py-3 rounded-md text-center font-medium ${viewOptions.view === 'Map' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
              onClick={() => setViewOptions(prev => ({ ...prev, view: 'Map' }))}
              whileTap={{ scale: 0.95 }}
            >
              Map
            </motion.button>
          </div>
          
          {/* Week day selector with smooth animations */}
          {renderWeekDaySelector()}
          
          {/* Client filter/search */}
          <div className="mx-4 mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-gray-800 font-medium text-lg">
                  {user ? (user.email?.split('@')[0] || 'All clients') : 'All clients'}
                </span>
              </div>
              <div className="bg-gray-200 rounded-lg px-3 py-1 text-gray-800 font-medium">
                {dayJobs.length} {dayJobs.length === 1 ? 'job' : 'jobs'}
              </div>
            </div>
            
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
          
          {/* Content based on selected view */}
          <div className="pb-24 mt-4">
            {viewOptions.view === 'Day' && renderDayView()}
            {viewOptions.view === 'List' && renderListView()}
            {viewOptions.view === 'Map' && renderMapView()}
          </div>
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