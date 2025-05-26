import React, { useState, useEffect } from "react";
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
  Target
} from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api/jobs";
import { Job } from "@/types/job";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/AppLayout";
import AdvancedCalendarView from "@/components/Calendar/AdvancedCalendarView";
import QuickJobModal from "@/components/Calendar/QuickJobModal";
import JobDetailsModal from "@/components/Calendar/JobDetailsModal";
import CalendarAnalytics from "@/components/Calendar/CalendarAnalytics";

const Calendar = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['calendar', 'common', 'jobs']);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickJobModal, setShowQuickJobModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day' | 'timeline'>('month');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Load jobs
  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getAll();
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error(t('common:errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadJobs();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Handle job creation
  const handleJobCreated = () => {
    loadJobs();
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
      await loadJobs();
      toast.success(t('jobs:jobUpdated'));
    } catch (error) {
      console.error('Error rescheduling job:', error);
      toast.error(t('common:errorOccurred'));
    }
  };

  // Handle job status change
  const handleJobStatusChange = async (jobId: string, status: string) => {
    try {
      await jobsApi.update(jobId, { status: status as any });
      await loadJobs();
      toast.success(t('jobs:jobUpdated'));
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error(t('common:errorOccurred'));
    }
  };

  // Handle job edit
  const handleJobEdit = (job: Job) => {
    // Navigate to edit job page or open edit modal
    console.log('Edit job:', job);
    toast.info('Job editing feature coming soon!');
  };

  // Handle job delete
  const handleJobDelete = async (jobId: string) => {
    if (!confirm(t('common:confirmDelete'))) return;
    
    try {
      await jobsApi.delete(jobId);
      await loadJobs();
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
        is_recurring: false, // Don't duplicate recurring settings
        status: 'scheduled'
      };

      await jobsApi.create(duplicateData);
      await loadJobs();
      setShowJobDetailsModal(false);
      toast.success('Job duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating job:', error);
      toast.error('Failed to duplicate job');
    }
  };

  // Export calendar data
  const handleExportCalendar = () => {
    const calendarData = jobs.map(job => ({
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
      [t('common:name'), t('common:client'), t('common:date'), t('common:time'), t('common:service'), t('common:status'), t('common:price'), t('common:duration')],
      ...calendarData.map(job => [
        job.title,
        job.client,
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
    
    toast.success(t('calendar:exportCalendar'));
  };

  // Calculate quick stats
  const todayJobs = jobs.filter(job => 
    job.scheduled_date === new Date().toISOString().split('T')[0]
  );
  
  const weeklyRevenue = jobs
    .filter(job => {
      const jobDate = new Date(job.scheduled_date);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return jobDate >= weekStart && jobDate <= weekEnd;
    })
    .reduce((sum, job) => sum + (job.estimated_price || 0), 0);

  const conflicts = jobs.filter(job => {
    const sameTimeJobs = jobs.filter(j => 
      j.scheduled_date === job.scheduled_date && 
      j.scheduled_time === job.scheduled_time && 
      j.id !== job.id
    );
    return sameTimeJobs.length > 0;
  }).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-pulse-500" />
              {t('calendar:calendar')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('calendar:dragToReschedule')}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick Stats */}
            <div className="flex items-center gap-4 bg-white rounded-lg px-4 py-2 shadow-sm border">
              <div className="text-center">
                <div className="text-lg font-bold text-pulse-600">{todayJobs.length}</div>
                <div className="text-xs text-gray-600">{t('calendar:today')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">${weeklyRevenue}</div>
                <div className="text-xs text-gray-600">{t('calendar:thisWeek')}</div>
              </div>
              {conflicts > 0 && (
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{conflicts}</div>
                  <div className="text-xs text-gray-600">{t('calendar:conflictDetected')}</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Enable auto-refresh'}
            >
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`p-2 rounded-lg transition-colors ${
                showAnalytics 
                  ? 'bg-pulse-100 text-pulse-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Toggle analytics"
            >
              {showAnalytics ? <EyeOff className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
            </button>

            <button
              onClick={handleExportCalendar}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title="Export calendar"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleDateClick(new Date())}
              className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Quick Add
            </button>
          </div>
        </div>

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Calendar Analytics
              </h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <EyeOff className="w-5 h-5" />
              </button>
            </div>
            <CalendarAnalytics 
              jobs={jobs} 
              currentDate={currentDate} 
              view={calendarView === 'day' || calendarView === 'timeline' ? 'week' : calendarView}
            />
          </div>
        )}

        {/* Advanced Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <AdvancedCalendarView
            jobs={jobs}
            onJobClick={handleJobClick}
            onDateClick={handleDateClick}
            onJobDrop={handleJobDrop}
            loading={loading}
          />
        </div>

        {/* Performance Tips */}
        {!showAnalytics && (
          <div className="bg-gradient-to-r from-pulse-50 to-blue-50 rounded-lg p-6 border border-pulse-200">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-pulse-100 rounded-lg">
                <Target className="w-6 h-6 text-pulse-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Scheduling Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                  <div>
                    <strong>Optimize Routes:</strong> Group nearby jobs together to reduce travel time
                  </div>
                  <div>
                    <strong>Buffer Time:</strong> Add 15-30 minutes between jobs for travel and setup
                  </div>
                  <div>
                    <strong>Peak Hours:</strong> Schedule high-value services during optimal time slots
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      </div>
    </AppLayout>
  );
};

export default Calendar; 