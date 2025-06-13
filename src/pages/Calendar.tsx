import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
  Clock,
  User,
  DollarSign,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Calendar as DateIcon,
  RefreshCw,
  TrendingUp,
  Users,
  MapIcon,
  Timer,
  BarChart3,
  Activity,
  Map
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, addWeeks, subWeeks, getHours, getMinutes } from "date-fns";
import { parseISO } from "date-fns/parseISO";
import { jobsApi } from "@/lib/api/jobs";
import { clientsApi } from "@/lib/api/clients";
import { Job, JobStatus } from "@/types/job";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";
import AppLayout from "@/components/AppLayout";
import QuickJobModal from "@/components/Calendar/QuickJobModal";
import JobDetailsModal from "@/components/Calendar/JobDetailsModal";
import MonthSelector from "@/components/Calendar/MonthSelector";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const timeSlots = [
  '7:00am', '8:00am', '9:00am', '10:00am', '11:00am', '12:00pm',
  '1:00pm', '2:00pm', '3:00pm', '4:00pm', '5:00pm', '6:00pm',
  '7:00pm', '8:00pm', '9:00pm', '10:00pm', '11:00pm'
];

// Add an interface for the HTMLDivElement with scrollTimeout
interface DivWithScrollTimeout extends HTMLDivElement {
  scrollTimeout?: number;
}

