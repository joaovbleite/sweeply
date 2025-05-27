import { useState, useEffect, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  Download,
  Settings,
  BarChart3,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  Target,
  Moon,
  Sun
} from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api/jobs";
import { clientsApi } from "@/lib/api/clients";
import { Job, JobStatus, ServiceType } from "@/types/job";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import AdvancedCalendarView from "@/components/Calendar/AdvancedCalendarView";
import CalendarHeader from "@/components/Calendar/CalendarHeader";
import CalendarListView from "@/components/Calendar/CalendarListView";
import CalendarMapView from "@/components/Calendar/CalendarMapView";
import CalendarTimelineView from "@/components/Calendar/CalendarTimelineView";
import CalendarFilters from "@/components/Calendar/CalendarFilters";
import CalendarSettings from "@/components/Calendar/CalendarSettings";
import CalendarKeyboardShortcuts from "@/components/Calendar/CalendarKeyboardShortcuts";
import QuickJobModal from "@/components/Calendar/QuickJobModal";
import JobDetailsModal from "@/components/Calendar/JobDetailsModal";
import CalendarAnalytics from "@/components/Calendar/CalendarAnalytics";

export type CalendarView = 'month' | 'week' | 'day' | 'list' | 'timeline' | 'map';

interface FilterOptions {
  serviceTypes: ServiceType[];
  status: string[];
  clients: string[];
  dateRange: { start: string; end: string };
  priceRange: { min: number; max: number };
  search: string;
  employees: string[];
  priority: 'all' | 'high' | 'medium' | 'low';
  duration: 'all' | 'short' | 'medium' | 'long';
  hasConflicts: boolean;
  isRecurring: boolean;
}

const defaultFilters: FilterOptions = {
  serviceTypes: [],
  status: [],
  clients: [],
  dateRange: { start: '', end: '' },
  priceRange: { min: 0, max: 1000 },
  search: '',
  employees: [],
  priority: 'all',
  duration: 'all',
  hasConflicts: false,
  isRecurring: false
};

