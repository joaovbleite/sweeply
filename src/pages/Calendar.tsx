import { useState, useEffect, useMemo } from "react";
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
  Navigation2
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO, addWeeks, subWeeks } from "date-fns";
import { jobsApi } from "@/lib/api/jobs";
import { clientsApi } from "@/lib/api/clients";
import { Job, JobStatus } from "@/types/job";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";
import AppLayout from "@/components/AppLayout";
import GPSCheckInOut from "@/components/gps/GPSCheckInOut";

const timeSlots = [
  '8:00am', '9:00am', '10:00am', '11:00am', '12:00pm',
  '1:00pm', '2:00pm', '3:00pm', '4:00pm', '5:00pm', '6:00pm'
];

const Calendar = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['calendar', 'common']);
  const { formatCurrency } = useLocale();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showGPSModal, setShowGPSModal] = useState(false);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, clientsData] = await Promise.all([
        jobsApi.getAll(),
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
  }, []);

  // Get week dates
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filter jobs for current week
  const weekJobs = useMemo(() => {
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
    return jobs.filter(job => {
      const jobDate = parseISO(job.scheduled_date);
      return jobDate >= weekStart && jobDate <= weekEnd;
    });
  }, [jobs, weekStart, currentWeek]);

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

  // Get job status color
  const getJobColor = (status: JobStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-600 text-white';
      case 'in_progress':
        return 'bg-blue-500 border-blue-600 text-white';
      case 'cancelled':
        return 'bg-red-500 border-red-600 text-white';
      case 'scheduled':
      default:
        return 'bg-gray-500 border-gray-600 text-white';
    }
  };

  // Handle week navigation
  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(direction === 'next' ? addWeeks(currentWeek, 1) : subWeeks(currentWeek, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentWeek(new Date());
    setSelectedDate(new Date());
  };

  // Handle GPS check-in/check-out
  const handleGPSCheckIn = (job: Job) => {
    setSelectedJob(job);
    setShowGPSModal(true);
  };

  const handleGPSStatusChange = (status: 'checked_in' | 'checked_out') => {
    // Refresh jobs to show updated status
    loadData();
    setShowGPSModal(false);
    setSelectedJob(null);
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Title and navigation */}
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <CalendarIcon className="w-7 h-7 text-blue-600" />
                Calendar
              </h1>
              
              {/* Week navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium text-gray-900">
                    {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                  </span>
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Today
                  </button>
                </div>
                
                <button
                  onClick={() => navigateWeek('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Right side - Search and actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Action buttons */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={loadData}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Job
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Time slots column */}
            <div className="w-20 bg-white border-r border-gray-200 flex flex-col">
              {/* Header spacer */}
              <div className="h-16 border-b border-gray-200"></div>
              
              {/* Time slots */}
              {timeSlots.map((time, index) => (
                <div key={time} className="h-20 border-b border-gray-100 flex items-start justify-end pr-3 pt-2">
                  <span className="text-sm text-gray-500 font-medium">{time}</span>
                </div>
              ))}
            </div>

            {/* Days columns */}
            <div className="flex-1 flex overflow-x-auto">
              {weekDays.map((day, dayIndex) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                
                return (
                  <div key={dayIndex} className="flex-1 min-w-0 border-r border-gray-200 last:border-r-0">
                    {/* Day header */}
                    <div className={`h-16 border-b border-gray-200 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50' : isToday ? 'bg-blue-25' : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedDate(day)}
                    >
                      <div className="text-xs font-medium text-gray-500 uppercase">
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-lg font-bold ${
                        isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      {isToday && (
                        <div className="w-1 h-1 bg-blue-600 rounded-full mt-1"></div>
                      )}
                    </div>

                    {/* Time slots for this day */}
                    <div className="relative">
                      {timeSlots.map((timeSlot, timeIndex) => {
                        const slotsJobs = getJobsForSlot(day, timeSlot);
                        
                        return (
                          <div
                            key={timeIndex}
                            className="h-20 border-b border-gray-100 p-1 relative"
                          >
                            {slotsJobs.map((job, jobIndex) => (
                              <div
                                key={job.id}
                                className={`mb-1 p-2 rounded-md border cursor-pointer transition-all hover:shadow-sm group relative ${getJobColor(job.status)}`}
                                style={{
                                  marginTop: jobIndex > 0 ? '2px' : '0',
                                  height: slotsJobs.length === 1 ? 'calc(100% - 8px)' : `${Math.min(85 / slotsJobs.length, 36)}px`
                                }}
                              >
                                {/* Job content */}
                                <div className="flex items-center justify-between h-full">
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-sm truncate">
                                      {job.client?.name || 'Unknown Client'}
                                    </div>
                                    {slotsJobs.length === 1 && (
                                      <>
                                        <div className="text-xs opacity-90 truncate">
                                          {job.title || job.service_type}
                                        </div>
                                        {job.address && (
                                          <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate">{job.address}</span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  
                                  {slotsJobs.length === 1 && (
                                    <div className="flex flex-col items-end gap-1">
                                      {/* GPS Check-in button */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleGPSCheckIn(job);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 rounded p-1"
                                        title="GPS Check-in/Check-out"
                                      >
                                        <Navigation2 className="w-3 h-3" />
                                      </button>
                                      
                                      {job.estimated_price && (
                                        <span className="text-xs font-medium">
                                          {formatCurrency(job.estimated_price)}
                                        </span>
                                      )}
                                      <div className="flex items-center gap-1">
                                        {job.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                        {job.status === 'in_progress' && <Clock className="w-3 h-3" />}
                                        {job.status === 'cancelled' && <AlertCircle className="w-3 h-3" />}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <span>
                {weekJobs.length} {weekJobs.length === 1 ? 'job' : 'jobs'} this week
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Cancelled</span>
                </div>
              </div>
            </div>
            
            <div className="text-gray-500">
              Week of {format(weekStart, 'MMM d, yyyy')}
            </div>
          </div>
        </div>

        {/* GPS Check-In/Check-Out Modal */}
        {selectedJob && (
          <GPSCheckInOut
            job={selectedJob}
            isOpen={showGPSModal}
            onClose={() => {
              setShowGPSModal(false);
              setSelectedJob(null);
            }}
            onStatusChange={handleGPSStatusChange}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Calendar; 