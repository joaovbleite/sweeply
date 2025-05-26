import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  User,
  MapPin
} from "lucide-react";
import { Job, ServiceType } from "@/types/job";
import { format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  startOfDay,
  addDays,
  parseISO,
  isToday
} from "date-fns";

export type CalendarView = 'month' | 'week' | 'day';

interface CalendarViewProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onDateClick: (date: Date) => void;
  onJobDrop: (jobId: string, newDate: string, newTime?: string) => void;
  loading?: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  jobs,
  onJobClick,
  onDateClick,
  onJobDrop,
  loading = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<ServiceType[]>([]);

  // Get service type color
  const getServiceTypeColor = (serviceType: ServiceType) => {
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

  // Get status color
  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'border-blue-400',
      in_progress: 'border-yellow-400',
      completed: 'border-green-400',
      cancelled: 'border-red-400'
    };
    return colors[status] || 'border-gray-400';
  };

  // Filter jobs by selected service types
  const filteredJobs = selectedServiceTypes.length > 0 
    ? jobs.filter(job => selectedServiceTypes.includes(job.service_type))
    : jobs;

  // Get jobs for a specific date
  const getJobsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredJobs.filter(job => job.scheduled_date === dateStr);
  };

  // Navigation functions
  const navigatePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const navigateNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar title
  const getCalendarTitle = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (view === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    } else {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, job: Job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: Date, time?: string) => {
    e.preventDefault();
    if (draggedJob) {
      const newDateStr = format(date, 'yyyy-MM-dd');
      onJobDrop(draggedJob.id, newDateStr, time);
      setDraggedJob(null);
    }
  };

  // Render job card
  const renderJobCard = (job: Job, isCompact = false) => (
    <div
      key={job.id}
      draggable
      onDragStart={(e) => handleDragStart(e, job)}
      onClick={() => onJobClick(job)}
      className={`
        ${getServiceTypeColor(job.service_type)} 
        ${getStatusColor(job.status)}
        ${isCompact ? 'p-1 text-xs' : 'p-2 text-sm'}
        text-white rounded border-l-4 cursor-pointer hover:opacity-80 transition-opacity mb-1
      `}
    >
      <div className="font-medium truncate">
        {job.client?.name}
      </div>
      {!isCompact && (
        <>
          <div className="text-xs opacity-90 truncate">
            {job.title}
          </div>
          {job.scheduled_time && (
            <div className="text-xs opacity-90 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(parseISO(`2000-01-01T${job.scheduled_time}`), 'h:mm a')}
            </div>
          )}
        </>
      )}
    </div>
  );

  // Render month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
        
        {/* Days */}
        {days.map(day => {
          const dayJobs = getJobsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={`
                bg-white min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 transition-colors
                ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
                ${isCurrentDay ? 'bg-blue-50' : ''}
              `}
              onClick={() => onDateClick(day)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-blue-600' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayJobs.slice(0, 3).map(job => renderJobCard(job, true))}
                {dayJobs.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayJobs.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
          <div className="bg-gray-50 p-3"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className={`bg-gray-50 p-3 text-center ${isToday(day) ? 'bg-blue-50' : ''}`}>
              <div className="text-sm font-medium">{format(day, 'EEE')}</div>
              <div className={`text-lg ${isToday(day) ? 'text-blue-600 font-bold' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="grid grid-cols-8 gap-px bg-gray-200 flex-1">
          {/* Hours column */}
          <div className="bg-white">
            {hours.map(hour => (
              <div key={hour} className="h-16 p-2 border-b border-gray-100 text-xs text-gray-500">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map(day => (
            <div key={day.toISOString()} className="bg-white">
              {hours.map(hour => {
                const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                const slotJobs = getJobsForDate(day).filter(job => 
                  job.scheduled_time && job.scheduled_time.startsWith(hour.toString().padStart(2, '0'))
                );

                return (
                  <div
                    key={hour}
                    className="h-16 p-1 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onDateClick(day)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day, timeSlot)}
                  >
                    {slotJobs.map(job => renderJobCard(job, true))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayJobs = getJobsForDate(currentDate);

    return (
      <div className="bg-white rounded-lg">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
          <p className="text-sm text-gray-600">{dayJobs.length} jobs scheduled</p>
        </div>
        
        <div className="divide-y">
          {hours.map(hour => {
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
            const hourJobs = dayJobs.filter(job => 
              job.scheduled_time && job.scheduled_time.startsWith(hour.toString().padStart(2, '0'))
            );

            return (
              <div
                key={hour}
                className="flex hover:bg-gray-50 cursor-pointer"
                onClick={() => onDateClick(currentDate)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, currentDate, timeSlot)}
              >
                <div className="w-20 p-4 text-sm text-gray-500 border-r">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                <div className="flex-1 p-4 min-h-[60px]">
                  {hourJobs.map(job => renderJobCard(job))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={navigatePrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {getCalendarTitle()}
            </h2>
            <button
              onClick={navigateNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as CalendarView[]).map(viewType => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-1 text-sm rounded transition-colors capitalize ${
                  view === viewType 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {viewType}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Service Type Filter */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700">Filter by service:</span>
        {(['regular', 'deep_clean', 'move_in', 'move_out', 'post_construction', 'one_time'] as ServiceType[]).map(serviceType => (
          <button
            key={serviceType}
            onClick={() => {
              setSelectedServiceTypes(prev => 
                prev.includes(serviceType) 
                  ? prev.filter(t => t !== serviceType)
                  : [...prev, serviceType]
              );
            }}
            className={`
              px-3 py-1 text-xs rounded-full border transition-colors
              ${selectedServiceTypes.includes(serviceType)
                ? `${getServiceTypeColor(serviceType)} text-white border-transparent`
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {serviceType.replace('_', ' ')}
          </button>
        ))}
        {selectedServiceTypes.length > 0 && (
          <button
            onClick={() => setSelectedServiceTypes([])}
            className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Calendar Content */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(['regular', 'deep_clean', 'move_in', 'move_out', 'post_construction', 'one_time'] as ServiceType[]).map(serviceType => (
            <div key={serviceType} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${getServiceTypeColor(serviceType)}`}></div>
              <span className="text-xs text-gray-600 capitalize">
                {serviceType.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView; 