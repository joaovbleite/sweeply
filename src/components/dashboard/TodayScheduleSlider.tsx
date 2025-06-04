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
          className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
        >
          {t('dashboard:viewAll')}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      {/* Horizontal slider container with snap scrolling */}
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
      >
        {/* First card: No visits scheduled today */}
        <div className="snap-start snap-always min-w-[calc(100%-2rem)] md:min-w-[320px] bg-gray-50 border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <p className="text-gray-700 text-lg font-medium">
            {t('dashboard:noVisitsScheduled')}
          </p>
        </div>
        
        {/* Second card: Schedule a New Job */}
        <div className="snap-start snap-always min-w-[calc(100%-2rem)] md:min-w-[320px] bg-white border border-green-500 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <Link 
            to="/jobs/new"
            className="text-green-600 hover:text-green-700 flex items-center text-lg font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('dashboard:scheduleNewJob')}
          </Link>
        </div>
        
        {/* Third invisible card to show there's more to scroll */}
        <div className="snap-start snap-always min-w-[calc(100%-2rem)] md:min-w-[320px] opacity-0 pointer-events-none">
          <div className="w-full h-20"></div>
        </div>
      </div>
    </div>
  );
};

export default TodayScheduleSlider; 