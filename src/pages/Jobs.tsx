import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  MapPin,
  MoreVertical,
  Play,
  CheckCircle,
  XCircle,
  Edit,
  FileText,
  Receipt,
  Copy,
  Eye,
  Phone,
  Mail,
  Repeat,
  CalendarCheck,
  CalendarX,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api/jobs";
import { invoicesApi } from "@/lib/api/invoices";
import { Job, JobFilters, ServiceType, JobStatus } from "@/types/job";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";
import AppLayout from "@/components/AppLayout";
import RecurringJobManager from "@/components/RecurringJobManager";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";

const Jobs = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['jobs', 'common']);
  const { formatDate, formatTime } = useLocale();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<JobFilters & { is_recurring?: boolean }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showRecurringManager, setShowRecurringManager] = useState(false);
  const [selectedRecurringJobId, setSelectedRecurringJobId] = useState<string | null>(null);

  // Load jobs
  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getAll(filters);
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
  }, [filters]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle status update
  const handleStatusUpdate = async (jobId: string, newStatus: JobStatus) => {
    try {
      await jobsApi.updateStatus(jobId, newStatus);
      toast.success(`Job ${newStatus.replace('_', ' ')}`);
      loadJobs(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error("Failed to update job status");
    }
  };

  // Handle job selection
  const handleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredJobs.map(job => job.id)));
    }
  };

  // Create invoice from selected jobs
  const handleCreateInvoice = async (jobIds: string[]) => {
    if (jobIds.length === 0) {
      toast.error("Please select at least one job");
      return;
    }

    // Get the first job to determine client
    const firstJob = jobs.find(job => jobIds.includes(job.id));
    if (!firstJob) {
      toast.error("Selected jobs not found");
      return;
    }

    // Check if all selected jobs are for the same client
    const selectedJobsData = jobs.filter(job => jobIds.includes(job.id));
    const clientIds = [...new Set(selectedJobsData.map(job => job.client_id))];
    
    if (clientIds.length > 1) {
      toast.error("All selected jobs must be for the same client");
      return;
    }

    // Check if jobs are completed
    const incompletedJobs = selectedJobsData.filter(job => job.status !== 'completed');
    if (incompletedJobs.length > 0) {
      const proceed = confirm(`${incompletedJobs.length} job(s) are not completed. Create invoice anyway?`);
      if (!proceed) return;
    }

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days from now
      
      const invoice = await invoicesApi.createFromJobs(
        jobIds, 
        firstJob.client_id, 
        dueDate.toISOString().split('T')[0]
      );
      
      toast.success(`Invoice ${invoice.invoice_number} created successfully!`);
      setSelectedJobs(new Set());
      
      // Navigate to invoice or show success message
      window.open(`/invoices/${invoice.id}`, '_blank');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error("Failed to create invoice");
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: JobStatus) => {
    if (selectedJobs.size === 0) {
      toast.error("Please select jobs to update");
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedJobs).map(jobId => jobsApi.updateStatus(jobId, status))
      );
      toast.success(`${selectedJobs.size} job(s) updated to ${status.replace('_', ' ')}`);
      setSelectedJobs(new Set());
      loadJobs();
    } catch (error) {
      console.error('Error updating jobs:', error);
      toast.error("Failed to update jobs");
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: JobStatus) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'scheduled':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'in_progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get service type display name
  const getServiceTypeDisplay = (serviceType: ServiceType) => {
    const types = {
      regular: 'Regular Cleaning',
      deep_clean: 'Deep Clean',
      move_in: 'Move-in Clean',
      move_out: 'Move-out Clean',
      post_construction: 'Post-Construction',
      one_time: 'One-time Clean'
    };
    return types[serviceType] || serviceType;
  };

  // Filter jobs based on search term and filters
  const filteredJobs = jobs.filter(job => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        job.title.toLowerCase().includes(searchLower) ||
        job.client?.name.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.address?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    return true;
  });

  // Calculate statistics with overdue jobs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stats = {
    total: jobs.length, // Now jobs only contains parent jobs, not instances
    scheduled: jobs.filter(j => j.status === 'scheduled').length,
    in_progress: jobs.filter(j => j.status === 'in_progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    overdue: jobs.filter(j => 
      j.status === 'scheduled' && 
      new Date(j.scheduled_date) < today
    ).length,
    total_revenue: jobs.filter(j => j.status === 'completed').reduce((sum, j) => sum + (j.actual_price || j.estimated_price || 0), 0)
  };

  // Handle manage recurring series
  const handleManageRecurringSeries = (jobId: string) => {
    setSelectedRecurringJobId(jobId);
    setShowRecurringManager(true);
  };

  // Helper to format job time with fallback
  const formatJobTime = (timeString?: string) => {
    if (!timeString) return 'No time set';
    try {
      // Create a date object with the time string
      const timeDate = new Date(`2000-01-01T${timeString}`);
      return formatTime(timeDate);
    } catch (error) {
      return 'Invalid time';
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Jobs" compact />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-gray-900">Jobs</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">Manage your cleaning appointments and services</p>
          </div>
          <div className="mt-3 sm:mt-0 flex gap-2 sm:gap-3">
            {selectedJobs.size > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors text-xs sm:text-sm"
              >
                <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Bulk Actions</span> ({selectedJobs.size})
              </button>
            )}
            <Link
              to="/jobs/new"
              className="px-3 sm:px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 flex items-center gap-2 transition-colors text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">New</span> Job
            </Link>
          </div>
        </div>

        {/* Statistics Cards - Mobile Scrollable, Desktop Grid */}
        <div className="flex overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-8 no-scrollbar">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 flex-shrink-0 w-32 sm:w-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 flex-shrink-0 w-32 sm:w-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 flex-shrink-0 w-32 sm:w-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Play className="h-5 w-5 sm:h-8 sm:w-8 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.in_progress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 flex-shrink-0 w-32 sm:w-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          {stats.overdue > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 flex-shrink-0 w-32 sm:w-auto border-2 border-red-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarX className="h-5 w-5 sm:h-8 sm:w-8 text-red-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-red-600">Overdue</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 flex-shrink-0 w-32 sm:w-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">${stats.total_revenue.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedJobs.size > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-lg font-medium text-gray-900">
                Bulk Actions ({selectedJobs.size} selected)
              </h3>
              <button
                onClick={() => setShowBulkActions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => handleCreateInvoice(Array.from(selectedJobs))}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors text-xs sm:text-sm"
              >
                <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
                Create Invoice
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('completed')}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors text-xs sm:text-sm"
              >
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Mark Completed
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('in_progress')}
                className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors text-xs sm:text-sm"
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                Mark In Progress
              </button>
              <button
                onClick={() => setSelectedJobs(new Set())}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-9 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Quick Filters - Scrollable on mobile */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
              <select
                value={filters.status?.[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  status: e.target.value ? [e.target.value as JobStatus] : undefined
                }))}
                className="px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 text-xs sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filters.service_type?.[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  service_type: e.target.value ? [e.target.value as ServiceType] : undefined
                }))}
                className="px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 text-xs sm:text-sm"
              >
                <option value="">All Services</option>
                <option value="regular">Regular Cleaning</option>
                <option value="deep_clean">Deep Clean</option>
                <option value="move_in">Move-in Clean</option>
                <option value="move_out">Move-out Clean</option>
                <option value="post_construction">Post-Construction</option>
                <option value="one_time">One-time Clean</option>
              </select>

              <select
                value={filters.is_recurring === undefined ? '' : filters.is_recurring.toString()}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  is_recurring: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className="px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 text-xs sm:text-sm whitespace-nowrap"
              >
                <option value="">All Jobs</option>
                <option value="true">Recurring Series</option>
                <option value="false">One-time Jobs</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">More</span> Filters
              </button>
            </div>
          </div>

          {/* Advanced Filter Panel */}
          {showFilters && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">From Date</label>
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    date_from: e.target.value || undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    date_to: e.target.value || undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({})}
                  className="px-3 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-xl shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-6 sm:p-12 text-center">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No jobs found</h3>
              <p className="text-sm text-gray-600 mb-3 sm:mb-4">
                {searchTerm ? 'Try adjusting your search or filters' : 'Get started by scheduling your first job'}
              </p>
              {!searchTerm && (
                <Link
                  to="/jobs/new"
                  className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  Schedule Your First Job
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-pulse-500 focus:ring-pulse-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredJobs.map((job) => {
                      const isOverdue = job.status === 'scheduled' && new Date(job.scheduled_date) < today;
                      return (
                      <tr key={job.id} className={`hover:bg-gray-50 transition-colors ${selectedJobs.has(job.id) ? 'bg-blue-50' : ''} ${isOverdue ? 'bg-red-50' : ''}`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedJobs.has(job.id)}
                            onChange={() => handleJobSelection(job.id)}
                            className="rounded border-gray-300 text-pulse-500 focus:ring-pulse-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">{job.title}</h4>
                                {isOverdue && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                    <CalendarX className="w-3 h-3" />
                                    Overdue
                                  </span>
                                )}
                                {job.is_recurring && !job.parent_job_id && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                    <Repeat className="w-3 h-3" />
                                    {job.recurring_frequency?.replace('_', ' ')}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{getServiceTypeDisplay(job.service_type)}</p>
                              {job.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                              )}
                              {job.parent_job_id && (
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                  <CalendarCheck className="w-3 h-3" />
                                  Part of recurring series
                                </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{job.client?.name}</div>
                              {job.client?.phone && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {job.client.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(job.scheduled_date)}
                            </div>
                            {job.scheduled_time && (
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {formatJobTime(job.scheduled_time)}
                              </div>
                            )}
                            {job.estimated_duration && (
                              <div className="text-sm text-gray-400 mt-1">
                                {Math.round(job.estimated_duration / 60)} hours
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={getStatusBadge(job.status)}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            {job.actual_price ? (
                              <div className="text-sm font-medium text-green-600">
                                ${job.actual_price}
                              </div>
                            ) : job.estimated_price ? (
                              <div className="text-sm text-gray-900">
                                ${job.estimated_price}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">
                                No price set
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {job.status === 'scheduled' && (
                              <button
                                onClick={() => handleStatusUpdate(job.id, 'in_progress')}
                                className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded"
                                title="Start Job"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            {job.status === 'in_progress' && (
                              <button
                                onClick={() => handleStatusUpdate(job.id, 'completed')}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                title="Complete Job"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {job.status === 'completed' && (
                              <button
                                onClick={() => handleCreateInvoice([job.id])}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Create Invoice"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                            )}
                            {(job.status === 'scheduled' || job.status === 'in_progress') && (
                              <button
                                onClick={() => handleStatusUpdate(job.id, 'cancelled')}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                title="Cancel Job"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            {job.is_recurring && !job.parent_job_id && (
                              <button
                                onClick={() => handleManageRecurringSeries(job.id)}
                                className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                                title="Manage Recurring Series"
                              >
                                <Repeat className="w-4 h-4" />
                              </button>
                            )}
                            <Link
                              to={`/jobs/${job.id}/edit`}
                              className="p-1 text-gray-400 hover:text-pulse-600 transition-colors"
                              title="Edit job"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View: Job Cards */}
              <div className="md:hidden">
                <div className="divide-y divide-gray-100">
                  {filteredJobs.map((job) => {
                    const isOverdue = job.status === 'scheduled' && new Date(job.scheduled_date) < today;
                    return (
                      <div 
                        key={job.id} 
                        className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors 
                        ${selectedJobs.has(job.id) ? 'bg-blue-50' : ''} 
                        ${isOverdue ? 'bg-red-50' : ''}`}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 pt-1">
                            <input
                              type="checkbox"
                              checked={selectedJobs.has(job.id)}
                              onChange={() => handleJobSelection(job.id)}
                              className="rounded border-gray-300 text-pulse-500 focus:ring-pulse-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Header with Title and Status */}
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1 min-w-0 pr-2">
                                <Link to={`/jobs/${job.id}`} className="block">
                                  <h3 className="text-sm font-semibold text-gray-900 truncate">{job.title}</h3>
                                </Link>
                                <p className="text-xs text-gray-600 mt-0.5">{getServiceTypeDisplay(job.service_type)}</p>
                              </div>
                              <span className={`${getStatusBadge(job.status)} flex-shrink-0`}>
                                {job.status.replace('_', ' ')}
                              </span>
                            </div>
                            
                            {/* Tags Row */}
                            <div className="flex flex-wrap gap-1 my-1.5">
                              {isOverdue && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                  <CalendarX className="w-2.5 h-2.5" />
                                  <span className="text-[10px]">Overdue</span>
                                </span>
                              )}
                              {job.is_recurring && !job.parent_job_id && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                  <Repeat className="w-2.5 h-2.5" />
                                  <span className="text-[10px]">{job.recurring_frequency?.replace('_', ' ')}</span>
                                </span>
                              )}
                              {job.parent_job_id && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                  <CalendarCheck className="w-2.5 h-2.5" />
                                  <span className="text-[10px]">Recurring</span>
                                </span>
                              )}
                            </div>
                            
                            {/* Info Rows */}
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                {formatDate(job.scheduled_date)}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="w-3 h-3 mr-1 text-gray-400" />
                                {formatJobTime(job.scheduled_time)}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <User className="w-3 h-3 mr-1 text-gray-400" />
                                <span className="truncate">{job.client?.name}</span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                                <span className={job.actual_price ? "text-green-600 font-medium" : "text-gray-600"}>
                                  {job.actual_price ? `$${job.actual_price}` : 
                                   job.estimated_price ? `$${job.estimated_price}` : 'No price'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Actions Row */}
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-1.5">
                                {job.status === 'scheduled' && (
                                  <button
                                    onClick={() => handleStatusUpdate(job.id, 'in_progress')}
                                    className="p-1.5 bg-yellow-100 text-yellow-600 rounded-full"
                                    title="Start Job"
                                  >
                                    <Play className="w-3 h-3" />
                                  </button>
                                )}
                                {job.status === 'in_progress' && (
                                  <button
                                    onClick={() => handleStatusUpdate(job.id, 'completed')}
                                    className="p-1.5 bg-green-100 text-green-600 rounded-full"
                                    title="Complete Job"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </button>
                                )}
                                {job.status === 'completed' && (
                                  <button
                                    onClick={() => handleCreateInvoice([job.id])}
                                    className="p-1.5 bg-blue-100 text-blue-600 rounded-full"
                                    title="Create Invoice"
                                  >
                                    <Receipt className="w-3 h-3" />
                                  </button>
                                )}
                                {(job.status === 'scheduled' || job.status === 'in_progress') && (
                                  <button
                                    onClick={() => handleStatusUpdate(job.id, 'cancelled')}
                                    className="p-1.5 bg-red-100 text-red-600 rounded-full"
                                    title="Cancel Job"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </button>
                                )}
                                {job.is_recurring && !job.parent_job_id && (
                                  <button
                                    onClick={() => handleManageRecurringSeries(job.id)}
                                    className="p-1.5 bg-purple-100 text-purple-600 rounded-full"
                                    title="Manage Recurring Series"
                                  >
                                    <Repeat className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              
                              <div className="flex items-center">
                                <Link
                                  to={`/jobs/${job.id}/edit`}
                                  className="p-1.5 text-pulse-500 rounded-full"
                                >
                                  <Edit className="w-3 h-3" />
                                </Link>
                                <Link
                                  to={`/jobs/${job.id}`}
                                  className="p-1.5 text-gray-400"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Results Summary */}
        {!loading && filteredJobs.length > 0 && (
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 text-center">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        )}
      </div>

      {/* Recurring Job Manager Modal */}
      {showRecurringManager && selectedRecurringJobId && (
        <RecurringJobManager
          parentJobId={selectedRecurringJobId}
          onClose={() => {
            setShowRecurringManager(false);
            setSelectedRecurringJobId(null);
            loadJobs(); // Reload jobs after managing recurring series
          }}
          onUpdate={() => {
            loadJobs();
          }}
        />
      )}
    </AppLayout>
  );
};

export default Jobs; 
 
 
 
 