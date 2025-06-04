import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { Link } from 'react-router-dom';

const BusinessHealth = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { formatCurrency } = useLocale();

  return (
    <div className="mb-12 px-1">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-gray-900">{t('dashboard:businessHealth')}</h2>
        <Link 
          to="/reports"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          {t('dashboard:viewAll')}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="space-y-1.5 rounded-lg overflow-hidden shadow-sm">
        {/* Job value */}
        <div className="bg-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-medium text-gray-700">{t('dashboard:businessHealthMetrics.jobValue')}</h3>
              <p className="text-xs text-gray-500">This week (Jun 1 - 7)</p>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900 mr-3">$0</span>
              <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">0%</span>
            </div>
          </div>
        </div>

        {/* Visits scheduled */}
        <div className="bg-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-medium text-gray-700">{t('dashboard:businessHealthMetrics.visitsScheduled')}</h3>
              <p className="text-xs text-gray-500">This week (Jun 1 - 7)</p>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900 mr-3">0</span>
              <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessHealth; 