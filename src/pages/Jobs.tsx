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
  Edit
} from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api/jobs";
import { Job, JobFilters, ServiceType, JobStatus } from "@/types/job";
import AppLayout from "@/components/AppLayout";

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<JobFilters>({});
  const [showFilters, setShowFilters] = useState(false);

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

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadJobs();
      return;
    }

    try {
      setLoading(true);
      const data = await jobsApi.search(searchTerm);
      setJobs(data);
    } catch (error) {
      console.error('Error searching jobs:', error);
      toast.error("Failed to search jobs");
    } finally {
      setLoading(false);
    }
  };

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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString?: string) => {
    if (!timeString) return 'No time set';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filter jobs based on search term
  const filteredJobs = searchTerm 
    ? jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : jobs;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Jobs</h1>
            <p className="mt-1 text-gray-600">Manage your cleaning appointments and services</p>
          </div>
          <Link
            to="/jobs/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobs, clients, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status?.[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    status: e.target.value ? [e.target.value as JobStatus] : undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                >
                  <option value="">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                <select
                  value={filters.service_type?.[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    service_type: e.target.value ? [e.target.value as ServiceType] : undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                >
                  <option value="">All Types</option>
                  <option value="regular">Regular Cleaning</option>
                  <option value="deep_clean">Deep Clean</option>
                  <option value="move_in">Move-in Clean</option>
                  <option value="move_out">Move-out Clean</option>
                  <option value="post_construction">Post-Construction</option>
                  <option value="one_time">One-time Clean</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    date_from: e.target.value || undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    date_to: e.target.value || undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                />
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
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No jobs match your search criteria.' : 'Get started by creating your first job.'}
              </p>
              <Link
                to="/jobs/new"
                className="inline-flex items-center px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-500">{getServiceTypeDisplay(job.service_type)}</div>
                            {job.description && (
                              <div className="text-sm text-gray-400 mt-1 truncate max-w-xs">
                                {job.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{job.client?.name}</div>
                              {job.client?.phone && (
                                <div className="text-sm text-gray-500">{job.client.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div>{formatDate(job.scheduled_date)}</div>
                              <div className="text-gray-500 flex items-center mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTime(job.scheduled_time)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={getStatusBadge(job.status)}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                            {job.actual_price || job.estimated_price || 'Not set'}
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
                            {(job.status === 'scheduled' || job.status === 'in_progress') && (
                              <button
                                onClick={() => handleStatusUpdate(job.id, 'cancelled')}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                title="Cancel Job"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <Link
                              to={`/jobs/${job.id}/edit`}
                              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                              title="Edit Job"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Jobs; 