const Calendar = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['calendar', 'common']);
  const { formatCurrency } = useLocale();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'all' | 'residential' | 'commercial'>('all');
  const [viewMode, setViewMode] = useState<'day' | 'list' | 'map'>('day');
  
  // Ref for scrolling to current time
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Ref for week day scroll container
  const weekDaysRef = useRef<HTMLDivElement>(null);
  
  // Touch handling for swipe detection
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Modal states
  const [showQuickJobModal, setShowQuickJobModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);
  const [showMapView, setShowMapView] = useState(false);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, clientsData] = await Promise.all([
        jobsApi.getAllWithInstances(),
        clientsApi.getAll()
      ]);
      setJobs(jobsData);
      setClients(clientsData.map(c => ({ id: c.id, name: c.name })));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Set up real-time subscription for job updates
    const channel = supabase
      .channel('calendar-jobs')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'jobs',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('Job change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            toast.info('New job added to calendar');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Job updated');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Job removed from calendar');
          }
          
          // Reload data to get the latest
          loadData();
        }
      )
      .subscribe();

    // Set up keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            navigateWeek('prev');
          }
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            navigateWeek('next');
          }
          break;
        case 't':
        case 'T':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            goToToday();
          }
          break;
        case 'n':
        case 'N':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowQuickJobModal(true);
          }
          break;
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            loadData();
          }
          break;
        case 'Escape':
          setShowQuickJobModal(false);
          setShowJobDetailsModal(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [user?.id]);

  // Get week dates for display - show 3 weeks for scrolling (prev, current, next)
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
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

  // Filter jobs for current week and property type
  const weekJobs = useMemo(() => {
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
    return jobs.filter(job => {
      const jobDate = parseISO(job.scheduled_date);
      const withinWeek = jobDate >= weekStart && jobDate <= weekEnd;
      const matchesPropertyType = propertyTypeFilter === 'all' || job.property_type === propertyTypeFilter;
      const matchesSearch = !searchTerm || 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.service_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      return withinWeek && matchesPropertyType && matchesSearch;
    });
  }, [jobs, weekStart, currentWeek, propertyTypeFilter, searchTerm]);

  // Get jobs for specific day and time
  const getJobsForSlot = (date: Date, timeSlot: string) => {
    return weekJobs.filter(job => {
      if (!isSameDay(parseISO(job.scheduled_date), date)) return false;
      
      if (!job.scheduled_time) return timeSlot === '8:00am'; // Default to first slot
      
      // Convert job time to slot format
      const [hours, minutes] = job.scheduled_time.split(':');
      const hour24 = parseInt(hours);
      const period = hour24 >= 12 ? 'pm' : 'am';
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const formattedTime = `${hour12}:00${period}`;
      
      return formattedTime === timeSlot;
    });
  };

  // Get job status color with property type indicator
  const getJobColor = (status: JobStatus, propertyType?: string) => {
    const baseClasses = propertyType === 'commercial' 
      ? 'border-l-4 border-l-orange-500' // Orange left border for commercial
      : 'border-l-4 border-l-blue-500';  // Blue left border for residential
    
    switch (status) {
      case 'completed':
        return `bg-blue-500 border-blue-600 text-white ${baseClasses}`;
      case 'in_progress':
        return `bg-blue-500 border-blue-600 text-white ${baseClasses}`;
      case 'cancelled':
        return `bg-red-500 border-red-600 text-white ${baseClasses}`;
      case 'scheduled':
      default:
        return `bg-gray-500 border-gray-600 text-white ${baseClasses}`;
    }
  };

  // Handle week navigation with animation
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = direction === 'next' ? addWeeks(currentWeek, 1) : subWeeks(currentWeek, 1);
    setCurrentWeek(newWeek);
    
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
    setCurrentWeek(new Date());
    setSelectedDate(new Date());
    
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
    
    // Only navigate if we've detected a clear swipe gesture
    if (isLeftSwipe) {
      navigateWeek('next');
    } else if (isRightSwipe) {
      navigateWeek('prev');
    } else {
      // If it's not a clear swipe, reset to middle position
      if (weekDaysRef.current) {
        weekDaysRef.current.scrollTo({
          left: weekDaysRef.current.scrollWidth / 3,
          behavior: 'auto'
        });
      }
    }
  };

  // Handle wheel event handler for desktop scrolling
  const handleWheel = (e: React.WheelEvent) => {
    // Prevent default browser scroll behavior
    e.preventDefault();
    
    // Debounce wheel events to prevent rapid firing
    if (weekDaysRef.current) {
      const scrollContainer = weekDaysRef.current as DivWithScrollTimeout;
      
      // Clear any existing timeout
      if (scrollContainer.scrollTimeout) {
        clearTimeout(scrollContainer.scrollTimeout);
      }
      
      // Set a new timeout
      scrollContainer.scrollTimeout = window.setTimeout(() => {
        // Check scroll direction with a higher threshold
        if (e.deltaX > 80) {
          // Scrolling right (next week)
          navigateWeek('next');
        } else if (e.deltaX < -80) {
          // Scrolling left (previous week)
          navigateWeek('prev');
        } else {
          // Reset to middle position if the scroll wasn't significant
          if (weekDaysRef.current) {
            weekDaysRef.current.scrollTo({
              left: weekDaysRef.current.scrollWidth / 3,
              behavior: 'auto'
            });
          }
        }
      }, 50); // Small delay to debounce
    }
  };

  // Handle scroll end for pagination
  const handleScrollEnd = () => {
    if (weekDaysRef.current) {
      const { scrollLeft, scrollWidth } = weekDaysRef.current;
      const viewportWidth = weekDaysRef.current.clientWidth;
      
      // If we've scrolled near the end, load the next week
      if (scrollLeft + viewportWidth >= scrollWidth - 20) {
        const newWeek = addWeeks(currentWeek, 1);
        setCurrentWeek(newWeek);
      }
      // If we've scrolled near the start, load the previous week
      else if (scrollLeft <= 20) {
        const newWeek = subWeeks(currentWeek, 1);
        setCurrentWeek(newWeek);
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
  }, [currentWeek]);

  // Scroll to current week on initial load or when current week changes
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
  }, [currentWeek]);

  // Calculate stats
  const todayJobs = weekJobs.filter(job => 
    isSameDay(parseISO(job.scheduled_date), new Date())
  );

  const weekRevenue = weekJobs.reduce((sum, job) => sum + (job.estimated_price || 0), 0);
  const completedJobs = weekJobs.filter(job => job.status === 'completed').length;
  const inProgressJobs = weekJobs.filter(job => job.status === 'in_progress').length;

  // Handle job click
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetailsModal(true);
  };

  // Handle empty slot click
  const handleSlotClick = (date: Date, timeSlot: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
    setShowQuickJobModal(true);
  };

  // Handle job status change
  const handleJobStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await jobsApi.updateStatus(jobId, newStatus as JobStatus);
      toast.success(`Job status updated to ${newStatus}`);
      loadData(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  // Handle job edit
  const handleJobEdit = (job: Job) => {
    navigate(`/edit-job/${job.id}`);
  };

  // Handle job delete
  const handleJobDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await jobsApi.delete(jobId);
      toast.success('Job deleted successfully');
      setShowJobDetailsModal(false);
      loadData();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  // Handle job duplicate
  const handleJobDuplicate = async (job: Job) => {
    try {
      const newJob = {
        ...job,
        id: undefined,
        scheduled_date: format(new Date(), 'yyyy-MM-dd'),
        status: 'scheduled' as JobStatus,
        created_at: undefined,
        updated_at: undefined
      };
      
      await jobsApi.create(newJob as any);
      toast.success('Job duplicated successfully');
      loadData();
    } catch (error) {
      console.error('Error duplicating job:', error);
      toast.error('Failed to duplicate job');
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, job: Job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = 'move';
    // Add visual feedback
    (e.target as HTMLElement).style.opacity = '0.5';
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedJob(null);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop on a time slot
  const handleDrop = async (e: React.DragEvent, date: Date, timeSlot: string) => {
    e.preventDefault();
    
    if (!draggedJob) return;
    
    const newDate = format(date, 'yyyy-MM-dd');
    const newTime = timeSlot.replace('am', ':00').replace('pm', ':00')
      .replace('12:', timeSlot.includes('pm') ? '12:' : '00:')
      .replace(/(\d):/, (match, hour) => {
        const h = parseInt(hour);
        if (timeSlot.includes('pm') && h !== 12) {
          return `${h + 12}:`;
        }
        return match;
      });
    
    try {
      await jobsApi.update(draggedJob.id, {
        scheduled_date: newDate,
        scheduled_time: newTime
      });
      
      toast.success('Job rescheduled successfully');
      loadData();
    } catch (error) {
      console.error('Error rescheduling job:', error);
      toast.error('Failed to reschedule job');
    }
    
    setDraggedJob(null);
  };

  // Handle date change from MonthSelector
  const handleDateChange = (date: Date) => {
    setCurrentWeek(date);
    setSelectedDate(date);
    
    // Scroll will be adjusted automatically via the useEffect
  };

  // Scroll to current time on initial load
  useEffect(() => {
    if (timelineRef.current && viewMode === 'day') {
      const now = new Date();
      const currentHour = getHours(now);
      const currentMinute = getMinutes(now);
      
      // Calculate scroll position based on current time
      // Each hour is 60px height, so we multiply the hour by 60
      // and add the proportional minutes
      const scrollPosition = (currentHour * 60) + (currentMinute * 60 / 60) - 120; // Subtract some offset to position in the middle of the view
      
      // Smooth scroll to the current time
      timelineRef.current.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  }, [viewMode, selectedDate]);

  // Get current time position for the time indicator line
  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = getHours(now);
    const currentMinute = getMinutes(now);
    
    // Calculate position as percentage of the day
    // Each hour is 60px in height
    return (currentHour * 60) + (currentMinute * 60 / 60);
  };

  // Check if the current date is today
  const isToday = isSameDay(selectedDate, new Date());

  return (
    <AppLayout>
      <div className="h-full flex bg-gray-50">
        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col">
          {/* Calendar Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Month selector with expandable view */}
              <div className="flex items-center relative z-20">
                <MonthSelector 
                  currentDate={currentWeek} 
                  onDateChange={handleDateChange}
                  userName={user?.user_metadata?.name || user?.email}
                  jobCount={weekJobs.length}
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => goToToday()} 
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Go to today"
                >
                  <CalendarIcon className="w-5 h-5 text-gray-600" />
                </button>

                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gray-50 px-6 pt-4">
            <div className="bg-gray-100 rounded-xl p-1 flex items-center justify-between">
              <div className="flex-1 grid grid-cols-3">
                <button 
                  onClick={() => setViewMode('day')}
                  className={`py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                    viewMode === 'day' 
                      ? 'bg-white shadow-sm text-gray-800' 
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  Day
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-gray-800' 
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  List
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-white shadow-sm text-gray-800' 
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  Map
                </button>
              </div>
            </div>
          </div>

          {/* Week days selector - now scrollable with controlled pagination */}
          <div className="border-b border-gray-200 relative">
            {/* Scrollable container */}
            <div 
              ref={weekDaysRef}
              className="overflow-x-auto scrollbar-hide snap-x scroll-smooth"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
            >
              <div className="flex w-full snap-mandatory">
                {/* Map all days (3 weeks worth) */}
                {allWeekDays.map((day, index) => {
                  const isSelectedDay = isSameDay(day, selectedDate);
                  const isDayToday = isSameDay(day, new Date());
                  const isCurrentWeek = index >= 7 && index < 14;
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => {
                        setSelectedDate(day);
                        
                        // If selected day is in prev/next week, update current week
                        if (index < 7) {
                          setCurrentWeek(subWeeks(currentWeek, 1));
                        } else if (index >= 14) {
                          setCurrentWeek(addWeeks(currentWeek, 1));
                        }
                      }}
                      className={`w-[calc(100%/7)] flex-shrink-0 flex flex-col items-center py-3 cursor-pointer border-b-2 transition-colors snap-center
                        ${isSelectedDay 
                          ? 'border-[#307842] bg-gray-50' 
                          : 'border-transparent hover:bg-gray-50'
                        }
                        ${isCurrentWeek ? 'opacity-100' : 'opacity-80'}
                      `}
                    >
                      <div className="text-sm text-gray-500 font-medium">
                        {format(day, 'EEE').charAt(0)}
                      </div>
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full mt-1
                        ${isSelectedDay 
                          ? 'bg-[#307842] text-white' 
                          : isDayToday 
                            ? 'border-2 border-[#307842] text-[#307842]' 
                            : 'text-gray-800'
                        }
                      `}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Calendar Content - Different views */}
          <div className="flex-1 overflow-hidden">
            {/* Day View */}
            {viewMode === 'day' && (
              <div className="h-full flex flex-col">
                {/* User info bar */}
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="font-medium text-lg text-gray-900">
                      {user?.user_metadata?.name || user?.email}
                    </div>
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                    {weekJobs.filter(job => isSameDay(parseISO(job.scheduled_date), selectedDate)).length} jobs
                  </div>
                </div>
                
                {/* Search bar */}
                <div className="px-6 py-3 bg-white border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Jobs or empty state */}
                {weekJobs.filter(job => isSameDay(parseISO(job.scheduled_date), selectedDate)).length > 0 ? (
                  <div 
                    ref={timelineRef}
                    className="flex-1 overflow-y-auto"
                  >
                    <div className="relative min-h-full">
                      {/* Time slots */}
                      {timeSlots.map((time, index) => {
                        const slotsJobs = getJobsForSlot(selectedDate, time);
                        
                        return (
                          <div 
                            key={time}
                            className="flex h-[60px] border-b border-gray-100 relative"
                          >
                            {/* Time label */}
                            <div className="w-16 flex-shrink-0 pr-2 pt-1 text-right">
                              <span className="text-xs text-gray-500 font-medium">{time}</span>
                            </div>
                            
                            {/* Job slot */}
                            <div 
                              className="flex-1 p-1 relative cursor-pointer hover:bg-gray-50"
                              onClick={(e) => {
                                if (slotsJobs.length === 0) {
                                  e.stopPropagation();
                                  handleSlotClick(selectedDate, time);
                                }
                              }}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, selectedDate, time)}
                            >
                              {slotsJobs.map((job) => (
                                <div
                                  key={job.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, job)}
                                  onDragEnd={handleDragEnd}
                                  className={`p-2 rounded border cursor-pointer transition-all hover:shadow-md text-xs ${getJobColor(job.status, job.property_type)}`}
                                  style={{
                                    height: 'calc(100% - 4px)'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleJobClick(job);
                                  }}
                                >
                                  {/* Job content */}
                                  <div className="flex items-center justify-between h-full">
                                    <div className="min-w-0 flex-1">
                                      <div className="font-medium text-xs truncate">
                                        {job.client?.name || 'Unknown Client'}
                                      </div>
                                      <div className="text-xs opacity-90 truncate">
                                        {job.title || job.service_type}
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-0.5">
                                      <div className="flex items-center gap-0.5">
                                        {job.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                        {job.status === 'in_progress' && <Clock className="w-3 h-3" />}
                                        {job.status === 'cancelled' && <AlertCircle className="w-3 h-3" />}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Current time indicator line - only show if viewing today */}
                      {isToday && (
                        <div 
                          className="absolute left-0 right-0 border-t-2 border-[#307842] z-10 pointer-events-none"
                          style={{ 
                            top: `${getCurrentTimePosition()}px`,
                          }}
                        >
                          <div className="absolute -left-1 -top-2 w-4 h-4 rounded-full bg-[#307842]"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="w-24 h-24 mb-6">
                      <CalendarIcon className="w-full h-full text-gray-300" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 mb-4">No scheduled appointments</h3>
                    <button
                      onClick={() => setShowQuickJobModal(true)}
                      className="text-[#4285F4] font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Schedule a job
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="h-full flex flex-col">
                {/* User info bar */}
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="font-medium text-lg text-gray-900">
                      {user?.user_metadata?.name || user?.email}
                    </div>
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                    {weekJobs.filter(job => isSameDay(parseISO(job.scheduled_date), selectedDate)).length} jobs
                  </div>
                </div>
                
                {/* Search bar */}
                <div className="px-6 py-3 bg-white border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Jobs or empty state */}
                {weekJobs.filter(job => isSameDay(parseISO(job.scheduled_date), selectedDate)).length > 0 ? (
                  <div className="flex-1 overflow-y-auto">
                    <div className="divide-y divide-gray-100">
                      {weekJobs.filter(job => isSameDay(parseISO(job.scheduled_date), selectedDate))
                        .sort((a, b) => {
                          if (!a.scheduled_time) return -1;
                          if (!b.scheduled_time) return 1;
                          return a.scheduled_time.localeCompare(b.scheduled_time);
                        })
                        .map(job => (
                          <div 
                            key={job.id}
                            className="p-4 px-6 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                            onClick={() => handleJobClick(job)}
                          >
                            <div className={`w-3 h-3 rounded-full ${
                              job.status === 'completed' ? 'bg-green-500' :
                              job.status === 'in_progress' ? 'bg-blue-500' :
                              job.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">{job.client?.name || 'Unknown Client'}</div>
                              <div className="text-sm text-gray-600 truncate">{job.title || job.service_type}</div>
                            </div>
                            <div className="text-sm text-gray-500 whitespace-nowrap">
                              {job.scheduled_time ? format(new Date(`2000-01-01T${job.scheduled_time}`), 'h:mm a') : 'No time'}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="w-24 h-24 mb-6">
                      <CalendarIcon className="w-full h-full text-gray-300" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 mb-4">No scheduled appointments</h3>
                    <button
                      onClick={() => setShowQuickJobModal(true)}
                      className="text-[#4285F4] font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Schedule a job
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Map View */}
            {viewMode === 'map' && (
              <div className="p-6 h-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex items-center justify-center">
                  <div className="text-center p-6">
                    <MapIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Map View</h3>
                    <p className="text-gray-500 mb-6">
                      Map integration coming soon. This view will show job locations for the selected day.
                    </p>
                    <div className="text-sm text-gray-600">
                      {weekJobs.filter(job => isSameDay(parseISO(job.scheduled_date), selectedDate)).length} job(s) scheduled for {format(selectedDate, 'MMMM d')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating action button */}
        <div className="fixed right-6 bottom-24 z-50">
          <button
            onClick={() => setShowQuickJobModal(true)}
            className="w-14 h-14 rounded-full bg-[#1a2e35] text-white flex items-center justify-center shadow-lg hover:bg-[#2a3e45] transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Modals */}
      <QuickJobModal
        isOpen={showQuickJobModal}
        onClose={() => {
          setShowQuickJobModal(false);
          setSelectedTimeSlot('');
        }}
        selectedDate={selectedDate}
        selectedTime={selectedTimeSlot}
        onJobCreated={loadData}
        existingJobs={jobs}
      />
      
      <JobDetailsModal
        job={selectedJob}
        isOpen={showJobDetailsModal}
        onClose={() => {
          setShowJobDetailsModal(false);
          setSelectedJob(null);
        }}
        onEdit={handleJobEdit}
        onDelete={handleJobDelete}
        onStatusChange={handleJobStatusChange}
        onDuplicate={handleJobDuplicate}
      />
    </AppLayout>
  );
};

export default Calendar; 