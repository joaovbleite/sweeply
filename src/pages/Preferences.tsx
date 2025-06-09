import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/hooks/useLocale";
import { profileApi } from "@/lib/api/profile";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";

const Preferences: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preferences, refreshPreferences } = useLocale();
  
  // Notification preferences state
  const [notifications, setNotifications] = useState({
    todayWorkOverview: false,
    todayScheduleChanged: false,
    newRequest: false,
    newOnlineBooking: false,
    clientViewedQuote: false,
    clientApprovedQuote: false
  });

  // Currency options
  const currencies = [
    { code: "USD", label: "US Dollar ($)" },
    { code: "EUR", label: "Euro (€)" },
    { code: "GBP", label: "British Pound (£)" },
    { code: "CAD", label: "Canadian Dollar (CA$)" },
    { code: "AUD", label: "Australian Dollar (A$)" },
    { code: "JPY", label: "Japanese Yen (¥)" },
  ];

  // State for currency selection
  const [selectedCurrency, setSelectedCurrency] = useState(preferences.currency);
  const [showCurrencyOptions, setShowCurrencyOptions] = useState(false);

  // Toggle notification setting
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle currency selection
  const handleCurrencyChange = async (currencyCode: string) => {
    try {
      await profileApi.upsertProfile({
        currency: currencyCode
      });
      setSelectedCurrency(currencyCode);
      setShowCurrencyOptions(false);
      refreshPreferences();
      toast.success("Currency updated successfully");
    } catch (error) {
      console.error("Error updating currency:", error);
      toast.error("Failed to update currency");
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Use the PageHeader component */}
        <PageHeader
          title="Preferences"
          onBackClick={() => navigate(-1)}
        />

        <div className="px-4 pb-20 pt-5">
          {/* Currency Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0d3547] mb-2">Currency</h2>
            <p className="text-gray-500 mb-6">Select your preferred currency for the app</p>
            
            <div className="relative">
              <button 
                onClick={() => setShowCurrencyOptions(!showCurrencyOptions)} 
                className="w-full p-4 text-left text-lg bg-white border border-gray-200 rounded-lg shadow-sm flex justify-between items-center"
              >
                <span>{currencies.find(c => c.code === selectedCurrency)?.label || selectedCurrency}</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showCurrencyOptions ? 'rotate-180' : ''}`} />
              </button>
              
              {showCurrencyOptions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {currencies.map(currency => (
                    <button
                      key={currency.code}
                      onClick={() => handleCurrencyChange(currency.code)}
                      className="w-full p-4 text-left hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span>{currency.label}</span>
                      {selectedCurrency === currency.code && (
                        <Check className="w-5 h-5 text-[#307842]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

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