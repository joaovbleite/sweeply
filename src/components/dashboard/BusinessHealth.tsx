import React, { useState } from 'react';
import { ChevronRight, X, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';

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

  // Dashboard view - only show Job value and Visits scheduled
  const dashboardMetrics = [
    {
      title: t('dashboard:businessHealthCategories.jobs'),
      timeframe: t('dashboard:timeframes.thisWeek'),
      metrics: [
        { 
          label: t('dashboard:businessHealthMetrics.jobValue'), 
          value: "$0", 
          change: 0 
        }
      ]
    },
    {
      title: t('dashboard:businessHealthCategories.jobs'),
      timeframe: t('dashboard:timeframes.thisWeek'),
      metrics: [
        { 
          label: t('dashboard:businessHealthMetrics.visitsScheduled'), 
          value: "0", 
          change: 0 
        }
      ]
    }
  ];

  // Categories for the full view
  const businessCategories = [
    {
      title: t('dashboard:businessHealthCategories.clients'),
      timeframe: t('dashboard:timeframes.past30days'),
      metrics: [
        { label: t('dashboard:businessHealthMetrics.newLeads'), value: "0", change: 0 },
        { label: t('dashboard:businessHealthMetrics.newClients'), value: "0", change: 0 }
      ]
    },
    {
      title: t('dashboard:businessHealthCategories.quotes'),
      timeframe: t('dashboard:timeframes.past30days'),
      metrics: [
        { label: t('dashboard:businessHealthMetrics.conversionRate'), value: "0%", change: 0 },
        { label: t('dashboard:businessHealthMetrics.sent'), value: "$0", change: 0 },
        { label: t('dashboard:businessHealthMetrics.converted'), value: "$0", change: 0 }
      ]
    },
    {
      title: t('dashboard:businessHealthCategories.jobs'),
      timeframe: t('dashboard:timeframes.thisWeek'),
      metrics: [
        { label: t('dashboard:businessHealthMetrics.jobValue'), value: "$0", change: 0 },
        { label: t('dashboard:businessHealthMetrics.visitsScheduled'), value: "0", change: 0 }
      ]
    },
    {
      title: t('dashboard:businessHealthCategories.invoices'),
      timeframe: t('dashboard:timeframes.issuedPast30days'),
      metrics: [
        { label: t('dashboard:businessHealthMetrics.averageValue'), value: "$0", change: 0 },
        { label: t('dashboard:businessHealthMetrics.totalValue'), value: "$0", change: 0 }
      ]
    }
  ];

  const toggleFullView = () => {
    setShowFullView(!showFullView);
  };

  // Component for full-page view
  const FullHealthView = () => (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto pb-20">
      {/* Mobile-optimized header with safe area spacing */}
      <div className="sticky top-0 bg-white z-10 pt-safe">
        <div className="flex items-center px-4 py-4">
          <button 
            onClick={toggleFullView}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900 flex-1 text-center">
            {t('dashboard:businessHealth')}
          </h2>
          <div className="w-5"></div> {/* Empty space to balance the header */}
        </div>
      </div>

      {/* Full view content with safer padding */}
      <div className="px-4 pb-4">
        <div className="space-y-6">
          {businessCategories.map((category, idx) => (
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
                        {metric.value}
                      </span>
                      <div className="bg-gray-100 text-gray-500 rounded-full px-3 py-1">
                        <span className="text-sm">{metric.change}%</span>
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
            className="text-blue-600 font-medium text-sm flex items-center"
          >
            {t('dashboard:viewAll')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="space-y-8">
          {dashboardMetrics.map((item, idx) => (
            <div key={idx}>
              <div className="mb-2">
                {/* Only show the label for the first metric */}
                {idx === 0 && <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>}
                <p className="text-sm text-gray-500">{item.timeframe}</p>
              </div>
              
              <div className="space-y-4">
                {item.metrics.map((metric, midx) => (
                  <div key={midx} className="flex items-center justify-between">
                    <span className="text-gray-600">{metric.label}</span>
                    <div className="flex items-center">
                      <span className="text-gray-900 font-bold text-2xl mr-3">
                        {metric.value}
                      </span>
                      <div className="bg-gray-100 text-gray-500 rounded-full px-3 py-1">
                        <span className="text-sm">{metric.change}%</span>
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