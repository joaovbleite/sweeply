import React, { useRef } from 'react';
import { Plus, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface TodayScheduleSliderProps {
  hasJobs: boolean;
}

const TodayScheduleSlider: React.FC<TodayScheduleSliderProps> = ({ hasJobs }) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const sliderRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">{t('dashboard:todaysSchedule')}</h3>
        <Link 
          to="/calendar" 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          {t('dashboard:viewAll')}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      {/* Horizontal slider container with snap scrolling */}
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto gap-3 pb-4 px-1 snap-x snap-mandatory scrollbar-hide"
      >
        {/* First card: No visits scheduled today */}
        <div className="snap-start snap-always min-w-[85%] md:min-w-[280px] bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <p className="text-gray-700 text-lg font-medium">
            {t('dashboard:noVisitsScheduled')}
          </p>
        </div>
        
        {/* Second card: Schedule a New Job */}
        <div className="snap-start snap-always min-w-[85%] md:min-w-[280px] bg-white border border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <Link 
            to="/jobs/new"
            className="text-blue-600 hover:text-blue-700 flex items-center text-lg font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('dashboard:scheduleNewJob')}
          </Link>
        </div>
        
        {/* Third invisible card to show there's more to scroll */}
        <div className="snap-start snap-always min-w-[85%] md:min-w-[280px] opacity-0 pointer-events-none">
          <div className="w-full h-20"></div>
        </div>
      </div>
    </div>
  );
};

export default TodayScheduleSlider; 