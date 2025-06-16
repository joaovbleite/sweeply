import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, ChevronDown, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/hooks/useLocale";
import { profileApi } from "@/lib/api/profile";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import { notificationService } from "@/lib/services/notificationService";

const Preferences: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preferences, refreshPreferences } = useLocale();
  
  // Track if any changes have been made
  const [hasChanges, setHasChanges] = useState(false);
  
  // Notification permission state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  
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
  const [isLoading, setIsLoading] = useState(false);

  // Check notification permission on load
  useEffect(() => {
    const checkPermission = async () => {
      if (notificationService.isPushNotificationSupported()) {
        setNotificationPermission(Notification.permission);
      } else {
        setNotificationPermission(null);
      }
    };
    
    checkPermission();
  }, []);

  // Load saved notification preferences
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      try {
        const profile = await profileApi.getProfile();
        if (profile?.push_notifications) {
          setNotifications(prev => ({
            ...prev,
            ...profile.push_notifications
          }));
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error);
      }
    };
    
    loadNotificationPreferences();
  }, []);

  // Effect to track changes
  useEffect(() => {
    const notificationChanged = Object.keys(notifications).some(
      (key) => notifications[key as keyof typeof notifications] !== false
    );
    
    const currencyChanged = selectedCurrency !== preferences.currency;
    
    setHasChanges(notificationChanged || currencyChanged);
  }, [notifications, selectedCurrency, preferences.currency]);

  // Toggle notification setting
  const toggleNotification = async (key: keyof typeof notifications) => {
    // If turning on notifications and permission is not granted, request it
    if (!notifications[key] && notificationPermission !== 'granted') {
      try {
        const permission = await notificationService.requestNotificationPermission();
        setNotificationPermission(permission);
        
        if (permission !== 'granted') {
          toast.error("Notification permission denied. Please enable notifications in your browser settings.");
          return;
        }
        
        // Subscribe to push notifications
        await notificationService.subscribeToPushNotifications();
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        toast.error("Failed to enable notifications");
        return;
      }
    }
    
    // Update the notification state
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle currency selection
  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    setShowCurrencyOptions(false);
  };

  // Save all changes
  const saveChanges = async () => {
    setIsLoading(true);
    try {
      // Save currency preference
      await profileApi.upsertProfile({
        currency: selectedCurrency
      });
      
      // Save notification settings
      await profileApi.upsertProfile({
        push_notifications: notifications
      });
      
      // If any notifications are enabled, make sure we have a subscription
      const hasEnabledNotifications = Object.values(notifications).some(value => value);
      if (hasEnabledNotifications && notificationPermission === 'granted') {
        await notificationService.subscribeToPushNotifications();
      }
      
      refreshPreferences();
      setHasChanges(false);
      toast.success("Preferences saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  // Create Apply button element
  const ApplyButton = hasChanges ? (
    <button
      onClick={saveChanges}
      disabled={isLoading}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center"
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      ) : (
        <Save className="w-4 h-4 mr-2" />
      )}
      Apply
    </button>
  ) : null;

  // Function to show notification status
  const getNotificationStatusText = () => {
    if (!notificationService.isPushNotificationSupported()) {
      return <span className="text-red-500 text-sm">Your browser doesn't support notifications</span>;
    }
    
    switch (notificationPermission) {
      case 'granted':
        return <span className="text-green-500 text-sm">Notifications enabled</span>;
      case 'denied':
        return <span className="text-red-500 text-sm">Notifications blocked in browser settings</span>;
      default:
        return <span className="text-gray-500 text-sm">Enable toggles to request notification permission</span>;
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Use the PageHeader component with Apply button */}
        <PageHeader
          title="Preferences"
          onBackClick={() => navigate(-1)}
          rightElement={ApplyButton}
          compact
        />

        <div className="px-4 pb-40 pt-5">
          {/* Currency Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0d3547] mb-2">Currency</h2>
            <p className="text-gray-500 mb-6">Select your preferred currency for the app</p>
            
            <div className="relative">
              <button 
                onClick={() => setShowCurrencyOptions(!showCurrencyOptions)} 
                className="w-full p-4 text-left text-lg bg-white border border-gray-200 rounded-lg shadow-sm flex justify-between items-center"
              >
                <span className="font-medium text-gray-900">
                  {currencies.find(c => c.code === selectedCurrency)?.label || selectedCurrency}
                </span>
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
                      <span className="font-medium text-gray-900">{currency.label}</span>
                      {selectedCurrency === currency.code && (
                        <Check className="w-5 h-5 text-blue-600" />
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
            <p className="text-gray-500 mb-4">Receive push notifications on your mobile or tablet devices</p>
            {getNotificationStatusText()}
            
            <div className="space-y-6 mt-6">
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
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
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
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
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
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
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
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
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
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
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
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Bottom fixed apply button for mobile - shown when there are changes */}
          {hasChanges && (
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-white shadow-lg border-t border-gray-200">
              <button 
                onClick={saveChanges}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Preferences; 