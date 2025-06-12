import React from 'react';
import { MapPin, Globe } from 'lucide-react';

interface DashboardMapProps {
  jobs: Array<{
    id: string;
    title: string;
    address?: string;
    scheduled_date: string;
  }>;
  className?: string;
}

// This is a temporary simplified version until we can properly fix the mapbox-gl dependencies
const DashboardMap: React.FC<DashboardMapProps> = ({ jobs, className = '' }) => {
  // Filter jobs for today
  const today = new Date().toISOString().split('T')[0];
  const todaysJobs = jobs.filter(job => 
    job.scheduled_date === today && job.address
  ).slice(0, 5); // Show only first 5 jobs
  
  return (
    <div className={`relative rounded-xl overflow-hidden shadow-sm border border-gray-100 ${className}`} style={{ height: '350px' }}>
      <div className="absolute inset-0 bg-gray-100 flex flex-col">
        <div className="bg-white p-3 border-b border-gray-200">
          <div className="flex items-center justify-center gap-2">
            <Globe className="w-5 h-5 text-pulse-600" />
            <h3 className="font-medium text-gray-800">Today's Job Locations</h3>
          </div>
        </div>
        
        <div className="flex-1 p-4 flex flex-col justify-center items-center">
          {todaysJobs.length > 0 ? (
            <div className="w-full space-y-3 overflow-y-auto max-h-[250px] p-2">
              {todaysJobs.map(job => (
                <div 
                  key={job.id} 
                  className="bg-white rounded-lg shadow-sm p-3 flex items-start gap-3"
                >
                  <div className="text-pulse-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{job.title}</p>
                    <p className="text-sm text-gray-500 truncate">{job.address}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <MapPin className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p>No jobs scheduled for today</p>
            </div>
          )}
          
          <div className="mt-4 text-sm text-center text-gray-500">
            <p>Map view will be available soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMap; 