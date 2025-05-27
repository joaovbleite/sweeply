import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChevronRight,
  Filter,
  Hash,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import { Job } from '@/types/job';

interface CalendarListViewProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onJobEdit?: (job: Job) => void;
  onJobDelete?: (jobId: string) => void;
  onJobDuplicate?: (job: Job) => void;
  darkMode?: boolean;
}

const CalendarListView: React.FC<CalendarListViewProps> = ({
  jobs,
  onJobClick,
  onJobEdit,
  onJobDelete,
  onJobDuplicate,
  darkMode = false
}) => {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'price'>('date');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Group jobs by date
  const groupedJobs = useMemo(() => {
    const filtered = filterStatus === 'all' 
      ? jobs 
      : jobs.filter(job => job.status === filterStatus);

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
        case 'client':
          return (a.client?.name || '').localeCompare(b.client?.name || '');
        case 'price':
          return (b.estimated_price || 0) - (a.estimated_price || 0);
        default:
          return 0;
      }
    });

    const groups: Record<string, Job[]> = {};
    sorted.forEach(job => {
      const date = new Date(job.scheduled_date);
      let groupKey: string;
      
      if (isToday(date)) {
        groupKey = 'Today';
      } else if (isTomorrow(date)) {
        groupKey = 'Tomorrow';
      } else if (isPast(date)) {
        groupKey = 'Past';
      } else {
        const daysAway = differenceInDays(date, new Date());
        if (daysAway <= 7) {
          groupKey = format(date, 'EEEE');
        } else {
          groupKey = format(date, 'MMMM d');
        }
      }
      
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(job);
    });

    return groups;
  }, [jobs, filterStatus, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900';
      default:
        return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
    }
  };

  const getServiceTypeColor = (serviceType: string) => {
    const colors = {
      regular: 'bg-blue-500',
      deep_clean: 'bg-purple-500',
      move_in: 'bg-green-500',
      move_out: 'bg-orange-500',
      post_construction: 'bg-red-500',
      one_time: 'bg-gray-500'
    };
    return colors[serviceType] || 'bg-gray-500';
  };

  const handleJobAction = (action: 'edit' | 'delete' | 'duplicate', job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(null);
    
    switch (action) {
      case 'edit':
        onJobEdit?.(job);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this job?')) {
          onJobDelete?.(job.id);
        }
        break;
      case 'duplicate':
        onJobDuplicate?.(job);
        break;
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white'} rounded-xl shadow-sm`}>
      {/* Filters and Sort */}
      <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex gap-2">
              {['all', 'scheduled', 'in_progress', 'completed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    filterStatus === status
                      ? 'bg-pulse-500 text-white'
                      : darkMode
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'client' | 'price')}
              className={`px-3 py-1 text-sm rounded-lg ${
                darkMode
                  ? 'bg-gray-800 text-white border-gray-700'
                  : 'bg-gray-100 text-gray-900 border-gray-300'
              }`}
            >
              <option value="date">Date</option>
              <option value="client">Client</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {Object.entries(groupedJobs).map(([groupKey, groupJobs]) => (
          <div key={groupKey}>
            {/* Group Header */}
            <div className={`px-4 py-3 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-50'
            } sticky top-0 z-10`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">
                  {groupKey}
                  <span className="ml-2 text-xs text-gray-500">
                    ({groupJobs.length} {groupJobs.length === 1 ? 'job' : 'jobs'})
                  </span>
                </h3>
                <div className="text-sm text-gray-500">
                  ${groupJobs.reduce((sum, job) => sum + (job.estimated_price || 0), 0).toFixed(0)}
                </div>
              </div>
            </div>

            {/* Jobs in Group */}
            <AnimatePresence>
              {groupJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${
                    darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  } transition-colors cursor-pointer`}
                  onClick={() => onJobClick(job)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Service Type Indicator */}
                        <div className={`w-1 h-full ${getServiceTypeColor(job.service_type)} rounded-full`} />
                        
                        <div className="flex-1 min-w-0">
                          {/* Job Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-base flex items-center gap-2">
                                {job.client?.name || 'Unknown Client'}
                                {job.is_recurring && (
                                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 rounded-full">
                                    Recurring
                                  </span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {job.title || job.service_type?.replace('_', ' ')}
                              </p>
                            </div>
                            
                            {/* Status Badge */}
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(job.status)}`}>
                                {job.status.replace('_', ' ')}
                              </span>
                              
                              {/* Menu Button */}
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(showMenu === job.id ? null : job.id);
                                  }}
                                  className={`p-1 rounded-lg transition-colors ${
                                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                                  }`}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                
                                {showMenu === job.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg z-20 ${
                                      darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                                    }`}
                                  >
                                    <button
                                      onClick={(e) => handleJobAction('edit', job, e)}
                                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                      }`}
                                    >
                                      <Edit className="w-4 h-4" />
                                      Edit Job
                                    </button>
                                    <button
                                      onClick={(e) => handleJobAction('duplicate', job, e)}
                                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                      }`}
                                    >
                                      <Copy className="w-4 h-4" />
                                      Duplicate
                                    </button>
                                    <button
                                      onClick={(e) => handleJobAction('delete', job, e)}
                                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-600 ${
                                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                      }`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Job Details */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{format(new Date(job.scheduled_date), 'MMM d, yyyy')}</span>
                            </div>
                            
                            {job.scheduled_time && (
                              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{format(new Date(`2000-01-01T${job.scheduled_time}`), 'h:mm a')}</span>
                              </div>
                            )}
                            
                            {job.estimated_price && (
                              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>${job.estimated_price}</span>
                              </div>
                            )}
                            
                            {job.address && (
                              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate">{job.address.split(',')[0]}</span>
                              </div>
                            )}
                          </div>

                          {/* Expandable Details */}
                          <AnimatePresence>
                            {expandedJob === job.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                              >
                                {job.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {job.description}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap gap-2">
                                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                                    ID: {job.id.slice(0, 8)}
                                  </span>
                                  {job.estimated_duration && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                                      Duration: {job.estimated_duration} min
                                    </span>
                                  )}
                                  {job.created_at && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                                      Created: {format(new Date(job.created_at), 'MMM d, yyyy')}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedJob(expandedJob === job.id ? null : job.id);
                        }}
                        className={`ml-2 p-1 rounded-lg transition-all transform ${
                          expandedJob === job.id ? 'rotate-90' : ''
                        } ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {Object.keys(groupedJobs).length === 0 && (
        <div className="p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No jobs found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Try adjusting your filters or add a new job
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarListView; 