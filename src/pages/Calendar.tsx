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
  TrendingUp,
  Users,
  MapIcon,
  Timer,
  BarChart3,
  Activity
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
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'all' | 'residential' | 'commercial'>('all');

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
        return `bg-green-500 border-green-600 text-white ${baseClasses}`;
      case 'in_progress':
        return `bg-blue-500 border-blue-600 text-white ${baseClasses}`;
      case 'cancelled':
        return `bg-red-500 border-red-600 text-white ${baseClasses}`;
      case 'scheduled':
      default:
        return `bg-gray-500 border-gray-600 text-white ${baseClasses}`;
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

  // Calculate stats
  const todayJobs = weekJobs.filter(job => 
    isSameDay(parseISO(job.scheduled_date), new Date())
  );

  const weekRevenue = weekJobs.reduce((sum, job) => sum + (job.estimated_price || 0), 0);
  const completedJobs = weekJobs.filter(job => job.status === 'completed').length;
  const inProgressJobs = weekJobs.filter(job => job.status === 'in_progress').length;

  return (
    <AppLayout>
      <div className="h-full flex bg-gray-50">
        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col">
          {/* Calendar Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Week navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold text-gray-900">
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

              {/* Search and actions */}
              <div className="flex items-center gap-4">
                {/* Property Type Filter */}
                <select
                  value={propertyTypeFilter}
                  onChange={(e) => setPropertyTypeFilter(e.target.value as 'all' | 'residential' | 'commercial')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Properties</option>
                  <option value="residential">🏠 Residential</option>
                  <option value="commercial">🏢 Commercial</option>
                </select>
                
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
                <button
                  onClick={loadData}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Compact Calendar Grid */}
          <div className="flex-1 overflow-hidden p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full">
              <div className="h-full flex">
                {/* Time slots column */}
                <div className="w-16 border-r border-gray-200 flex flex-col">
                  {/* Header spacer */}
                  <div className="h-12 border-b border-gray-200"></div>
                  
                  {/* Time slots */}
                  {timeSlots.map((time, index) => (
                    <div key={time} className="h-16 border-b border-gray-100 flex items-start justify-end pr-2 pt-1">
                      <span className="text-xs text-gray-500 font-medium">{time}</span>
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
                        <div className={`h-12 border-b border-gray-200 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50' : isToday ? 'bg-blue-25' : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedDate(day)}
                        >
                          <div className="text-xs font-medium text-gray-500 uppercase">
                            {format(day, 'EEE')}
                          </div>
                          <div className={`text-sm font-bold ${
                            isToday ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {format(day, 'd')}
                          </div>
                          {isToday && (
                            <div className="w-1 h-1 bg-blue-600 rounded-full mt-0.5"></div>
                          )}
                        </div>

                        {/* Time slots for this day */}
                        <div className="relative">
                          {timeSlots.map((timeSlot, timeIndex) => {
                            const slotsJobs = getJobsForSlot(day, timeSlot);
                            
                            return (
                              <div
                                key={timeIndex}
                                className="h-16 border-b border-gray-100 p-1 relative"
                              >
                                {slotsJobs.map((job, jobIndex) => (
                                  <div
                                    key={job.id}
                                    className={`mb-1 p-1.5 rounded border cursor-pointer transition-all hover:shadow-sm text-xs ${getJobColor(job.status, job.property_type)}`}
                                    style={{
                                      marginTop: jobIndex > 0 ? '1px' : '0',
                                      height: slotsJobs.length === 1 ? 'calc(100% - 4px)' : `${Math.min(60 / slotsJobs.length, 28)}px`
                                    }}
                                  >
                                    {/* Job content */}
                                    <div className="flex items-center justify-between h-full">
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-xs truncate">
                                          {job.client?.name || 'Unknown Client'}
                                        </div>
                                        {slotsJobs.length === 1 && (
                                          <div className="text-xs opacity-90 truncate">
                                            {job.title || job.service_type}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {slotsJobs.length === 1 && (
                                        <div className="flex flex-col items-end gap-0.5">
                                          <div className="flex items-center gap-0.5">
                                            {job.status === 'completed' && <CheckCircle className="w-2.5 h-2.5" />}
                                            {job.status === 'in_progress' && <Clock className="w-2.5 h-2.5" />}
                                            {job.status === 'cancelled' && <AlertCircle className="w-2.5 h-2.5" />}
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
          </div>

          {/* Bottom status bar */}
          <div className="bg-white border-t border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-6">
                <span>
                  {weekJobs.length} {weekJobs.length === 1 ? 'job' : 'jobs'} this week
                  {propertyTypeFilter !== 'all' && (
                    <span className="ml-1 text-blue-600">
                      ({propertyTypeFilter === 'residential' ? '🏠 Residential' : '🏢 Commercial'})
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-4">
                  {/* Job Status Legend */}
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
                  
                  {/* Property Type Legend */}
                  <div className="border-l border-gray-300 pl-4 ml-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-2 bg-blue-500 rounded"></div>
                        <span>🏠 Residential</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-2 bg-orange-500 rounded"></div>
                        <span>🏢 Commercial</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-gray-500">
                Week of {format(weekStart, 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Quick Stats & Actions */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-4">
              <CalendarIcon className="w-7 h-7 text-blue-600" />
              Calendar
            </h1>
            
            {/* Quick Actions */}
            <div className="space-y-2">
              <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
                <Plus className="w-4 h-4" />
                New Job
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
              </button>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Today's Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-900">Total Jobs</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{todayJobs.length}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-orange-900">In Progress</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{inProgressJobs}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-900">Completed</span>
                </div>
                <span className="text-lg font-bold text-green-600">{completedJobs}</span>
              </div>
            </div>
          </div>

          {/* Week Stats */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">This Week</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Jobs</span>
                <span className="font-semibold">{weekJobs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-semibold text-green-600">{formatCurrency(weekRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-semibold">{weekJobs.length > 0 ? Math.round((completedJobs / weekJobs.length) * 100) : 0}%</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-6 flex-1">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {todayJobs.slice(0, 4).map((job, index) => (
                <div key={job.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-2 h-2 rounded-full ${
                    job.status === 'completed' ? 'bg-green-500' :
                    job.status === 'in_progress' ? 'bg-blue-500' :
                    job.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {job.client?.name || 'Unknown Client'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {job.title || job.service_type}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {job.scheduled_time || 'TBD'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Calendar; 