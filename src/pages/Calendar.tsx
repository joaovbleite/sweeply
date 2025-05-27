import { useState, useEffect, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
  Clock,
  User,
  DollarSign,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Navigation2,
  Grid3X3,
  List,
  Calendar as DateIcon
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO, addWeeks, subWeeks, startOfDay } from "date-fns";
import { jobsApi } from "@/lib/api/jobs";
import { clientsApi } from "@/lib/api/clients";
import { Job, JobStatus } from "@/types/job";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";
import AppLayout from "@/components/AppLayout";
import GPSCheckInOut from "@/components/gps/GPSCheckInOut";

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  // Get jobs for specific day
  const getJobsForDay = (date: Date) => {
    return weekJobs.filter(job => {
      return isSameDay(parseISO(job.scheduled_date), date);
    });
  };

  // Get job status color
  const getJobColor = (status: JobStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'scheduled':
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
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
    loadData();
    setShowGPSModal(false);
    setSelectedJob(null);
  };

  // Render Grid View
  const renderGridView = () => (
    <div className="grid grid-cols-7 gap-3">
      {weekDays.map((day, dayIndex) => {
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);
        const dayJobs = getJobsForDay(day);
        
        return (
          <div 
            key={dayIndex} 
            className={`bg-white rounded-lg border-2 transition-all cursor-pointer min-h-[200px] ${
              isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedDate(day)}
          >
            {/* Day Header */}
            <div className={`p-3 border-b ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500 uppercase">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            </div>

            {/* Jobs for this day */}
            <div className="p-2 space-y-2">
              {dayJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  className={`p-2 rounded-md border text-xs group relative ${getJobColor(job.status)}`}
                >
                  {/* GPS Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGPSCheckIn(job);
                    }}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white rounded p-1"
                    title="GPS Check-in/Check-out"
                  >
                    <Navigation2 className="w-3 h-3 text-gray-600" />
                  </button>

                  <div className="font-medium truncate pr-6">
                    {job.client?.name || 'Unknown Client'}
                  </div>
                  <div className="text-xs opacity-75 truncate">
                    {job.title || job.service_type}
                  </div>
                  {job.scheduled_time && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{job.scheduled_time}</span>
                    </div>
                  )}
                  {job.estimated_price && (
                    <div className="font-medium text-xs mt-1">
                      {formatCurrency(job.estimated_price)}
                    </div>
                  )}
                </div>
              ))}
              
              {dayJobs.length > 3 && (
                <div className="text-xs text-gray-500 text-center py-1">
                  +{dayJobs.length - 3} more
                </div>
              )}
              
              {dayJobs.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-4">
                  No jobs scheduled
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render List View
  const renderListView = () => (
    <div className="space-y-4">
      {weekDays.map((day, dayIndex) => {
        const dayJobs = getJobsForDay(day);
        const isToday = isSameDay(day, new Date());
        
        return (
          <div key={dayIndex} className="bg-white rounded-lg border border-gray-200">
            {/* Day Header */}
            <div className={`p-4 border-b ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                    {format(day, 'EEEE, MMMM d')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {dayJobs.length} {dayJobs.length === 1 ? 'job' : 'jobs'} scheduled
                  </p>
                </div>
                {isToday && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Today
                  </span>
                )}
              </div>
            </div>

            {/* Jobs List */}
            <div className="divide-y divide-gray-100">
              {dayJobs.length > 0 ? dayJobs.map((job) => (
                <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          job.status === 'completed' ? 'bg-green-500' :
                          job.status === 'in_progress' ? 'bg-blue-500' :
                          job.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {job.client?.name || 'Unknown Client'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {job.title || job.service_type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        {job.scheduled_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.scheduled_time}</span>
                          </div>
                        )}
                        {job.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-xs">{job.address}</span>
                          </div>
                        )}
                        {job.estimated_price && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatCurrency(job.estimated_price)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.status === 'completed' ? 'bg-green-100 text-green-800' :
                        job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        job.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status.replace('_', ' ').toUpperCase()}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGPSCheckIn(job);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-200 rounded-lg"
                        title="GPS Check-in/Check-out"
                      >
                        <Navigation2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500">
                  <DateIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No jobs scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Modern Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                <p className="text-gray-600">Manage your schedule and jobs</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Job
              </button>
            </div>
          </div>

          {/* Navigation and Search */}
          <div className="flex items-center justify-between">
            {/* Week Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                </h2>
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

            {/* Search and Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                />
              </div>

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
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-xl font-semibold text-gray-900">{weekJobs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-semibold text-gray-900">
                  {weekJobs.filter(j => j.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-xl font-semibold text-gray-900">
                  {weekJobs.filter(j => j.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(weekJobs.reduce((sum, job) => sum + (job.estimated_price || 0), 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading calendar...</p>
              </div>
            </div>
          ) : (
            viewMode === 'grid' ? renderGridView() : renderListView()
          )}
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