import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal
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
  isToday,
  isBefore,
  isAfter,
  differenceInMinutes
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
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [dragOverTime, setDragOverTime] = useState<string | null>(null);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<ServiceType[]>([]);
  const [showConflicts, setShowConflicts] = useState(true);

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

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-3 h-3 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-3 h-3 text-yellow-600" />;
      default:
        return null;
    }
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

  // Check for time conflicts
  const getTimeConflicts = (date: Date) => {
    const dayJobs = getJobsForDate(date);
    const conflicts: Job[][] = [];
    
    for (let i = 0; i < dayJobs.length; i++) {
      for (let j = i + 1; j < dayJobs.length; j++) {
        const job1 = dayJobs[i];
        const job2 = dayJobs[j];
        
        if (job1.scheduled_time && job2.scheduled_time && job1.estimated_duration && job2.estimated_duration) {
          const start1 = parseISO(`2000-01-01T${job1.scheduled_time}`);
          const end1 = new Date(start1.getTime() + job1.estimated_duration * 60000);
          const start2 = parseISO(`2000-01-01T${job2.scheduled_time}`);
          const end2 = new Date(start2.getTime() + job2.estimated_duration * 60000);
          
          // Check for overlap
          if ((start1 < end2 && end1 > start2)) {
            conflicts.push([job1, job2]);
          }
        }
      }
    }
    
    return conflicts;
  };

  // Check if dropping would create a conflict
  const wouldCreateConflict = (date: Date, time: string, duration: number, excludeJobId?: string) => {
    const dayJobs = getJobsForDate(date).filter(job => job.id !== excludeJobId);
    
    if (!time || !duration) return false;
    
    const newStart = parseISO(`2000-01-01T${time}`);
    const newEnd = new Date(newStart.getTime() + duration * 60000);
    
    return dayJobs.some(job => {
      if (!job.scheduled_time || !job.estimated_duration) return false;
      
      const existingStart = parseISO(`2000-01-01T${job.scheduled_time}`);
      const existingEnd = new Date(existingStart.getTime() + job.estimated_duration * 60000);
      
      return (newStart < existingEnd && newEnd > existingStart);
    });
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
    e.dataTransfer.setData('text/plain', job.id);
    
    // Add visual feedback
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(5deg)';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (e: React.DragEvent, date?: Date, time?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (date) {
      setDragOverDate(date);
      setDragOverTime(time || null);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the calendar area
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverDate(null);
      setDragOverTime(null);
    }
  };

  const handleDrop = (e: React.DragEvent, date: Date, time?: string) => {
    e.preventDefault();
    if (draggedJob) {
      const newDateStr = format(date, 'yyyy-MM-dd');
      
      // Check for conflicts if time is specified
      if (time && draggedJob.estimated_duration) {
        const wouldConflict = wouldCreateConflict(date, time, draggedJob.estimated_duration, draggedJob.id);
        if (wouldConflict && !confirm('This will create a scheduling conflict. Continue anyway?')) {
          setDraggedJob(null);
          setDragOverDate(null);
          setDragOverTime(null);
          return;
        }
      }
      
      onJobDrop(draggedJob.id, newDateStr, time);
      setDraggedJob(null);
      setDragOverDate(null);
      setDragOverTime(null);
    }
  };

  // Render job card
  const renderJobCard = (job: Job, isCompact = false, showConflictIndicator = false) => {
    const conflicts = showConflictIndicator ? getTimeConflicts(new Date(job.scheduled_date)) : [];
    const hasConflict = conflicts.some(conflict => conflict.includes(job));
    
    return (
      <div
        key={job.id}
        draggable
        onDragStart={(e) => handleDragStart(e, job)}
        onClick={() => onJobClick(job)}
        className={`
          ${getServiceTypeColor(job.service_type)} 
          ${getStatusColor(job.status)}
          ${isCompact ? 'p-1 text-xs' : 'p-2 text-sm'}
          ${hasConflict ? 'ring-2 ring-red-400 ring-opacity-75' : ''}
          ${draggedJob?.id === job.id ? 'opacity-50' : ''}
          text-white rounded border-l-4 cursor-move hover:opacity-80 transition-all duration-200 mb-1
          transform hover:scale-105 shadow-sm hover:shadow-md
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate flex items-center gap-1">
              {getStatusIcon(job.status)}
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
                    {job.estimated_duration && (
                      <span className="ml-1">({job.estimated_duration}m)</span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          {hasConflict && showConflictIndicator && (
            <AlertTriangle className="w-3 h-3 text-red-200 flex-shrink-0 ml-1" />
          )}
        </div>
      </div>
    );
  };

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
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
        
        {/* Days */}
        {days.map(day => {
          const dayJobs = getJobsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const isPast = isBefore(day, startOfDay(new Date()));
          const conflicts = getTimeConflicts(day);
          const hasConflicts = conflicts.length > 0;
          const isDragOver = dragOverDate && isSameDay(dragOverDate, day);
          
          return (
            <div
              key={day.toISOString()}
              className={`
                bg-white min-h-[100px] sm:min-h-[120px] p-2 cursor-pointer transition-all duration-200
                ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
                ${isCurrentDay ? 'bg-blue-50 ring-2 ring-blue-200' : ''}
                ${isPast ? 'opacity-75' : ''}
                ${isDragOver ? 'bg-green-50 ring-2 ring-green-300' : 'hover:bg-gray-50'}
                ${hasConflicts && showConflicts ? 'border-l-4 border-red-400' : ''}
              `}
              onClick={() => onDateClick(day)}
              onDragOver={(e) => handleDragOver(e, day)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div className={`text-sm font-medium mb-1 flex items-center justify-between ${isCurrentDay ? 'text-blue-600' : ''}`}>
                <span>{format(day, 'd')}</span>
                {hasConflicts && showConflicts && (
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                )}
              </div>
              <div className="space-y-1">
                {dayJobs.slice(0, view === 'month' ? 2 : 3).map(job => 
                  renderJobCard(job, true, showConflicts)
                )}
                {dayJobs.length > (view === 'month' ? 2 : 3) && (
                  <div className="text-xs text-gray-500 text-center py-1 bg-gray-100 rounded">
                    +{dayJobs.length - (view === 'month' ? 2 : 3)} more
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
          {weekDays.map(day => {
            const dayJobs = getJobsForDate(day);
            const conflicts = getTimeConflicts(day);
            const hasConflicts = conflicts.length > 0;
            
            return (
              <div key={day.toISOString()} className={`bg-gray-50 p-3 text-center ${isToday(day) ? 'bg-blue-50' : ''}`}>
                <div className="text-sm font-medium">{format(day, 'EEE')}</div>
                <div className={`text-lg flex items-center justify-center gap-1 ${isToday(day) ? 'text-blue-600 font-bold' : ''}`}>
                  {format(day, 'd')}
                  {hasConflicts && showConflicts && (
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                  )}
                </div>
                <div className="text-xs text-gray-500">{dayJobs.length} jobs</div>
              </div>
            );
          })}
        </div>

        {/* Time slots */}
        <div className="grid grid-cols-8 gap-px bg-gray-200 flex-1 max-h-[600px] overflow-y-auto">
          {/* Hours column */}
          <div className="bg-white sticky left-0 z-10">
            {hours.map(hour => (
              <div key={hour} className="h-16 p-2 border-b border-gray-100 text-xs text-gray-500 flex items-center">
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
                const isDragOver = dragOverDate && isSameDay(dragOverDate, day) && dragOverTime === timeSlot;
                const wouldConflict = draggedJob && wouldCreateConflict(day, timeSlot, draggedJob.estimated_duration || 60, draggedJob.id);

                return (
                  <div
                    key={hour}
                    className={`
                      h-16 p-1 border-b border-gray-100 cursor-pointer transition-colors
                      ${isDragOver ? (wouldConflict ? 'bg-red-100' : 'bg-green-100') : 'hover:bg-gray-50'}
                    `}
                    onClick={() => onDateClick(day)}
                    onDragOver={(e) => handleDragOver(e, day, timeSlot)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day, timeSlot)}
                  >
                    {slotJobs.map(job => renderJobCard(job, true, showConflicts))}
                    {isDragOver && wouldConflict && (
                      <div className="text-xs text-red-600 bg-red-100 p-1 rounded">
                        Conflict!
                      </div>
                    )}
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
    const conflicts = getTimeConflicts(currentDate);

    return (
      <div className="bg-white rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
              <p className="text-sm text-gray-600">
                {dayJobs.length} jobs scheduled
                {conflicts.length > 0 && (
                  <span className="ml-2 text-red-600">• {conflicts.length} conflict(s)</span>
                )}
              </p>
            </div>
            {conflicts.length > 0 && showConflicts && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Conflicts detected</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="divide-y max-h-[600px] overflow-y-auto">
          {hours.map(hour => {
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
            const hourJobs = dayJobs.filter(job => 
              job.scheduled_time && job.scheduled_time.startsWith(hour.toString().padStart(2, '0'))
            );
            const isDragOver = dragOverDate && isSameDay(dragOverDate, currentDate) && dragOverTime === timeSlot;
            const wouldConflict = draggedJob && wouldCreateConflict(currentDate, timeSlot, draggedJob.estimated_duration || 60, draggedJob.id);

            return (
              <div
                key={hour}
                className={`
                  flex transition-colors
                  ${isDragOver ? (wouldConflict ? 'bg-red-50' : 'bg-green-50') : 'hover:bg-gray-50'}
                `}
                onClick={() => onDateClick(currentDate)}
                onDragOver={(e) => handleDragOver(e, currentDate, timeSlot)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, currentDate, timeSlot)}
              >
                <div className="w-20 p-4 text-sm text-gray-500 border-r flex items-center">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                <div className="flex-1 p-4 min-h-[60px] cursor-pointer">
                  {hourJobs.map(job => renderJobCard(job, false, showConflicts))}
                  {isDragOver && wouldConflict && (
                    <div className="text-sm text-red-600 bg-red-100 p-2 rounded border border-red-200">
                      <AlertTriangle className="w-4 h-4 inline mr-2" />
                      This would create a scheduling conflict
                    </div>
                  )}
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
          {/* Conflict Toggle */}
          <button
            onClick={() => setShowConflicts(!showConflicts)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1 ${
              showConflicts 
                ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Conflicts
          </button>

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
              px-3 py-1 text-xs rounded-full border transition-all duration-200
              ${selectedServiceTypes.includes(serviceType)
                ? `${getServiceTypeColor(serviceType)} text-white border-transparent shadow-sm`
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }
            `}
          >
            {serviceType.replace('_', ' ')}
          </button>
        ))}
        {selectedServiceTypes.length > 0 && (
          <button
            onClick={() => setSelectedServiceTypes([])}
            className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 underline"
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {(['regular', 'deep_clean', 'move_in', 'move_out', 'post_construction', 'one_time'] as ServiceType[]).map(serviceType => (
            <div key={serviceType} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${getServiceTypeColor(serviceType)}`}></div>
              <span className="text-xs text-gray-600 capitalize">
                {serviceType.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-xs text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-yellow-600" />
            <span className="text-xs text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-3 h-3 text-red-600" />
            <span className="text-xs text-gray-600">Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-gray-600">Conflict</span>
          </div>
        </div>
      </div>

      {/* Drag Instructions */}
      {draggedJob && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg z-50">
          <div className="text-sm font-medium">Dragging: {draggedJob.client?.name}</div>
          <div className="text-xs opacity-90">Drop on a date/time to reschedule</div>
        </div>
      )}
    </div>
  );
};

export default CalendarView; 