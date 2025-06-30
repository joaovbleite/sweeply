import React from 'react';
import { MessageCircle, AlertCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Job } from '@/types/job';

interface AppointmentCardProps {
  job: Job;
  hasMessages?: boolean;
  messageCount?: number;
  hasAlert?: boolean;
  distance?: string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  job,
  hasMessages = false,
  messageCount = 0,
  hasAlert = false,
  distance = ''
}) => {
  // Format arrival window (example: "6:30 - 7:30 PM")
  const formatArrivalWindow = () => {
    if (!job.arrival_window_start || !job.arrival_window_end) {
      return job.scheduled_time ? 
        `At ${format(new Date(`2000-01-01T${job.scheduled_time}`), 'h:mm a')}` : 
        'Arriving soon';
    }
    
    const startTime = format(new Date(`2000-01-01T${job.arrival_window_start}`), 'h:mm');
    const endTime = format(new Date(`2000-01-01T${job.arrival_window_end}`), 'h:mm a');
    return `Arriving ${startTime} – ${endTime}`;
  };

  return (
    <Link to={`/jobs/${job.id}`} className="block">
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col gap-2">
        {/* Top row with client name and icons */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-black">{job.client?.name || 'Unknown Client'}</h3>
            <p className="font-medium text-[15px] text-[#757575]">{job.title || job.service_type || 'Service'}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {hasMessages && (
              <div className="relative">
                <MessageCircle className="w-6 h-6" />
                {messageCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-[#D32F2F] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                    {messageCount}
                  </div>
                )}
              </div>
            )}
            
            {hasAlert && (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>
        </div>
        
        {/* Time and location information */}
        <div className="flex flex-col gap-1 mt-1">
          {/* Scheduled time / arrival window */}
          <p className="font-medium text-base text-[#1E7F1E]">{formatArrivalWindow()}</p>
          
          {/* Address and distance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#757575]" />
              <span className="font-medium text-base text-[#1A1A1A] truncate max-w-[200px]">
                {job.address || 'No address provided'}
              </span>
            </div>
            
            {distance && (
              <span className="font-medium text-base text-[#1A1A1A]">{distance}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AppointmentCard; 