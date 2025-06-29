import React, { useMemo } from 'react';
import { ChevronRight, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { Link } from 'react-router-dom';
import { format, startOfWeek, endOfWeek } from 'date-fns';

const BusinessHealthWidget: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { formatCurrency } = useLocale();
  
  // Generate current week date range
  const currentWeekRange = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // 0 = Sunday
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
    
    const startFormatted = format(weekStart, 'MMM d');
    const endFormatted = format(weekEnd, 'MMM d');
    
    return `${startFormatted} - ${endFormatted}`;
  }, []);

  return (
    <div className="mb-12 px-1">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-gray-900">{t('dashboard:businessHealth')}</h2>
        <Link 
          to="/business-health"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          {t('dashboard:viewAll')}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div>
        {/* Job value */}
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-medium text-gray-700">{t('dashboard:businessHealthMetrics.jobValue')}</h3>
              <p className="text-xs text-gray-500">This week ({currentWeekRange})</p>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900 mr-3">$200</span>
              <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full flex items-center">
                <ArrowUp className="w-3 h-3 mr-1" />
                100%
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 mx-4" />

        {/* Visits scheduled */}
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-medium text-gray-700">{t('dashboard:businessHealthMetrics.visitsScheduled')}</h3>
              <p className="text-xs text-gray-500">This week ({currentWeekRange})</p>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900 mr-3">2</span>
              <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full flex items-center">
                <ArrowUp className="w-3 h-3 mr-1" />
                100%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessHealthWidget;
