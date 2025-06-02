import React from 'react';
import { TrendingUp, Clock, Star, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Metric {
  label: string;
  value: string;
  progress: number;
  icon: React.ElementType;
  color: string;
  trend: string;
}

const PerformanceMetrics = () => {
  const metrics: Metric[] = [
    {
      label: 'Customer Satisfaction',
      value: '4.8/5',
      progress: 96,
      icon: Star,
      color: 'from-pulse-500 to-blue-600',
      trend: '+0.3 from last month'
    },
    {
      label: 'On-Time Completion',
      value: '98%',
      progress: 98,
      icon: Clock,
      color: 'from-blue-600 to-blue-700',
      trend: '+2% from last month'
    },
    {
      label: 'Job Success Rate',
      value: '99.5%',
      progress: 99.5,
      icon: CheckCircle,
      color: 'from-blue-700 to-blue-800',
      trend: 'Maintaining excellence'
    },
    {
      label: 'Growth Rate',
      value: '+24%',
      progress: 75,
      icon: TrendingUp,
      color: 'from-gray-600 to-gray-700',
      trend: 'YoY growth'
    }
  ];

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6">
      <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-gray-900 mb-2 sm:mb-4 md:mb-6">Performance Metrics</h2>
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="space-y-1 sm:space-y-1.5 md:space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                  <div className={`p-1 sm:p-1.5 md:p-2 rounded-lg bg-gradient-to-r ${metric.color}`}>
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 truncate">{metric.label}</p>
                    <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 truncate">{metric.trend}</p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm md:text-lg font-bold text-gray-900 ml-1 sm:ml-2">{metric.value}</span>
              </div>
              <Progress value={metric.progress} className="h-1 sm:h-1.5 md:h-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PerformanceMetrics; 