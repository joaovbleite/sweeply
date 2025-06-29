import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import { format, startOfWeek, endOfWeek } from 'date-fns';

const BusinessHealth: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { formatCurrency } = useLocale();
  const navigate = useNavigate();
  
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
    <AppLayout>
      <PageHeader 
        title="Business health"
        onBackClick={() => navigate(-1)}
        compact
      />

      <div className="pb-24">
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
    </AppLayout>
  );
};

export default BusinessHealth;
