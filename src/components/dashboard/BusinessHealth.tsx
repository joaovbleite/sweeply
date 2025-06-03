import React, { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface HealthMetric {
  label: string;
  value: string | number;
  currency?: boolean;
  percentage?: boolean;
  change?: number;
}

interface HealthCategory {
  title: string;
  timeframe: string;
  metrics: HealthMetric[];
}

const BusinessHealth = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { formatCurrency } = useLocale();
  const [showFullView, setShowFullView] = useState(false);

  // Generate dynamic date range for "This week"
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // End on Sunday
  const weekRange = `(${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')})`;

  // Sample data - in a real implementation, this would come from API
  const businessData: HealthCategory[] = [
    {
      title: t('dashboard:businessHealthCategories.clients'),
      timeframe: t('dashboard:timeframes.past30days'),
      metrics: [
        { label: t('dashboard:businessHealthMetrics.newLeads'), value: 3, change: 0 },
        { label: t('dashboard:businessHealthMetrics.newClients'), value: 1, change: -10 }
      ]
    },
    {
      title: t('dashboard:businessHealthCategories.quotes'),
      timeframe: t('dashboard:timeframes.past30days'),
      metrics: [
        { label: t('dashboard:businessHealthMetrics.conversionRate'), value: 33, percentage: true, change: 5 },
        { label: t('dashboard:businessHealthMetrics.sent'), value: 2450, currency: true, change: 15 },
        { label: t('dashboard:businessHealthMetrics.converted'), value: 850, currency: true, change: 20 }
      ]
    },
    {
      title: t('dashboard:businessHealthCategories.jobs'),
      timeframe: t('dashboard:timeframes.thisWeek') + ' ' + weekRange,
      metrics: [
        { label: t('dashboard:businessHealthMetrics.jobValue'), value: 1250, currency: true, change: 8 },
        { label: t('dashboard:businessHealthMetrics.visitsScheduled'), value: 4, change: 0 }
      ]
    },
    {
      title: t('dashboard:businessHealthCategories.invoices'),
      timeframe: t('dashboard:timeframes.issuedPast30days'),
      metrics: [
        { label: t('dashboard:businessHealthMetrics.averageValue'), value: 625, currency: true, change: 12 },
        { label: t('dashboard:businessHealthMetrics.totalValue'), value: 2500, currency: true, change: 15 }
      ]
    }
  ];

  // In full view, display all categories with all metrics
  // In compact view, just show one stat from each category
  const compactView = [
    { ...businessData[0], metrics: [businessData[0].metrics[0]] },
    { ...businessData[1], metrics: [businessData[1].metrics[0]] },
    { ...businessData[2], metrics: [businessData[2].metrics[0]] },
    { ...businessData[3], metrics: [businessData[3].metrics[1]] }
  ];

  const toggleFullView = () => {
    setShowFullView(!showFullView);
  };

  // Format the change percentage
  const formatChange = (change: number) => {
    if (change > 0) return `+${change}%`;
    if (change < 0) return `${change}%`;
    return `${change}%`;
  };

  // Component for full-page view
  const FullHealthView = () => (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto pb-20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('dashboard:businessHealth')}</h2>
          <button 
            onClick={toggleFullView}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Full view content */}
        <div className="space-y-6">
          {businessData.map((category, idx) => (
            <div key={idx} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="mb-2">
                <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                <p className="text-sm text-gray-500">{category.timeframe}</p>
              </div>
              
              <div className="space-y-4">
                {category.metrics.map((metric, midx) => (
                  <div key={midx} className="flex items-center justify-between">
                    <span className="text-gray-600 text-base">{metric.label}</span>
                    <div className="flex items-center">
                      <span className="text-gray-900 font-bold text-xl mr-3">
                        {metric.currency ? formatCurrency(Number(metric.value)) : 
                         metric.percentage ? `${metric.value}%` : 
                         metric.value}
                      </span>
                      <div className={cn(
                        "rounded-full px-3 py-1",
                        metric.change > 0 ? "bg-green-50 text-green-600" : 
                        metric.change < 0 ? "bg-red-50 text-red-600" : 
                        "bg-gray-100 text-gray-500"
                      )}>
                        <span className="text-sm">{formatChange(metric.change)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t('dashboard:businessHealth')}</h2>
          <button 
            onClick={toggleFullView}
            className="text-green-600 font-medium text-sm flex items-center"
          >
            {t('dashboard:viewAll')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="space-y-8">
          {compactView.map((category, idx) => (
            <div key={idx}>
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-900">{category.title}</h3>
                <p className="text-sm text-gray-500">{category.timeframe}</p>
              </div>
              
              <div className="space-y-4">
                {category.metrics.map((metric, midx) => (
                  <div key={midx} className="flex items-center justify-between">
                    <span className="text-gray-600">{metric.label}</span>
                    <div className="flex items-center">
                      <span className="text-gray-900 font-bold text-2xl mr-3">
                        {metric.currency ? formatCurrency(Number(metric.value)) : 
                         metric.percentage ? `${metric.value}%` : 
                         metric.value}
                      </span>
                      <div className={cn(
                        "rounded-full px-3 py-1",
                        metric.change > 0 ? "bg-green-50 text-green-600" : 
                        metric.change < 0 ? "bg-red-50 text-red-600" : 
                        "bg-gray-100 text-gray-500"
                      )}>
                        <span className="text-sm">{formatChange(metric.change)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Render full view when showFullView is true */}
      {showFullView && <FullHealthView />}
    </>
  );
};

export default BusinessHealth; 