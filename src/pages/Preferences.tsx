import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";

const Preferences: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Notification preferences state
  const [notifications, setNotifications] = useState({
    todayWorkOverview: false,
    todayScheduleChanged: false,
    newRequest: false,
    newOnlineBooking: false,
    clientViewedQuote: false,
    clientApprovedQuote: false
  });

  // Toggle notification setting
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-white">
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
              Preferences
            </h1>
          </div>
        </div>

        <div className="px-4 pb-20 pt-5">
          {/* Push Notifications Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0d3547] mb-2">Push notifications</h2>
            <p className="text-gray-500 mb-6">Receive push notifications on your mobile or tablet devices</p>
            
            <div className="space-y-6">
              {/* Today's work overview */}
              <div className="flex items-center justify-between">
                <span className="text-lg text-[#0d3547]">Today's work overview</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.todayWorkOverview}
                    onChange={() => toggleNotification('todayWorkOverview')}
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pulse-500"></div>
                </label>
              </div>
              
              {/* Today's schedule changed */}
              <div className="flex items-center justify-between">
                <span className="text-lg text-[#0d3547]">Today's schedule changed</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.todayScheduleChanged}
                    onChange={() => toggleNotification('todayScheduleChanged')}
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pulse-500"></div>
                </label>
              </div>
              
              {/* New request */}
              <div className="flex items-center justify-between">
                <span className="text-lg text-[#0d3547]">New request</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.newRequest}
                    onChange={() => toggleNotification('newRequest')}
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pulse-500"></div>
                </label>
              </div>
              
              {/* New online booking */}
              <div className="flex items-center justify-between">
                <span className="text-lg text-[#0d3547]">New online booking</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.newOnlineBooking}
                    onChange={() => toggleNotification('newOnlineBooking')}
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pulse-500"></div>
                </label>
              </div>
              
              {/* Client viewed quote */}
              <div className="flex items-center justify-between">
                <span className="text-lg text-[#0d3547]">Client viewed quote</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.clientViewedQuote}
                    onChange={() => toggleNotification('clientViewedQuote')}
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pulse-500"></div>
                </label>
              </div>
              
              {/* Client approved quote */}
              <div className="flex items-center justify-between">
                <span className="text-lg text-[#0d3547]">Client approved quote</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.clientApprovedQuote}
                    onChange={() => toggleNotification('clientApprovedQuote')}
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pulse-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Preferences; 