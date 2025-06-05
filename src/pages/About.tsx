import React from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";

const About: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get user's email safely
  const userEmail = user?.email || '';
  
  // Get current date and time
  const now = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formattedDate = now.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit', 
    year: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
  
  // Get device info
  const deviceInfo = `${navigator.platform} (${navigator.userAgent.includes('iPhone') ? 'iOS' : 
    navigator.userAgent.includes('Android') ? 'Android' : 'Web'} ${
    navigator.appVersion.match(/(?:Version|Chrome|Firefox|Safari|Edge)\/(\d+\.\d+)/)?.[1] || ''
  })`;

  // App version (simulated)
  const appVersion = "v1.0.0 (2000000123)";

  // Open links in system browser
  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AppLayout>
      <div className="bg-white flex flex-col">
        {/* Fixed header with shadow to cover content when scrolling */}
        <div className="sticky top-0 left-0 right-0 z-30 bg-white shadow-sm">
          <div className="flex items-center px-4 pt-12 pb-3 border-b border-gray-200">
            <button 
              onClick={() => navigate(-1)} 
              className="mr-2 text-gray-600"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-[#1a2e35]">
              About
            </h1>
          </div>
        </div>

        <div className="px-4 pb-20 pt-5 flex-1 overflow-y-auto">
          {/* Sweeply Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#0d3547] mb-4">Sweeply Information</h2>
            
            <div className="space-y-5">
              <div>
                <p className="text-gray-600">App version</p>
                <p className="text-[#0d3547] text-lg">{appVersion}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Email address</p>
                <p className="text-[#0d3547] text-lg">{userEmail}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Account time</p>
                <p className="text-[#0d3547] text-lg">{timeZone.replace('_', ' ')}</p>
                <p className="text-[#0d3547] text-lg">{formattedDate} at {formattedTime}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Device</p>
                <p className="text-[#0d3547] text-lg">{deviceInfo}</p>
              </div>
            </div>
          </div>
          
          {/* Legal Links */}
          <div className="mb-8">
            {/* Privacy Policy */}
            <button 
              onClick={() => openExternalLink('https://sweeply-landing.vercel.app/privacy')}
              className="w-full flex items-center justify-between py-5 border-b border-gray-200"
            >
              <div className="text-xl font-bold text-[#0d3547]">Privacy policy</div>
              <div className="text-pulse-500">
                <ExternalLink className="w-6 h-6" />
              </div>
            </button>
            
            {/* Terms of Service */}
            <button 
              onClick={() => openExternalLink('https://sweeply-landing.vercel.app/terms')}
              className="w-full flex items-center justify-between py-5 border-b border-gray-200"
            >
              <div className="text-xl font-bold text-[#0d3547]">Terms of service</div>
              <div className="text-pulse-500">
                <ExternalLink className="w-6 h-6" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default About;
