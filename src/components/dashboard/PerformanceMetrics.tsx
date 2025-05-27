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
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-display font-bold text-gray-900 mb-6">Performance Metrics</h2>
      <div className="space-y-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                    <p className="text-xs text-gray-500">{metric.trend}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">{metric.value}</span>
              </div>
              <Progress value={metric.progress} className="h-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PerformanceMetrics; 