const Calendar = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['calendar', 'common', 'jobs']);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickJobModal, setShowQuickJobModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboardHelper, setShowKeyboardHelper] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('calendarDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Load jobs and clients
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
      toast.error(t('common:errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter jobs based on active filters
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Service types filter
    if (filters.serviceTypes.length > 0) {
      filtered = filtered.filter(job => filters.serviceTypes.includes(job.service_type));
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(job => filters.status.includes(job.status));
    }

    // Clients filter
    if (filters.clients.length > 0) {
      filtered = filtered.filter(job => filters.clients.includes(job.client_id));
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.scheduled_date);
        if (filters.dateRange.start && jobDate < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && jobDate > new Date(filters.dateRange.end)) return false;
        return true;
      });
    }

    // Price range filter
    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
      filtered = filtered.filter(job => {
        const price = job.estimated_price || 0;
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.address?.toLowerCase().includes(searchLower) ||
        job.client?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Duration filter
    if (filters.duration !== 'all') {
      filtered = filtered.filter(job => {
        const duration = job.estimated_duration || 60;
        switch (filters.duration) {
          case 'short': return duration < 120;
          case 'medium': return duration >= 120 && duration <= 240;
          case 'long': return duration > 240;
          default: return true;
        }
      });
    }

    // Conflicts filter
    if (filters.hasConflicts) {
      filtered = filtered.filter(job => {
        const sameTimeJobs = jobs.filter(j => 
          j.scheduled_date === job.scheduled_date && 
          j.scheduled_time === job.scheduled_time && 
          j.id !== job.id
        );
        return sameTimeJobs.length > 0;
      });
    }

    // Recurring filter
    if (filters.isRecurring) {
      filtered = filtered.filter(job => job.is_recurring);
    }

    return filtered;
  }, [jobs, filters]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadData();
      toast.success("Calendar refreshed", { duration: 1000 });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('calendarDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Handle job creation
  const handleJobCreated = () => {
    loadData();
    setShowQuickJobModal(false);
    toast.success(t('jobs:jobCreated'));
  };

  // Handle date click
  const handleDateClick = (date: Date, time?: string) => {
    setSelectedDate(date);
    setSelectedTime(time || "");
    setShowQuickJobModal(true);
  };

  // Handle job click
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetailsModal(true);
  };

  // Handle job drag and drop
  const handleJobDrop = async (jobId: string, newDate: string, newTime?: string) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      const updateData = {
        scheduled_date: newDate,
        ...(newTime && { scheduled_time: newTime })
      };

      await jobsApi.update(jobId, updateData);
      await loadData();
      toast.success(t('jobs:jobUpdated'));
    } catch (error) {
      console.error('Error rescheduling job:', error);
      toast.error(t('common:errorOccurred'));
    }
  };

  // Handle job status change
  const handleJobStatusChange = async (jobId: string, status: string) => {
    try {
      await jobsApi.update(jobId, { status: status as JobStatus });
      await loadData();
      toast.success(t('jobs:jobUpdated'));
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error(t('common:errorOccurred'));
    }
  };

  // Handle job edit
  const handleJobEdit = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetailsModal(true);
  };

  // Handle job delete
  const handleJobDelete = async (jobId: string) => {
    if (!confirm(t('common:confirmDelete'))) return;
    
    try {
      await jobsApi.delete(jobId);
      await loadData();
      setShowJobDetailsModal(false);
      toast.success(t('jobs:jobDeleted'));
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(t('common:errorOccurred'));
    }
  };

  // Handle job duplicate
  const handleJobDuplicate = async (job: Job) => {
    try {
      const duplicateData = {
        client_id: job.client_id,
        title: `${job.title} (Copy)`,
        service_type: job.service_type,
        scheduled_date: job.scheduled_date,
        scheduled_time: job.scheduled_time,
        estimated_duration: job.estimated_duration,
        estimated_price: job.estimated_price,
        address: job.address,
        special_instructions: job.special_instructions,
        access_instructions: job.access_instructions,
        is_recurring: false,
        status: 'scheduled' as JobStatus
      };

      await jobsApi.create(duplicateData);
      await loadData();
      setShowJobDetailsModal(false);
      toast.success('Job duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating job:', error);
      toast.error('Failed to duplicate job');
    }
  };

  // Export calendar data
  const handleExportCalendar = () => {
    const calendarData = filteredJobs.map(job => ({
      title: job.title,
      client: job.client?.name,
      date: job.scheduled_date,
      time: job.scheduled_time,
      service: job.service_type,
      status: job.status,
      price: job.estimated_price,
      duration: job.estimated_duration
    }));

    const csvContent = [
      ['Title', 'Client', 'Date', 'Time', 'Service', 'Status', 'Price', 'Duration'],
      ...calendarData.map(job => [
        job.title,
        job.client || '',
        job.date,
        job.time || '',
        job.service,
        job.status,
        job.price || '',
        job.duration || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sweeply-calendar-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Calendar exported successfully!');
  };

  // Calculate quick stats
  const todayJobs = filteredJobs.filter(job => 
    job.scheduled_date === new Date().toISOString().split('T')[0]
  );
  
  const weeklyRevenue = filteredJobs
    .filter(job => {
      const jobDate = new Date(job.scheduled_date);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return jobDate >= weekStart && jobDate <= weekEnd;
    })
    .reduce((sum, job) => sum + (job.estimated_price || 0), 0);

  const conflicts = filteredJobs.filter(job => {
    const sameTimeJobs = filteredJobs.filter(j => 
      j.scheduled_date === job.scheduled_date && 
      j.scheduled_time === job.scheduled_time && 
      j.id !== job.id
    );
    return sameTimeJobs.length > 0;
  }).length;

  const stats = {
    todayJobs: todayJobs.length,
    weeklyRevenue,
    conflicts
  };

  // Handle calendar preferences
  const handlePreferencesSave = (preferences: any) => {
    // Save preferences to localStorage or backend
    localStorage.setItem('calendarPreferences', JSON.stringify(preferences));
    toast.success('Preferences saved successfully!');
  };

  // Handle keyboard shortcuts
  const handleKeyboardShortcut = (action: string) => {
    switch (action) {
      case 'newJob':
        handleDateClick(new Date());
        break;
      case 'previousPeriod':
        if (calendarView === 'month') {
          setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
        } else if (calendarView === 'week' || calendarView === 'timeline') {
          setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
        } else {
          setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
        }
        break;
      case 'nextPeriod':
        if (calendarView === 'month') {
          setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
        } else if (calendarView === 'week' || calendarView === 'timeline') {
          setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
        } else {
          setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
        }
        break;
      case 'today':
        setCurrentDate(new Date());
        break;
      case 'view-month':
      case 'view-week':
      case 'view-day':
      case 'view-list':
      case 'view-timeline':
      case 'view-map':
        setCalendarView(action.split('-')[1] as CalendarView);
        break;
      case 'openFilters':
        setShowFilters(true);
        break;
      case 'export':
        handleExportCalendar();
        break;
      case 'focusSearch':
        // Focus the search input in the header
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
        break;
      case 'toggleDarkMode':
        setDarkMode(!darkMode);
        break;
      case 'closeModal':
        // Close any open modal
        if (showQuickJobModal) setShowQuickJobModal(false);
        else if (showJobDetailsModal) setShowJobDetailsModal(false);
        else if (showFilters) setShowFilters(false);
        else if (showSettings) setShowSettings(false);
        else if (showKeyboardHelper) setShowKeyboardHelper(false);
        break;
    }
  };

  // Render calendar content based on view
  const renderCalendarContent = () => {
    switch (calendarView) {
      case 'list':
        return (
          <CalendarListView
            jobs={filteredJobs}
            onJobClick={handleJobClick}
            onJobEdit={handleJobEdit}
            onJobDelete={handleJobDelete}
            onJobDuplicate={handleJobDuplicate}
            darkMode={darkMode}
          />
        );
      case 'map':
        return (
          <CalendarMapView
            jobs={filteredJobs}
            onJobClick={handleJobClick}
            darkMode={darkMode}
          />
        );
      case 'timeline':
        return (
          <CalendarTimelineView
            jobs={filteredJobs}
            currentDate={currentDate}
            onJobClick={handleJobClick}
            onDateChange={setCurrentDate}
            darkMode={darkMode}
          />
        );
      default:
        return (
          <AdvancedCalendarView
            jobs={filteredJobs}
            onJobClick={handleJobClick}
            onDateClick={handleDateClick}
            onJobDrop={handleJobDrop}
            loading={loading}
          />
        );
    }
  };

  return (
    <AppLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`space-y-6 ${darkMode ? 'dark' : ''}`}
      >
        {/* Enhanced Calendar Header */}
        <CalendarHeader
          currentDate={currentDate}
          view={calendarView}
          onViewChange={setCalendarView}
          onDateChange={setCurrentDate}
          onQuickAdd={() => handleDateClick(new Date())}
          onExport={handleExportCalendar}
          onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
          onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
          autoRefresh={autoRefresh}
          showAnalytics={showAnalytics}
          stats={stats}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        {/* Filter and Settings Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(true)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                Object.values(filters).some(f => 
                  Array.isArray(f) ? f.length > 0 : 
                  typeof f === 'object' ? (f as any).start || (f as any).end || (f as any).min > 0 || (f as any).max < 1000 : 
                  f && f !== 'all'
                )
                  ? 'bg-pulse-500 text-white'
                  : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {Object.values(filters).some(f => 
                Array.isArray(f) ? f.length > 0 : 
                typeof f === 'object' ? (f as any).start || (f as any).end || (f as any).min > 0 || (f as any).max < 1000 : 
                f && f !== 'all'
              ) && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  Active
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </motion.button>
          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        </div>

        {/* Analytics Dashboard with Animation */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-6 overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Calendar Analytics
                </h2>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  <EyeOff className="w-5 h-5" />
                </button>
              </div>
              <CalendarAnalytics 
                jobs={filteredJobs} 
                currentDate={currentDate} 
                view={
                  calendarView === 'month' ? 'month' : 
                  calendarView === 'week' || calendarView === 'day' || calendarView === 'timeline' ? 'week' : 
                  'week'
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar Content with Loading Animation */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center justify-center h-96 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-xl shadow-sm`}
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-pulse-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Loading calendar...
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={calendarView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCalendarContent()}
          </motion.div>
        )}

        {/* Performance Tips (Enhanced) */}
        {!showAnalytics && filteredJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-lg p-6 border ${
              darkMode 
                ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700' 
                : 'bg-gradient-to-r from-pulse-50 to-blue-50 border-pulse-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className={`p-2 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-pulse-100'
                }`}
              >
                <Target className={`w-6 h-6 ${
                  darkMode ? 'text-pulse-400' : 'text-pulse-600'
                }`} />
              </motion.div>
              <div>
                <h3 className={`font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Scheduling Tips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg ${
                      darkMode ? 'bg-gray-800/50' : 'bg-white/50'
                    }`}
                  >
                    <strong className={darkMode ? 'text-pulse-300' : 'text-pulse-600'}>
                      Optimize Routes:
                    </strong>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Group nearby jobs together to reduce travel time
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg ${
                      darkMode ? 'bg-gray-800/50' : 'bg-white/50'
                    }`}
                  >
                    <strong className={darkMode ? 'text-purple-300' : 'text-purple-600'}>
                      Buffer Time:
                    </strong>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Add 15-30 minutes between jobs for travel and setup
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg ${
                      darkMode ? 'bg-gray-800/50' : 'bg-white/50'
                    }`}
                  >
                    <strong className={darkMode ? 'text-green-300' : 'text-green-600'}>
                      Peak Hours:
                    </strong>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Schedule high-value services during optimal time slots
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Job Modal */}
        <QuickJobModal
          isOpen={showQuickJobModal}
          onClose={() => setShowQuickJobModal(false)}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onJobCreated={handleJobCreated}
          existingJobs={jobs}
        />

        {/* Job Details Modal */}
        <JobDetailsModal
          job={selectedJob}
          isOpen={showJobDetailsModal}
          onClose={() => setShowJobDetailsModal(false)}
          onEdit={handleJobEdit}
          onDelete={handleJobDelete}
          onStatusChange={handleJobStatusChange}
          onDuplicate={handleJobDuplicate}
        />

        {/* Filters Modal */}
        <CalendarFilters
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={setFilters}
          clients={clients}
          darkMode={darkMode}
        />

        {/* Settings Modal */}
        <CalendarSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={handlePreferencesSave}
          darkMode={darkMode}
        />

        {/* Keyboard Shortcuts Helper */}
        <CalendarKeyboardShortcuts
          onShortcut={handleKeyboardShortcut}
          darkMode={darkMode}
          showHelper={showKeyboardHelper}
          onToggleHelper={() => setShowKeyboardHelper(!showKeyboardHelper)}
        />
      </motion.div>
    </AppLayout>
  );
};

export default Calendar; 