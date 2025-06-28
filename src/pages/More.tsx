import React from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  Megaphone,
  MessageSquare,
  CreditCard,
  Sparkles,
  Gift,
  HelpCircle,
  User,
  Users,
  Building2,
  Settings,
  LogOut,
  ChevronRight,
  Info,
  Clipboard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import { notificationService } from "@/lib/services/notificationService";

const More: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect is handled by AuthContext
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error(t('common:errorOccurred'));
    }
  };

  // Define discover items for the More page
  const moreDiscoverItems = [
    {
      title: "Apps & integrations",
      subtitle: "Connect your favorite tools and services",
      imageSrc: "https://i.postimg.cc/nLrhd0xY/image.png",
      link: "/integrations"
    },
    {
      title: "Marketing",
      subtitle: "Promote your business and grow your client base",
      imageSrc: "/placeholder.svg",
      link: "https://sweeplypro.com"
    }
  ];

  return (
    <AppLayout>
      <div className="bg-[#F5F7FA] flex flex-col">
        {/* Use PageHeader without the custom right element */}
        <PageHeader
          title="More"
          compact
        />

        <div className="px-4 pb-20 pt-2 flex-1 overflow-y-auto">
          {/* Feature Boxes - Using DiscoverCard style but smaller height */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {moreDiscoverItems.map((item, index) => (
              <Link 
                key={index}
                to={item.link}
                className="relative aspect-[4/3] rounded-xl overflow-hidden block group transition-transform duration-200 ease-in-out hover:scale-105"
              >
                {/* Background image with subtle zoom effect on hover */}
                <img 
                  src={item.imageSrc} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" 
                />
                
                {/* Dual gradient - from top and bottom for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/60"></div>
                
                {/* Title and subtitle at the top */}
                <div className="absolute top-0 left-0 pt-4 px-4 w-full">
                  <h3 className="text-white text-lg font-bold leading-tight mb-1 drop-shadow-sm">{item.title}</h3>
                  <p className="text-white/90 text-xs leading-tight max-w-[90%] drop-shadow-sm">{item.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Menu Lists */}
          <div className="mb-8">
            <div>
              {/* Tasks Link */}
              <Link 
                to="/tasks"
                className="flex items-center justify-between py-4 px-0 border-b border-gray-200"
              >
                <div className="flex items-center">
                  <Clipboard className="w-5 h-5 mr-4 text-[#0d3547]" />
                  <span className="text-[#0d3547] text-lg font-medium">Tasks</span>
                </div>
                <div className="text-gray-400">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </Link>

              {/* Removed Notifications Button */}
              <Link 
                to="/support"
                className="flex items-center justify-between py-4 px-0 border-b border-gray-200"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-4 text-[#0d3547]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.8 21H7.2C4.6 21 3 19.4 3 16.8V16.2C3 15.5373 3.53726 15 4.2 15H7.2C7.86274 15 8.4 15.5373 8.4 16.2V19.8C8.4 20.4627 7.86274 21 7.2 21" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.8 21H16.2C15.5373 21 15 20.4627 15 19.8V16.2C15 15.5373 15.5373 15 16.2 15H19.2C19.8627 15 20.4 15.5373 20.4 16.2V16.8C20.4 19.4 18.8 21 16.2 21" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.8 9H16.2C15.5373 9 15 8.46274 15 7.8V4.2C15 3.53726 15.5373 3 16.2 3H19.2C19.8627 3 20.4 3.53726 20.4 4.2V4.8C20.4 7.4 18.8 9 16.2 9" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.8 9H7.2C4.6 9 3 7.4 3 4.8V4.2C3 3.53726 3.53726 3 4.2 3H7.2C7.86274 3 8.4 3.53726 8.4 4.2V7.8C8.4 8.46274 7.86274 9 7.2 9" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[#0d3547] text-lg font-medium">{t('settings:support')}</span>
                </div>
                <div className="text-gray-400">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </Link>
              
              <Link 
                to="/subscription"
                className="flex items-center justify-between py-4 px-0 border-b border-gray-200"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-4 text-[#0d3547]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 10H22" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 15H10" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[#0d3547] text-lg font-medium">{t('settings:subscription')}</span>
                </div>
                <div className="text-gray-400">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </Link>
              
              <Link 
                to="/refer"
                className="flex items-center justify-between py-4 px-0 border-b border-gray-200"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-4 text-[#0d3547]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="8" width="18" height="12" rx="2" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V4M12 4H9M12 4H15" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 14L10 14" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[#0d3547] text-lg font-medium">{t('settings:referAFriend')}</span>
                </div>
                <div className="text-gray-400">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </Link>
              
              <Link 
                to="/about"
                className="flex items-center justify-between py-4 px-0 border-b border-gray-200"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-4 text-[#0d3547]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16V12" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="8" r="0.5" stroke="#0d3547" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[#0d3547] text-lg font-medium">{t('settings:about')}</span>
                </div>
                <div className="text-gray-400">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </Link>
            </div>
          </div>
          
          {/* Removed divider below About button */}
          
          {/* Second Menu List */}
          <div className="mb-6">
            <div>
              <Link 
                to="/profile"
                className="flex items-center justify-between py-4 px-0 border-b border-gray-200"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-4 text-[#0d3547]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.33788 17.3206C6.87887 15.5269 9.26788 14.5 11.9999 14.5C14.7319 14.5 17.1199 15.5259 18.6619 17.3198" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="10" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[#0d3547] text-lg font-medium">{t('settings:profile')}</span>
                </div>
                <div className="text-gray-400">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </Link>
              
              <Link 
                to="/team"
                className="flex items-center justify-between py-4 px-0 border-b border-gray-200"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-4 text-[#0d3547]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="7" r="3" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 10C15.6569 10 17 8.65685 17 7C17 5.34315 15.6569 4 14 4" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 19.5C5 16.4624 7.46243 14 10.5 14C13.5376 14 16 16.4624 16 19.5" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 20C19.2091 20 21 18.2091 21 16" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[#0d3547] text-lg font-medium">{t('settings:manageTeam')}</span>
                </div>
                <div className="text-gray-400">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </Link>
              
              <Link 
                to="/company"
                className="flex items-center justify-between py-4 px-0 border-b border-gray-200"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-4 text-[#0d3547]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="2" width="16" height="20" rx="2" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 6H15" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 10H15" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 14H15" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 18H13" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[#0d3547] text-lg font-medium">{t('settings:companyDetails')}</span>
                </div>
                <div className="text-gray-400">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </Link>
              
              <Link 
                to="/preferences"
                className="flex items-center justify-between py-4 px-0 border-b border-gray-200"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-4 text-[#0d3547]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 14C4 15.1046 4.89543 16 6 16H12C13.1046 16 14 15.1046 14 14V10C14 8.89543 13.1046 8 12 8H6C4.89543 8 4 8.89543 4 10V14Z" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 12H20C20 10.3431 18.6569 9 17 9H14V12Z" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 8V7C6 5.89543 6.89543 5 8 5H15C17.7614 5 20 7.23858 20 10V14" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 16V19" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 19H14" stroke="#0d3547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[#0d3547] text-lg font-medium">{t('settings:preferences')}</span>
                </div>
                <div className="text-gray-400">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </Link>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-gray-200 my-2"></div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center py-4 px-0 text-left border-b border-gray-200"
          >
            <svg className="w-5 h-5 mr-4 text-red-600" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 12L5 12" stroke="#E45D51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 16L5 12L9 8" stroke="#E45D51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 16V18C17 19.1046 16.1046 20 15 20H7C5.89543 20 5 19.1046 5 18V6C5 4.89543 5.89543 4 7 4H15C16.1046 4 17 4.89543 17 6V8" stroke="#E45D51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-red-600 text-lg font-medium">Logout</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default More; 