import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api/jobs";
import { Job } from "@/types/job";
import AppLayout from "@/components/AppLayout";
import CalendarView from "@/components/Calendar/CalendarView";
import QuickJobModal from "@/components/Calendar/QuickJobModal";

const Calendar = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [showQuickJobModal, setShowQuickJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Load jobs
  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getAll();
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Handle date click - open quick job modal
  const handleDateClick = (date: Date, time?: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setShowQuickJobModal(true);
  };

  // Handle job click - show job details (for now just show info)
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    // For now, just show a toast with job info
    // Later we can add a job details modal or navigate to job edit page
    toast.info(`${job.title} - ${job.client?.name}`, {
      description: `Scheduled for ${new Date(job.scheduled_date).toLocaleDateString()}${job.scheduled_time ? ` at ${job.scheduled_time}` : ''}`,
      action: {
        label: "Edit",
        onClick: () => {
          // Navigate to edit job page
          window.location.href = `/jobs/${job.id}/edit`;
        }
      }
    });
  };

  // Handle job drag and drop - reschedule job
  const handleJobDrop = async (jobId: string, newDate: string, newTime?: string) => {
    try {
      const updates: any = {
        scheduled_date: newDate
      };
      
      if (newTime) {
        updates.scheduled_time = newTime;
      }

      await jobsApi.update(jobId, updates);
      toast.success("Job rescheduled successfully!");
      loadJobs(); // Reload to show updated schedule
    } catch (error) {
      console.error('Error rescheduling job:', error);
      toast.error("Failed to reschedule job");
    }
  };

  // Handle job created from quick modal
  const handleJobCreated = () => {
    loadJobs(); // Reload jobs to show the new one
  };

  // Get today's jobs count
  const getTodaysJobsCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return jobs.filter(job => job.scheduled_date === today).length;
  };

  // Get upcoming jobs count (next 7 days)
  const getUpcomingJobsCount = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const todayStr = today.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    return jobs.filter(job => 
      job.scheduled_date >= todayStr && 
      job.scheduled_date <= nextWeekStr &&
      job.status !== 'cancelled'
    ).length;
  };

  // Check for scheduling conflicts
  const getConflicts = () => {
    const conflicts: { date: string; jobs: Job[] }[] = [];
    const jobsByDate: { [key: string]: Job[] } = {};
    
    // Group jobs by date
    jobs.forEach(job => {
      if (job.status !== 'cancelled') {
        if (!jobsByDate[job.scheduled_date]) {
          jobsByDate[job.scheduled_date] = [];
        }
        jobsByDate[job.scheduled_date].push(job);
      }
    });
    
    // Find dates with potential conflicts (multiple jobs at same time)
    Object.entries(jobsByDate).forEach(([date, dateJobs]) => {
      const timeSlots: { [key: string]: Job[] } = {};
      
      dateJobs.forEach(job => {
        if (job.scheduled_time) {
          const timeKey = job.scheduled_time.substring(0, 5); // HH:MM format
          if (!timeSlots[timeKey]) {
            timeSlots[timeKey] = [];
          }
          timeSlots[timeKey].push(job);
        }
      });
      
      // Check for conflicts (more than one job at same time)
      Object.entries(timeSlots).forEach(([time, timeJobs]) => {
        if (timeJobs.length > 1) {
          conflicts.push({ date, jobs: timeJobs });
        }
      });
    });
    
    return conflicts;
  };

  const conflicts = getConflicts();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Calendar</h1>
            <p className="mt-1 text-gray-600">Schedule and manage your cleaning appointments</p>
          </div>
          <Link
            to="/jobs/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{getTodaysJobsCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{getUpcomingJobsCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className={`h-8 w-8 ${conflicts.length > 0 ? 'text-red-600' : 'text-gray-400'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conflicts</p>
                <p className={`text-2xl font-bold ${conflicts.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {conflicts.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conflicts Alert */}
        {conflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Scheduling Conflicts Detected
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>You have {conflicts.length} scheduling conflict(s) that need attention:</p>
                  <ul className="mt-1 list-disc list-inside">
                    {conflicts.slice(0, 3).map((conflict, index) => (
                      <li key={index}>
                        {new Date(conflict.date).toLocaleDateString()}: {conflict.jobs.length} jobs at the same time
                      </li>
                    ))}
                    {conflicts.length > 3 && (
                      <li>...and {conflicts.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar */}
        <CalendarView
          jobs={jobs}
          onJobClick={handleJobClick}
          onDateClick={handleDateClick}
          onJobDrop={handleJobDrop}
          loading={loading}
        />

        {/* Quick Job Modal */}
        <QuickJobModal
          isOpen={showQuickJobModal}
          onClose={() => setShowQuickJobModal(false)}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onJobCreated={handleJobCreated}
        />

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How to use the calendar:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Click on any date</strong> to quickly schedule a new job</li>
            <li>• <strong>Drag and drop jobs</strong> to reschedule them to different dates/times</li>
            <li>• <strong>Click on jobs</strong> to view details or edit them</li>
            <li>• <strong>Use the view toggle</strong> to switch between month, week, and day views</li>
            <li>• <strong>Filter by service type</strong> to focus on specific types of jobs</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default Calendar; 