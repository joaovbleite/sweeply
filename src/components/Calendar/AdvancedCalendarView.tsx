import React, { useState, useEffect, useMemo } from "react";
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
  MoreHorizontal,
  Repeat,
  Star,
  Zap,
  Target,
  TrendingUp,
  DollarSign,
  Route,
  Timer,
  Settings,
  Download,
  Search,
  Layers,
  BarChart3
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
  differenceInMinutes,
  addHours,
  getHours,
  getMinutes
} from "date-fns";

export type CalendarView = 'month' | 'week' | 'day' | 'timeline';

interface JobTemplate {
  id: string;
  name: string;
  service_type: ServiceType;
  estimated_duration: number;
  estimated_price: number;
  description: string;
  color: string;
}

interface AdvancedCalendarViewProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onDateClick: (date: Date) => void;
  onJobDrop: (jobId: string, newDate: string, newTime?: string) => void;
  loading?: boolean;
}

const AdvancedCalendarView: React.FC<AdvancedCalendarViewProps> = ({
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
  const [showRecurring, setShowRecurring] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [workingHours, setWorkingHours] = useState({ start: '08:00', end: '18:00' });
  const [maxJobsPerDay, setMaxJobsPerDay] = useState(8);
  const [showRevenue, setShowRevenue] = useState(false);
  const [calendarTheme, setCalendarTheme] = useState<'light' | 'dark' | 'colorful'>('light');

  // Job templates for quick scheduling
  const jobTemplates: JobTemplate[] = [
    {
      id: '1',
      name: 'Quick Regular Clean',
      service_type: 'regular',
      estimated_duration: 120,
      estimated_price: 120,
      description: 'Standard 2-hour cleaning',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'Deep Clean Package',
      service_type: 'deep_clean',
      estimated_duration: 240,
      estimated_price: 250,
      description: 'Comprehensive deep cleaning',
      color: 'bg-purple-500'
    },
    {
      id: '3',
      name: 'Move-in Special',
      service_type: 'move_in',
      estimated_duration: 180,
      estimated_price: 200,
      description: 'Move-in cleaning service',
      color: 'bg-green-500'
    }
  ];

  // Enhanced service type colors with theme support
  const getServiceTypeColor = (serviceType: ServiceType, theme: string = calendarTheme) => {
    const colors = {
      light: {
        regular: 'bg-blue-500',
        deep_clean: 'bg-purple-500',
        move_in: 'bg-green-500',
        move_out: 'bg-orange-500',
        post_construction: 'bg-red-500',
        one_time: 'bg-gray-500'
      },
      dark: {
        regular: 'bg-blue-600',
        deep_clean: 'bg-purple-600',
        move_in: 'bg-green-600',
        move_out: 'bg-orange-600',
        post_construction: 'bg-red-600',
        one_time: 'bg-gray-600'
      },
      colorful: {
        regular: 'bg-gradient-to-r from-blue-400 to-blue-600',
        deep_clean: 'bg-gradient-to-r from-purple-400 to-purple-600',
        move_in: 'bg-gradient-to-r from-green-400 to-green-600',
        move_out: 'bg-gradient-to-r from-orange-400 to-orange-600',
        post_construction: 'bg-gradient-to-r from-red-400 to-red-600',
        one_time: 'bg-gradient-to-r from-gray-400 to-gray-600'
      }
    };
    return colors[theme][serviceType] || colors[theme].regular;
  };

  // Get job priority
  const getJobPriority = (job: Job): 'high' | 'medium' | 'low' => {
    if (job.service_type === 'post_construction' || job.service_type === 'move_in') return 'high';
    if (job.service_type === 'deep_clean') return 'medium';
    return 'low';
  };

  // Get priority color
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'border-red-400 ring-red-200',
      medium: 'border-yellow-400 ring-yellow-200',
      low: 'border-green-400 ring-green-200'
    };
    return colors[priority];
  };

  // Filter jobs by selected criteria
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    if (selectedServiceTypes.length > 0) {
      filtered = filtered.filter(job => selectedServiceTypes.includes(job.service_type));
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(job => getJobPriority(job) === selectedPriority);
    }

    if (!showRecurring) {
      filtered = filtered.filter(job => !job.is_recurring);
    }

    return filtered;
  }, [jobs, selectedServiceTypes, selectedPriority, showRecurring]);

  // Get jobs for a specific date
  const getJobsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredJobs.filter(job => job.scheduled_date === dateStr);
  };

  // Calculate daily revenue
  const getDailyRevenue = (date: Date) => {
    const dayJobs = getJobsForDate(date);
    return dayJobs.reduce((total, job) => total + (job.estimated_price || 0), 0);
  };

  // Calculate daily workload
  const getDailyWorkload = (date: Date) => {
    const dayJobs = getJobsForDate(date);
    const totalMinutes = dayJobs.reduce((total, job) => total + (job.estimated_duration || 0), 0);
    return Math.round(totalMinutes / 60 * 10) / 10; // Hours with 1 decimal
  };

  // Check if day is overbooked
  const isDayOverbooked = (date: Date) => {
    const dayJobs = getJobsForDate(date);
    return dayJobs.length > maxJobsPerDay;
  };

  // Get suggested optimal scheduling
  const getOptimalTimeSlot = (date: Date, duration: number) => {
    const dayJobs = getJobsForDate(date);
    const workStart = parseISO(`2000-01-01T${workingHours.start}`);
    const workEnd = parseISO(`2000-01-01T${workingHours.end}`);
    
    // Find gaps in schedule
    const sortedJobs = dayJobs
      .filter(job => job.scheduled_time)
      .sort((a, b) => a.scheduled_time!.localeCompare(b.scheduled_time!));

    let currentTime = workStart;
    
    for (const job of sortedJobs) {
      const jobStart = parseISO(`2000-01-01T${job.scheduled_time}`);
      const gapMinutes = differenceInMinutes(jobStart, currentTime);
      
      if (gapMinutes >= duration) {
        return format(currentTime, 'HH:mm');
      }
      
      currentTime = addHours(jobStart, (job.estimated_duration || 60) / 60);
    }
    
    // Check if there's time at the end of the day
    const remainingMinutes = differenceInMinutes(workEnd, currentTime);
    if (remainingMinutes >= duration) {
      return format(currentTime, 'HH:mm');
    }
    
    return null;
  };

  // Enhanced job card with more information
  const renderEnhancedJobCard = (job: Job, isCompact = false, showDetails = true) => {
    const priority = getJobPriority(job);
    const conflicts = getTimeConflicts(new Date(job.scheduled_date));
    const hasConflict = conflicts.some(conflict => conflict.includes(job));
    
    return (
      <div
        key={job.id}
        draggable
        onDragStart={(e) => handleDragStart(e, job)}
        onClick={() => onJobClick(job)}
        className={`
          ${getServiceTypeColor(job.service_type)}
          ${getPriorityColor(priority)}
          ${isCompact ? 'p-2 text-xs' : 'p-3 text-sm'}
          ${hasConflict ? 'ring-2 ring-red-400' : 'ring-1'}
          ${draggedJob?.id === job.id ? 'opacity-50 scale-95' : ''}
          text-white rounded-lg cursor-move hover:opacity-90 transition-all duration-200 mb-2
          transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden
        `}
      >
        {/* Priority indicator */}
        {priority === 'high' && (
          <div className="absolute top-1 right-1">
            <Star className="w-3 h-3 text-yellow-300 fill-current" />
          </div>
        )}
        
        {/* Recurring indicator */}
        {job.is_recurring && (
          <div className="absolute top-1 left-1">
            <Repeat className="w-3 h-3 text-white opacity-75" />
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate flex items-center gap-1">
              {getStatusIcon(job.status)}
              {job.client?.name}
            </div>
            
            {showDetails && !isCompact && (
              <>
                <div className="text-xs opacity-90 truncate mt-1">
                  {job.title}
                </div>
                
                <div className="flex items-center gap-3 mt-2 text-xs opacity-90">
                  {job.scheduled_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(parseISO(`2000-01-01T${job.scheduled_time}`), 'h:mm a')}
                    </div>
                  )}
                  
                  {job.estimated_duration && (
                    <div className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {Math.round(job.estimated_duration / 60 * 10) / 10}h
                    </div>
                  )}
                  
                  {showRevenue && job.estimated_price && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${job.estimated_price}
                    </div>
                  )}
                </div>
                
                {job.address && (
                  <div className="text-xs opacity-75 truncate mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.address.split(',')[0]}
                  </div>
                )}
              </>
            )}
          </div>
          
          {hasConflict && (
            <AlertTriangle className="w-3 h-3 text-red-200 flex-shrink-0 ml-1" />
          )}
        </div>
        
        {/* Progress bar for job duration */}
        {!isCompact && job.scheduled_time && job.estimated_duration && (
          <div className="mt-2 bg-white bg-opacity-20 rounded-full h-1">
            <div 
              className="bg-white rounded-full h-1 transition-all duration-300"
              style={{ 
                width: `${Math.min((job.estimated_duration / 240) * 100, 100)}%` 
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // Month view renderer
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Month header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map(day => {
            const dayJobs = getJobsForDate(day);
            const revenue = getDailyRevenue(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isOverbooked = isDayOverbooked(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] border-r border-b p-2 ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                } ${isToday ? 'bg-blue-50' : ''} hover:bg-gray-50 cursor-pointer transition-colors`}
                onClick={() => onDateClick(day)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverDate(day);
                }}
                onDragLeave={() => setDragOverDate(null)}
                onDrop={(e) => handleDrop(e, day)}
              >
                {/* Day header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayJobs.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">{dayJobs.length}</span>
                      {isOverbooked && <AlertTriangle className="w-3 h-3 text-red-500" />}
                    </div>
                  )}
                </div>

                {/* Revenue indicator */}
                {showRevenue && revenue > 0 && (
                  <div className="text-xs text-green-600 mb-1">${revenue}</div>
                )}

                {/* Jobs */}
                <div className="space-y-1">
                  {dayJobs.slice(0, 3).map(job => (
                    <div
                      key={job.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobClick(job);
                      }}
                      className={`
                        ${getServiceTypeColor(job.service_type)}
                        text-white text-xs p-1 rounded cursor-move hover:opacity-90 transition-opacity
                        ${draggedJob?.id === job.id ? 'opacity-50' : ''}
                      `}
                    >
                      <div className="truncate font-medium">{job.client?.name}</div>
                      {job.scheduled_time && (
                        <div className="truncate opacity-90">
                          {format(parseISO(`2000-01-01T${job.scheduled_time}`), 'h:mm a')}
                        </div>
                      )}
                    </div>
                  ))}
                  {dayJobs.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayJobs.length - 3} more
                    </div>
                  )}
                </div>

                {/* Drop indicator */}
                {dragOverDate && isSameDay(dragOverDate, day) && (
                  <div className="absolute inset-0 bg-blue-200 bg-opacity-30 border-2 border-blue-400 border-dashed rounded" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week view renderer
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex">
          {/* Time column */}
          <div className="w-16 bg-gray-50 border-r">
            <div className="h-12 border-b"></div>
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b flex items-center justify-center text-xs text-gray-500">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
            ))}
          </div>

          {/* Days columns */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-full">
              {weekDays.map(day => {
                const dayJobs = getJobsForDate(day);
                const revenue = getDailyRevenue(day);
                const workload = getDailyWorkload(day);
                const isOverbooked = isDayOverbooked(day);

                return (
                  <div key={day.toISOString()} className="flex-1 min-w-[140px] border-r">
                    {/* Day header */}
                    <div className={`h-12 border-b p-2 ${isToday(day) ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <div className="text-sm font-medium">{format(day, 'EEE')}</div>
                      <div className="text-xs text-gray-600">
                        {format(day, 'MMM d')}
                        {isOverbooked && <span className="text-red-600 ml-1">⚠️</span>}
                      </div>
                    </div>

                    {/* Time slots */}
                    <div className="relative">
                      {hours.map(hour => (
                        <div
                          key={hour}
                          className="h-16 border-b hover:bg-gray-50 cursor-pointer relative"
                          onClick={() => onDateClick(day)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverDate(day);
                            setDragOverTime(`${hour.toString().padStart(2, '0')}:00`);
                          }}
                          onDragLeave={() => {
                            setDragOverDate(null);
                            setDragOverTime(null);
                          }}
                          onDrop={(e) => handleDrop(e, day, `${hour.toString().padStart(2, '0')}:00`)}
                        >
                          {/* Jobs in this time slot */}
                          {dayJobs
                            .filter(job => {
                              if (!job.scheduled_time) return false;
                              const jobHour = getHours(parseISO(`2000-01-01T${job.scheduled_time}`));
                              return jobHour === hour;
                            })
                            .map(job => (
                              <div
                                key={job.id}
                                className="absolute inset-x-1 top-1"
                                style={{
                                  height: job.estimated_duration ? `${Math.min((job.estimated_duration / 60) * 64, 60)}px` : '56px'
                                }}
                              >
                                {renderEnhancedJobCard(job, true, true)}
                              </div>
                            ))}

                          {/* Drop indicator */}
                          {dragOverDate && isSameDay(dragOverDate, day) && 
                           dragOverTime === `${hour.toString().padStart(2, '0')}:00` && (
                            <div className="absolute inset-1 bg-blue-200 bg-opacity-30 border border-blue-400 border-dashed rounded" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Day view renderer
  const renderDayView = () => {
    const dayJobs = getJobsForDate(currentDate);
    const hours = Array.from({ length: 16 }, (_, i) => i + 5); // 5 AM to 8 PM
    const revenue = getDailyRevenue(currentDate);
    const workload = getDailyWorkload(currentDate);

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Day header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
              <p className="text-sm text-gray-600">
                {dayJobs.length} jobs • {workload.toFixed(1)} hours
                {showRevenue && ` • $${revenue} revenue`}
              </p>
            </div>
            <button
              onClick={() => onDateClick(currentDate)}
              className="px-3 py-1 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors text-sm"
            >
              Add Job
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Time column */}
          <div className="w-20 bg-gray-50 border-r">
            {hours.map(hour => (
              <div key={hour} className="h-20 border-b flex items-center justify-center text-sm text-gray-500">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
            ))}
          </div>

          {/* Schedule column */}
          <div className="flex-1">
            {hours.map(hour => (
              <div
                key={hour}
                className="h-20 border-b hover:bg-gray-50 cursor-pointer relative p-2"
                onClick={() => onDateClick(currentDate)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverDate(currentDate);
                  setDragOverTime(`${hour.toString().padStart(2, '0')}:00`);
                }}
                onDragLeave={() => {
                  setDragOverDate(null);
                  setDragOverTime(null);
                }}
                onDrop={(e) => handleDrop(e, currentDate, `${hour.toString().padStart(2, '0')}:00`)}
              >
                {/* Jobs in this time slot */}
                {dayJobs
                  .filter(job => {
                    if (!job.scheduled_time) return false;
                    const jobHour = getHours(parseISO(`2000-01-01T${job.scheduled_time}`));
                    return jobHour === hour;
                  })
                  .map(job => (
                    <div key={job.id} className="mb-2">
                      {renderEnhancedJobCard(job, false, true)}
                    </div>
                  ))}

                {/* Drop indicator */}
                {dragOverDate && isSameDay(dragOverDate, currentDate) && 
                 dragOverTime === `${hour.toString().padStart(2, '0')}:00` && (
                  <div className="absolute inset-2 bg-blue-200 bg-opacity-30 border border-blue-400 border-dashed rounded" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Timeline view renderer
  const renderTimelineView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex">
          {/* Time column */}
          <div className="w-20 bg-gray-50 border-r">
            <div className="h-16 border-b flex items-center justify-center text-sm font-medium text-gray-600">
              Time
            </div>
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b flex items-center justify-center text-xs text-gray-500">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
            ))}
          </div>

          {/* Days columns */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-full">
              {weekDays.map(day => {
                const dayJobs = getJobsForDate(day);
                const revenue = getDailyRevenue(day);
                const workload = getDailyWorkload(day);
                const isOverbooked = isDayOverbooked(day);

                return (
                  <div key={day.toISOString()} className="flex-1 min-w-[200px] border-r">
                    {/* Day header */}
                    <div className={`h-16 border-b p-3 ${isToday(day) ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <div className="text-sm font-medium">{format(day, 'EEE, MMM d')}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {dayJobs.length} jobs • {workload}h
                        {showRevenue && ` • $${revenue}`}
                        {isOverbooked && <span className="text-red-600 ml-1">⚠️</span>}
                      </div>
                    </div>

                    {/* Time slots */}
                    <div className="relative">
                      {hours.map(hour => (
                        <div
                          key={hour}
                          className="h-16 border-b hover:bg-gray-50 cursor-pointer relative"
                          onClick={() => onDateClick(day)}
                        >
                          {/* Jobs in this time slot */}
                          {dayJobs
                            .filter(job => {
                              if (!job.scheduled_time) return false;
                              const jobHour = getHours(parseISO(`2000-01-01T${job.scheduled_time}`));
                              return jobHour === hour;
                            })
                            .map(job => (
                              <div
                                key={job.id}
                                className="absolute inset-x-1 top-1 bottom-1"
                                style={{
                                  height: job.estimated_duration ? `${Math.min((job.estimated_duration / 60) * 64, 64)}px` : '60px'
                                }}
                              >
                                {renderEnhancedJobCard(job, true, false)}
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper functions inside component
  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-300" />;
      case 'cancelled':
        return <XCircle className="w-3 h-3 text-red-300" />;
      case 'in_progress':
        return <Clock className="w-3 h-3 text-yellow-300" />;
      default:
        return null;
    }
  }

  function getTimeConflicts(date: Date) {
    // Implementation for conflict detection
    return [];
  }

  // Enhanced drag start implementation
  function handleDragStart(e: React.DragEvent, job: Job) {
    setDraggedJob(job);
    e.dataTransfer.setData('text/plain', job.id);
    e.dataTransfer.effectAllowed = 'move';
  }

  // Enhanced drop implementation
  function handleDrop(e: React.DragEvent, date: Date, time?: string) {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('text/plain');
    if (jobId && draggedJob) {
      const newDate = format(date, 'yyyy-MM-dd');
      onJobDrop(jobId, newDate, time);
    }
    setDraggedJob(null);
    setDragOverDate(null);
    setDragOverTime(null);
  }

  return (
    <div className={`space-y-6 ${calendarTheme === 'dark' ? 'dark' : ''}`}>
      {/* Enhanced Calendar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
                else if (view === 'week' || view === 'timeline') setCurrentDate(subWeeks(currentDate, 1));
                else setCurrentDate(addDays(currentDate, -1));
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {view === 'month' ? format(currentDate, 'MMMM yyyy') :
               view === 'week' || view === 'timeline' ? `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}` :
               format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            <button
              onClick={() => {
                if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
                else if (view === 'week' || view === 'timeline') setCurrentDate(addWeeks(currentDate, 1));
                else setCurrentDate(addDays(currentDate, 1));
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Advanced Controls */}
          <button
            onClick={() => setShowRevenue(!showRevenue)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1 ${
              showRevenue ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <DollarSign className="w-3 h-3" />
            Revenue
          </button>

          <button
            onClick={() => setShowConflicts(!showConflicts)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1 ${
              showConflicts ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Conflicts
          </button>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day', 'timeline'] as CalendarView[]).map(viewType => (
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

      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          {/* Service Type Filter */}
          <div className="flex flex-wrap gap-2">
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
                className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 ${
                  selectedServiceTypes.includes(serviceType)
                    ? `${getServiceTypeColor(serviceType)} text-white border-transparent shadow-sm`
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {serviceType.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as 'all' | 'high' | 'medium' | 'low')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Theme Selector */}
          <select
            value={calendarTheme}
            onChange={(e) => setCalendarTheme(e.target.value as 'light' | 'dark' | 'colorful')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
          >
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme</option>
            <option value="colorful">Colorful Theme</option>
          </select>
        </div>
      </div>

      {/* Calendar Content */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500"></div>
        </div>
      ) : (
        <div>
          {view === 'timeline' ? renderTimelineView() : 
           view === 'month' ? renderMonthView() :
           view === 'week' ? renderWeekView() :
           view === 'day' ? renderDayView() : renderMonthView()}
        </div>
      )}

      {/* Job Templates Quick Access */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Quick Templates
        </h4>
        <div className="flex flex-wrap gap-2">
          {jobTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => {
                // Handle template selection
                console.log('Template selected:', template);
              }}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors hover:shadow-md ${template.color} text-white`}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedCalendarView; 
 
 
 
 