import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar as CalendarIcon, Search, Settings, Plus, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { jobsApi } from '@/lib/api/jobs';
import { Job } from '@/types/job';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import ViewOptionsModal, { ViewOptionsState } from '@/components/schedule/ViewOptionsModal';
import MonthSelector from '@/components/Calendar/MonthSelector';

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
        setCurrentDate(subWeeks(date, 1));
      } else if (index >= 14) {
        // Next week selection
        setCurrentDate(addWeeks(date, 1));
      }
    }
  };

  // Handle week navigation with animation
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
    setCurrentDate(newDate);
    
    // Animate the scroll to the appropriate week
    if (weekDaysRef.current) {
      const targetPosition = direction === 'next' 
        ? weekDaysRef.current.scrollWidth * 2/3  // Move to next week (last third)
        : 0;                                    // Move to previous week (first third)
      
      weekDaysRef.current.scrollTo({
        left: targetPosition,
        behavior: 'smooth'
      });
      
      // After animation completes, reset to middle week
      setTimeout(() => {
        if (weekDaysRef.current) {
          weekDaysRef.current.scrollTo({
            left: weekDaysRef.current.scrollWidth / 3,
            behavior: 'auto'
          });
        }
      }, 300); // Wait for scroll animation to complete
    }
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
    
    // Reset to middle position immediately
    if (weekDaysRef.current) {
      weekDaysRef.current.scrollTo({
        left: weekDaysRef.current.scrollWidth / 3,
        behavior: 'smooth'
      });
    }
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

  // Handle scroll end for pagination
  const handleScrollEnd = () => {
    if (weekDaysRef.current) {
      const { scrollLeft, scrollWidth } = weekDaysRef.current;
      const viewportWidth = weekDaysRef.current.clientWidth;
      
      // If we've scrolled near the end, load the next week
      if (scrollLeft + viewportWidth >= scrollWidth - 20) {
        const newDate = addWeeks(currentDate, 1);
        setCurrentDate(newDate);
      }
      // If we've scrolled near the start, load the previous week
      else if (scrollLeft <= 20) {
        const newDate = subWeeks(currentDate, 1);
        setCurrentDate(newDate);
      }
    }
  };

  // Attach scroll event listener
  useEffect(() => {
    const scrollContainer = weekDaysRef.current as DivWithScrollTimeout;
    if (scrollContainer) {
      const handleScroll = () => {
        // Use a debounce technique for the scroll end detection
        if (scrollContainer.scrollTimeout) {
          clearTimeout(scrollContainer.scrollTimeout);
        }
        
        // Store timeout ID for cleanup
        scrollContainer.scrollTimeout = window.setTimeout(handleScrollEnd, 150);
      };
      
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        if (scrollContainer.scrollTimeout) {
          clearTimeout(scrollContainer.scrollTimeout);
        }
      };
    }
  }, [currentDate]);

  // Scroll to current week on initial load or when current date changes
  useEffect(() => {
    if (weekDaysRef.current) {
      // Reset scroll position to show current week
      setTimeout(() => {
        if (weekDaysRef.current) {
          // For the initial positioning, we want to show the current week (middle 7 days)
          weekDaysRef.current.scrollLeft = 0; // Reset first
          weekDaysRef.current.scrollTo({
            left: weekDaysRef.current.scrollWidth / 3,
            behavior: 'auto'
          });
        }
      }, 100);
    }
  }, [currentDate]);

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
      <div className="flex flex-col h-full bg-gray-50 pt-12">
        {/* Header with month selector */}
        <div className="flex justify-between items-center px-4 py-3 relative z-20">
          <div className="flex items-center">
            <MonthSelector 
              currentDate={currentDate} 
              onDateChange={(date) => {
                setCurrentDate(date);
                // Scroll will be adjusted automatically via the useEffect
              }}
              userName={user?.user_metadata?.name || user?.email}
              jobCount={dayJobs.length}
            />
          </div>
          <div className="flex items-center gap-5">
            <button className="p-2" onClick={goToToday}>
              <CalendarIcon className="w-6 h-6 text-gray-800" />
            </button>
            <button className="p-2" onClick={openViewOptionsModal}>
              <Settings className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>
        
        {/* View selector tabs */}
        <div className="bg-gray-100 rounded-lg mx-4 p-1.5 flex relative z-10">
          <button 
            className={`flex-1 py-3 rounded-md text-center font-medium ${viewOptions.view === 'Day' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
            onClick={() => setViewOptions(prev => ({ ...prev, view: 'Day' }))}
          >
            Day
          </button>
          <button 
            className={`flex-1 py-3 rounded-md text-center font-medium ${viewOptions.view === 'List' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
            onClick={() => setViewOptions(prev => ({ ...prev, view: 'List' }))}
          >
            List
          </button>
          <button 
            className={`flex-1 py-3 rounded-md text-center font-medium ${viewOptions.view === 'Map' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
            onClick={() => setViewOptions(prev => ({ ...prev, view: 'Map' }))}
          >
            Map
          </button>
        </div>
        
        {/* Week day selector - now scrollable with controlled pagination */}
        <div className="relative mx-4 mt-4">
          {/* Scrollable container */}
          <div 
            ref={weekDaysRef}
            className="overflow-x-auto scrollbar-hide snap-x scroll-smooth"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <div className="flex w-full snap-mandatory py-2">
              {/* Map all days (3 weeks worth) */}
              {allWeekDays.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, currentDate);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isCurrentWeek = index >= 7 && index < 14;
                
                // Skip weekends if not showing them
                if (isWeekend && !viewOptions.showWeekends) {
                  return null;
                }
                
                return (
                  <button
                    key={index}
                    className={`w-[calc(100%/7)] flex-shrink-0 flex flex-col items-center py-2 snap-center ${isCurrentWeek ? 'opacity-100' : 'opacity-80'}`}
                    onClick={() => handleDateSelect(day, index)}
                  >
                    <div className="text-sm text-gray-500 uppercase font-medium">
                      {format(day, 'EEE').charAt(0)}
                    </div>
                    <div 
                      className={`w-10 h-10 flex items-center justify-center rounded-full mt-1 text-lg
                        ${isSelected ? 'bg-blue-500 text-white' : isToday ? 'text-blue-500 border-2 border-blue-500' : 'text-gray-800'}`}
                    >
                      {format(day, 'd')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
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
        <div className="flex-1 overflow-y-auto pb-20 mt-4">
          {viewOptions.view === 'Day' && renderDayView()}
          {viewOptions.view === 'List' && renderListView()}
          {viewOptions.view === 'Map' && renderMapView()}
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