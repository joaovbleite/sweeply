import React, { useMemo } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from "lucide-react";
import { Job } from "@/types/job";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";

interface CalendarAnalyticsProps {
  jobs: Job[];
  currentDate: Date;
  view: 'week' | 'month';
}

const CalendarAnalytics: React.FC<CalendarAnalyticsProps> = ({
  jobs,
  currentDate,
  view
}) => {
  // Calculate analytics data
  const analytics = useMemo(() => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    // Filter jobs for current period
    const periodJobs = jobs.filter(job => {
      const jobDate = new Date(job.scheduled_date);
      return jobDate >= weekStart && jobDate <= weekEnd;
    });

    // Revenue calculations
    const totalRevenue = periodJobs.reduce((sum, job) => sum + (job.estimated_price || 0), 0);
    const completedRevenue = periodJobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => sum + (job.estimated_price || 0), 0);
    
    // Time calculations
    const totalHours = periodJobs.reduce((sum, job) => sum + (job.estimated_duration || 0), 0) / 60;
    const completedHours = periodJobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => sum + (job.estimated_duration || 0), 0) / 60;

    // Job status breakdown
    const statusBreakdown = {
      scheduled: periodJobs.filter(job => job.status === 'scheduled').length,
      in_progress: periodJobs.filter(job => job.status === 'in_progress').length,
      completed: periodJobs.filter(job => job.status === 'completed').length,
      cancelled: periodJobs.filter(job => job.status === 'cancelled').length
    };

    // Service type breakdown
    const serviceBreakdown = periodJobs.reduce((acc, job) => {
      acc[job.service_type] = (acc[job.service_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Daily breakdown
    const dailyBreakdown = weekDays.map(day => {
      const dayJobs = periodJobs.filter(job => isSameDay(new Date(job.scheduled_date), day));
      return {
        date: day,
        jobs: dayJobs.length,
        revenue: dayJobs.reduce((sum, job) => sum + (job.estimated_price || 0), 0),
        hours: dayJobs.reduce((sum, job) => sum + (job.estimated_duration || 0), 0) / 60,
        completed: dayJobs.filter(job => job.status === 'completed').length
      };
    });

    // Performance metrics
    const completionRate = periodJobs.length > 0 ? (statusBreakdown.completed / periodJobs.length) * 100 : 0;
    const averageJobValue = periodJobs.length > 0 ? totalRevenue / periodJobs.length : 0;
    const utilizationRate = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;

    // Conflicts and issues
    const conflicts = periodJobs.filter(job => {
      const jobDate = job.scheduled_date;
      const sameTimeJobs = periodJobs.filter(j => 
        j.scheduled_date === jobDate && 
        j.scheduled_time === job.scheduled_time && 
        j.id !== job.id
      );
      return sameTimeJobs.length > 0;
    }).length;

    return {
      totalRevenue,
      completedRevenue,
      totalHours,
      completedHours,
      totalJobs: periodJobs.length,
      statusBreakdown,
      serviceBreakdown,
      dailyBreakdown,
      completionRate,
      averageJobValue,
      utilizationRate,
      conflicts
    };
  }, [jobs, currentDate]);

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

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.totalRevenue.toFixed(0)}</p>
              <p className="text-xs text-green-600 mt-1">
                ${analytics.completedRevenue.toFixed(0)} completed
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalJobs}</p>
              <p className="text-xs text-blue-600 mt-1">
                {analytics.statusBreakdown.completed} completed
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalHours.toFixed(1)}</p>
              <p className="text-xs text-purple-600 mt-1">
                {analytics.completedHours.toFixed(1)} completed
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.completionRate.toFixed(1)}%</p>
              <p className="text-xs text-orange-600 mt-1">
                {analytics.conflicts} conflicts
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Performance Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Daily Performance
          </h3>
          
          <div className="space-y-3">
            {analytics.dailyBreakdown.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {format(day.date, 'EEE')}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pulse-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((day.jobs / 8) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{day.jobs} jobs</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${day.revenue}</p>
                  <p className="text-xs text-gray-500">{day.hours.toFixed(1)}h</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Type Breakdown */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Service Breakdown
          </h3>
          
          <div className="space-y-3">
            {Object.entries(analytics.serviceBreakdown).map(([service, count]) => (
              <div key={service} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getServiceTypeColor(service)}`} />
                  <span className="text-sm text-gray-700 capitalize">
                    {service.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getServiceTypeColor(service)}`}
                      style={{ width: `${(count / analytics.totalJobs) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Job Status Overview
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{analytics.statusBreakdown.scheduled}</p>
            <p className="text-sm text-blue-700">Scheduled</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{analytics.statusBreakdown.in_progress}</p>
            <p className="text-sm text-yellow-700">In Progress</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{analytics.statusBreakdown.completed}</p>
            <p className="text-sm text-green-700">Completed</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{analytics.statusBreakdown.cancelled}</p>
            <p className="text-sm text-red-700">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Performance Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-pulse-600 mb-2">
              ${analytics.averageJobValue.toFixed(0)}
            </div>
            <p className="text-sm text-gray-600">Average Job Value</p>
            <div className="mt-2 text-xs text-gray-500">
              {analytics.averageJobValue > 150 ? '↗️ Above target' : '↘️ Below target'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analytics.utilizationRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Time Utilization</p>
            <div className="mt-2 text-xs text-gray-500">
              {analytics.utilizationRate > 80 ? '🎯 Excellent' : '⚡ Room for improvement'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {analytics.conflicts}
            </div>
            <p className="text-sm text-gray-600">Scheduling Conflicts</p>
            <div className="mt-2 text-xs text-gray-500">
              {analytics.conflicts === 0 ? '✅ Perfect schedule' : '⚠️ Needs attention'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarAnalytics; 
 
 
 
 