import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";

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

  return (
    <AppLayout hideBottomNav>
      <div className="bg-white flex flex-col">
        {/* Use the new PageHeader component */}
        <PageHeader
          title="About"
          onBackClick={() => navigate(-1)}
          compact
        />

        <div className="px-4 pb-20 pt-7 flex-1 overflow-y-auto">
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
        </div>
    </div>
    </AppLayout>
  );
};

export default About;
