import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  User, 
  DollarSign, 
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  CheckCircle,
  MapPin,
  Users,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay } from 'date-fns';
import { Job } from '@/types/job';

interface CalendarTimelineViewProps {
  jobs: Job[];
  currentDate: Date;
  onJobClick: (job: Job) => void;
  onDateChange: (date: Date) => void;
  darkMode?: boolean;
}

interface TimeSlot {
  hour: number;
  jobs: Job[];
}

const CalendarTimelineView: React.FC<CalendarTimelineViewProps> = ({
  jobs,
  currentDate,
  onJobClick,
  onDateChange,
  darkMode = false
}) => {
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);

  // Get week range
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filter jobs for current week
  const weekJobs = useMemo(() => {
    return jobs.filter(job => {
      const jobDate = new Date(job.scheduled_date);
      return jobDate >= weekStart && jobDate <= weekEnd;
    });
  }, [jobs, weekStart, weekEnd]);

  // Group jobs by day and hour
  const timelineData = useMemo(() => {
    const data: Record<string, Record<number, Job[]>> = {};
    
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      data[dayKey] = {};
      
      // Initialize hours (8 AM to 8 PM)
      for (let hour = 8; hour <= 20; hour++) {
        data[dayKey][hour] = [];
      }
    });

    weekJobs.forEach(job => {
      const dayKey = job.scheduled_date;
      if (!data[dayKey]) return;
      
      if (job.scheduled_time) {
        const hour = parseInt(job.scheduled_time.split(':')[0]);
        if (data[dayKey][hour]) {
          data[dayKey][hour].push(job);
        }
      }
    });

    return data;
  }, [weekJobs, weekDays]);

  // Calculate job position and height
  const getJobStyle = (job: Job) => {
    if (!job.scheduled_time) return {};
    
    const [hours, minutes] = job.scheduled_time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const duration = job.estimated_duration || 60;
    
    const top = ((startMinutes - 8 * 60) / 60) * 60; // 60px per hour
    const height = (duration / 60) * 60;
    
    return {
      top: `${top}px`,
      height: `${Math.max(height, 30)}px`, // Minimum height of 30px
    };
  };

  const getServiceTypeColor = (serviceType: string) => {
    const colors = {
      regular: 'bg-pulse-500',
      deep_clean: 'bg-blue-600',
      move_in: 'bg-blue-700',
      move_out: 'bg-blue-800',
      post_construction: 'bg-gray-700',
      one_time: 'bg-gray-500'
    };
    return colors[serviceType] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'cancelled':
        return <AlertCircle className="w-3 h-3" />;
      case 'in_progress':
        return <Activity className="w-3 h-3 animate-pulse" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = addDays(currentDate, direction === 'prev' ? -7 : 7);
    onDateChange(newDate);
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
      {/* Header */}
      <div className={`p-4 border-b ${darkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Timeline View</h3>
            
            {/* Week Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateWeek('prev')}
                className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </span>
              <button
                onClick={() => navigateWeek('next')}
                className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right side stats and controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {weekJobs.filter(job => job.scheduled_time).length} scheduled jobs
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pulse-500 rounded"></div>
            <span>{weekJobs.length} jobs this week</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="font-medium">
              ${weekJobs.reduce((sum, job) => sum + (job.estimated_price || 0), 0).toFixed(0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>
              {Math.round(weekJobs.reduce((sum, job) => sum + (job.estimated_duration || 60), 0) / 60)}h total
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex overflow-x-auto">
        {/* Time Labels */}
        <div className={`sticky left-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="h-12 border-b border-gray-200 dark:border-gray-700"></div>
          {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
            <div
              key={hour}
              className={`h-[60px] px-3 py-2 text-xs border-b ${
                darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
              } flex items-start`}
            >
              {format(new Date(2000, 0, 1, hour), 'h a')}
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {weekDays.map((day, dayIndex) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const isCurrentDay = isToday(day);
          const dayJobs = Object.values(timelineData[dayKey] || {}).flat();

          return (
            <div
              key={dayKey}
              className={`min-w-[180px] border-r ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              {/* Day Header */}
              <div className={`h-12 px-3 py-2 border-b sticky top-0 z-20 ${
                isCurrentDay
                  ? darkMode ? 'bg-pulse-900 text-pulse-200' : 'bg-pulse-100 text-pulse-700'
                  : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'
              } ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="font-medium text-sm">{format(day, 'EEE')}</div>
                <div className="text-xs">{format(day, 'MMM d')}</div>
              </div>

              {/* Hour Slots */}
              <div className="relative">
                {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
                  <div
                    key={hour}
                    className={`h-[60px] border-b ${
                      darkMode ? 'border-gray-800' : 'border-gray-100'
                    }`}
                  />
                ))}

                {/* Jobs */}
                {dayJobs.map(job => {
                  if (!job.scheduled_time) return null;
                  
                  const style = getJobStyle(job);
                  const isHovered = hoveredJob === job.id;

                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`absolute left-1 right-1 ${getServiceTypeColor(job.service_type)} 
                        text-white rounded-lg shadow-md cursor-pointer overflow-hidden
                        ${isHovered ? 'z-30 shadow-xl' : 'z-20'}`}
                      style={style}
                      onClick={() => onJobClick(job)}
                      onMouseEnter={() => setHoveredJob(job.id)}
                      onMouseLeave={() => setHoveredJob(null)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="p-2 h-full flex flex-col">
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs truncate">
                              {job.client?.name || 'Unknown'}
                            </div>
                            <div className="text-xs opacity-90 truncate">
                              {job.scheduled_time}
                            </div>
                          </div>
                          {getStatusIcon(job.status)}
                        </div>
                        
                        {(parseInt(style.height || '0') > 50) && (
                          <div className="mt-1 text-xs opacity-90">
                            <div className="truncate">{job.service_type.replace('_', ' ')}</div>
                            {job.estimated_price && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {job.estimated_price}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Hover Details */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-lg shadow-xl z-50 ${
                              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                            }`}
                            style={{ minWidth: '200px' }}
                          >
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">{job.client?.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <Clock className="w-3 h-3" />
                                {job.scheduled_time} ({job.estimated_duration || 60} min)
                              </div>
                              {job.address && (
                                <div className="flex items-start gap-2 text-xs">
                                  <MapPin className="w-3 h-3 mt-0.5" />
                                  <span className="line-clamp-2">{job.address}</span>
                                </div>
                              )}
                              {job.estimated_price && (
                                <div className="flex items-center gap-2 text-xs">
                                  <DollarSign className="w-3 h-3" />
                                  ${job.estimated_price}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Regular</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Deep Clean</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Move-in</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Move-out</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Post-Construction</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTimelineView; 