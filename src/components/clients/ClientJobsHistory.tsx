import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Briefcase,
  TrendingUp,
  FileText,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Job } from '@/types/job';
import { jobsApi } from '@/lib/api/jobs';
import { calendarUtils } from '@/lib/api/calendar-utils';

interface ClientJobsHistoryProps {
  clientId: string;
  clientName: string;
}

const ClientJobsHistory: React.FC<ClientJobsHistoryProps> = ({ clientId, clientName }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadClientJobs();
  }, [clientId]);

  const loadClientJobs = async () => {
    try {
      setLoading(true);
      const allJobs = await jobsApi.getAll({ client_id: clientId });
      setJobs(allJobs);
      
      // Calculate stats
      const clientStats = calendarUtils.getClientStats(allJobs, clientId);
      setStats(clientStats);
    } catch (error) {
      console.error('Error loading client jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getServiceTypeColor = (serviceType: string) => {
    const colors = {
      regular: 'bg-blue-100 text-blue-700',
      deep_clean: 'bg-purple-100 text-purple-700',
      move_in: 'bg-green-100 text-green-700',
      move_out: 'bg-orange-100 text-orange-700',
      post_construction: 'bg-red-100 text-red-700',
      one_time: 'bg-gray-100 text-gray-700'
    };
    return colors[serviceType] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Job Value</p>
                <p className="text-2xl font-bold text-purple-600">${stats.averageJobValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Jobs</p>
                <p className="text-2xl font-bold text-blue-600">{stats.upcomingJobs}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Job History</h3>
        </div>
        
        {jobs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No jobs found for this client</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(job.status)}
                      <h4 className="font-medium text-gray-900">
                        {job.title || `${job.service_type.replace('_', ' ')} Service`}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getServiceTypeColor(job.service_type)}`}>
                        {job.service_type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(job.scheduled_date), 'MMM d, yyyy')}
                      </div>
                      
                      {job.scheduled_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(`2000-01-01T${job.scheduled_time}`), 'h:mm a')}
                        </div>
                      )}
                      
                      {job.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{job.address.split(',')[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    {job.estimated_price && (
                      <p className="text-lg font-semibold text-gray-900">
                        ${job.estimated_price}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {job.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientJobsHistory; 