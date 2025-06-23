import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar as CalendarIcon, Search, Settings, Plus, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
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

  // Render week day selector with the new design
  const renderHorizontalDayScroller = () => {
    return (
      <div className="px-4 pb-4 border-b border-gray-200">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {allWeekDays.map((day, index) => {
            const isSelected = isSameDay(day, currentDate);
            return (
              <button
                key={index}
                onClick={() => handleDateSelect(day)}
                className={`flex flex-col items-center justify-center w-12 h-16 rounded-lg transition-colors flex-shrink-0 ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-100 text-gray-800 font-semibold'
                }`}
              >
                <span className="text-xs font-semibold uppercase">
                  {format(day, 'EEE')}
                </span>
                <span className="text-lg font-bold mt-1">
                  {format(day, 'd')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Day View with updated styling
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

  // Render List View with updated styling
  const renderListView = () => {
    if (dayJobs.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-gray-500">{t('noJobsScheduled')}</p>
        </div>
      );
    }

    return (
      <div className="border-t border-gray-200">
        <div className="flex border-b border-gray-200">
          <div className="w-24 p-4 border-r border-gray-200">
            <h3 className="font-semibold text-gray-800">{user?.user_metadata.full_name || 'Me'}</h3>
            <p className="text-sm text-gray-500 mt-1">{dayJobs.length} appointments</p>
          </div>
          <div className="flex-1 relative">
            {/* This would be a timeline, for now, just list jobs */}
            {dayJobs.map(job => (
              <div key={job.id} className="p-4 border-b border-gray-100">
                 <p className="font-medium">{job.title}</p>
                 <p className="text-sm text-gray-600">{job.client?.name}</p>
                 <p className="text-xs text-gray-500 mt-1">{format(new Date(job.scheduled_date), 'p')}</p>
              </div>
            ))}
          </div>
        </div>
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
      <div className="flex flex-col h-full bg-white">
        <PageHeader
          title={format(currentDate, 'MMMM yyyy')}
          rightElement={
            <div className="flex items-center space-x-2">
              <button onClick={goToToday} className="p-2">
                <CalendarIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button onClick={openViewOptionsModal} className="p-2">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          }
          compact
        />
        
        <div className="p-4">
          {/* Segmented Control Placeholder */}
          <div className="w-full bg-gray-200 p-1 rounded-lg flex">
            {['Day', 'List', 'Map'].map(view => (
              <button 
                key={view}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewOptions.view === view 
                    ? 'bg-white text-blue-600 shadow' 
                    : 'text-gray-600'
                }`}
                onClick={() => setViewOptions(prev => ({ ...prev, view: view as 'Day' | 'List' | 'Map' }))}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
        
        {renderHorizontalDayScroller()}
        
        <div 
          className="pb-24" // Add padding to bottom to avoid being hidden by nav bar
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {loading ? (
            <div className="flex justify-center items-center h-full pt-16">
              <p>Loading schedule...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {viewOptions.view === 'Day' && renderDayView()}
              {viewOptions.view === 'List' && renderListView()}
              {viewOptions.view === 'Map' && renderMapView()}
            </div>
          )}
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