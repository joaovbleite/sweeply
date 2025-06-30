import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, MapPin, Briefcase } from 'lucide-react';
import { format, isToday } from 'date-fns';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import { jobsApi } from '@/lib/api/jobs';
import { Job } from '@/types/job';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/hooks/useLocale';

type TabType = 'Completed' | 'Active' | 'To Go';

const TodaysAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatCurrency } = useLocale();
  const [activeTab, setActiveTab] = useState<TabType>('Completed');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        // Use the dedicated getToday API method if available, otherwise filter manually
        let todaysJobs;
        try {
          // Try to use the dedicated API method first
          todaysJobs = await jobsApi.getToday();
        } catch (error) {
          console.log('Falling back to manual filtering for today\'s jobs');
          // Fallback to manual filtering
          const jobsData = await jobsApi.getAll({ show_instances: true });
          todaysJobs = jobsData.filter(job => {
            const jobDate = new Date(job.scheduled_date);
            return isToday(jobDate);
          });
        }
        setJobs(todaysJobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Filter jobs based on active tab
  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'Completed') {
      return job.status === 'completed';
    } else if (activeTab === 'Active') {
      return job.status === 'in_progress';
    } else { // To Go
      return job.status === 'scheduled';
    }
  });

  return (
    <AppLayout>
      {/* Page Header */}
      <PageHeader
        title="Today's appointments"
        onBackClick={() => navigate(-1)}
        compact
      />

      {/* Tabs */}
      <div className="px-4 py-4">
        <div className="flex bg-white rounded-full border border-gray-200 p-1">
          {(['Completed', 'Active', 'To Go'] as TabType[]).map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="px-4 pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
            <p className="text-gray-600 font-medium">No {activeTab.toLowerCase()} appointments today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="flex">
                  {/* Left colored bar */}
                  <div className={`w-1.5 self-stretch ${
                    activeTab === 'Completed' ? 'bg-green-600' :
                    activeTab === 'Active' ? 'bg-blue-600' : 'bg-amber-500'
                  }`}></div>
                  
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{job.title || 'Untitled Job'}</h3>
                        <p className="text-base text-gray-800 mt-1">{job.client?.name || 'Unknown Client'}</p>
                      </div>
                      <div className="bg-gray-100 rounded-lg px-2 py-1">
                        <p className="text-xs text-gray-600">
                          {formatCurrency(job.estimated_price || 0)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-3 text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <p className="text-sm">
                        {job.scheduled_time ? 
                          format(new Date(`2000-01-01T${job.scheduled_time}`), 'h:mm a') : 
                          'No time specified'}
                      </p>
                      
                      {job.address && (
                        <>
                          <span className="mx-1.5 text-gray-300">•</span>
                          <MapPin className="w-4 h-4 mr-1" />
                          <p className="text-sm truncate flex-1">{job.address}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TodaysAppointments; 