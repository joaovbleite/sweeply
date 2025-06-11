import React from "react";
import { ArrowLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";

const Support: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="bg-white flex flex-col">
        {/* Use the new PageHeader component */}
        <PageHeader
          title="Support"
          onBackClick={() => navigate(-1)}
          compact
        />

        <div className="px-4 pb-40 pt-2 flex-1 overflow-y-auto">
          <div className="mb-8">
            {/* Support Chat */}
            <div className="flex items-center justify-between py-5 border-b border-gray-200">
              <div>
                <div className="text-xl font-bold text-[#0d3547]">Support chat</div>
                <div className="text-gray-600 mt-1">Get support from our team</div>
              </div>
              <div className="text-[#3B82F6]">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </div>
            
            {/* Help Center */}
            <div 
              className="flex items-center justify-between py-5 border-b border-gray-200"
              onClick={() => window.open('https://easyquote-nine.vercel.app/faq', '_blank')}
            >
              <div>
                <div className="text-xl font-bold text-[#0d3547]">Help Center</div>
                <div className="text-gray-600 mt-1">Read articles about every feature in Sweeply</div>
              </div>
              <div className="text-[#3B82F6]">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </div>
            
            {/* Share device diagnostics */}
            <div className="flex items-center justify-between py-5 border-b border-gray-200">
              <div>
                <div className="text-xl font-bold text-[#0d3547]">Share device diagnostics</div>
                <div className="text-gray-600 mt-1">Copy device diagnostics to your clipboard to share with support</div>
              </div>
              <div className="text-[#3B82F6]">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5H6C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V15" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15H18C19.1046 15 20 14.1046 20 13V7C20 5.89543 19.1046 5 18 5H12C10.8954 5 10 5.89543 10 7V13C10 14.1046 10.8954 15 12 15Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            {/* Share screen */}
            <div className="flex items-center justify-between py-5 border-b border-gray-200">
              <div>
                <div className="text-xl font-bold text-[#0d3547]">Share screen</div>
                <div className="text-gray-600 mt-1">Allow our support team to view your screen when troubleshooting</div>
              </div>
              <div className="text-[#3B82F6]">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="20" height="15" rx="2" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 19V21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 19V21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 21H17" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Support; 