import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { format, startOfWeek, endOfWeek } from 'date-fns';

const BusinessHealthPage = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Lock the body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'hidden';
      
      // Scroll modal content to top
      const modalContent = document.getElementById('business-health-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
      
      return () => {
        // Unlock the body scroll when component unmounts
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-[60]">
      <PageHeader 
        title="Business health"
        onBackClick={onClose}
      />

      <div id="business-health-content" className="overflow-y-auto h-[calc(100vh-77px)] pb-20">
        {/* Clients Section */}
        <div className="px-4 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#1a2e35] mb-1">Clients</h2>
          <p className="text-gray-500 text-sm mb-4">Past 30 days</p>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-lg">New leads</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#1a2e35] text-2xl font-bold">3</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center text-sm">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  100%
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-lg">New clients</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#1a2e35] text-2xl font-bold">2</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center text-sm">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  100%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quotes Section */}
        <div className="px-4 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#1a2e35] mb-1">Quotes</h2>
          <p className="text-gray-500 text-sm mb-4">Past 30 days</p>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-lg">Conversion rate</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#1a2e35] text-2xl font-bold">0%</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full flex items-center text-sm">
                  0%
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-lg">Sent</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-lg font-medium mr-2">$0</span>
                <span className="text-[#1a2e35] text-2xl font-bold">0</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full flex items-center text-sm">
                  0%
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-lg">Converted</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-lg font-medium mr-2">$0</span>
                <span className="text-[#1a2e35] text-2xl font-bold">0</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full flex items-center text-sm">
                  0%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="px-4 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#1a2e35] mb-1">Jobs</h2>
          <p className="text-gray-500 text-sm mb-4">This week ({currentWeekRange})</p>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-lg">Job value</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#1a2e35] text-2xl font-bold">$200</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center text-sm">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  100%
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-lg">Visits scheduled</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#1a2e35] text-2xl font-bold">2</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center text-sm">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  100%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Section */}
        <div className="px-4 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#1a2e35] mb-1">Invoices</h2>
          <p className="text-gray-500 text-sm mb-4">Issued past 30 days</p>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-lg">Average value</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#1a2e35] text-2xl font-bold">$0</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full flex items-center text-sm">
                  0%
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-lg">Total value</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#1a2e35] text-2xl font-bold">$0</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full flex items-center text-sm">
                  0%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessHealth = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { formatCurrency } = useLocale();
  const [showFullPage, setShowFullPage] = useState(false);
  
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
    <>
      <div className="mb-12 px-1">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-900">{t('dashboard:businessHealth')}</h2>
          <button 
            onClick={() => setShowFullPage(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            {t('dashboard:viewAll')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
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

      {/* Full Page Business Health */}
      <BusinessHealthPage 
        isOpen={showFullPage} 
        onClose={() => setShowFullPage(false)} 
      />
    </>
  );
};

export default BusinessHealth; 