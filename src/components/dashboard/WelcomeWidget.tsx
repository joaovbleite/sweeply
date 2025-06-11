import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Sparkles, Calendar, Clock, Sun, Cloud, CloudRain, Zap } from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import '@/pages/dashboard.css'; // Import dashboard-specific styles

const WelcomeWidget = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [weather, setWeather] = useState({ temp: '', condition: 'Clear', icon: Sun });
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const isMobile = useIsMobile();
  
  // Load unread notifications count
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await notificationsApi.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();

    // Subscribe to real-time updates
    if (user) {
      const subscription = notificationsApi.subscribeToNotifications(
        user.id,
        () => {
          // Reload count when new notification arrives
          loadUnreadCount();
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  // Simulate weather data - in a real app, you would fetch this from a weather API
  useEffect(() => {
    // Mock weather data
    const weatherConditions = [
      { temp: '72°F', condition: 'Sunny', icon: Sun },
      { temp: '68°F', condition: 'Cloudy', icon: Cloud },
      { temp: '65°F', condition: 'Rainy', icon: CloudRain },
      { temp: '70°F', condition: 'Stormy', icon: Zap }
    ];
    
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    setWeather(randomWeather);
  }, []);
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  // Format today's date like "Wednesday, June 4th"
  const formattedDate = format(new Date(), "EEEE, MMMM do");
  
  // Get current time
  const currentTime = format(new Date(), "h:mm a");

  // If mobile, render the original widget
  if (isMobile) {
    return (
      <div className="dashboard-welcome-widget">
        {/* Header with date and icons */}
        <div className="flex items-center justify-between mb-2 mt-2">
          <p className="text-[#0d3547]/70 text-base">{formattedDate}</p>
          
          <div className="flex items-center gap-4">
            {/* Star Icon */}
            <button className="bg-transparent">
              <Sparkles className="w-5 h-5 text-[#0d3547]" />
            </button>
            
            {/* Notifications Bell */}
            <Link 
              to="/notifications"
              className="relative bg-transparent"
            >
              <Bell className="w-5 h-5 text-[#0d3547]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
        
        {/* Greeting - smaller text size to fit on one line */}
        <h1 className="text-2xl font-bold text-[#0d3547] whitespace-nowrap overflow-hidden text-ellipsis">
          {getGreeting()}, {userName.split(' ')[0]}
        </h1>
      </div>
    );
  }

  // Enhanced desktop/laptop view
  return (
    <div className="py-6 px-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          {/* Date and Time */}
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
            <span className="mx-1">•</span>
            <Clock className="w-4 h-4" />
            <span>{currentTime}</span>
          </div>
          
          {/* Greeting */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {userName.split(' ')[0]}
          </h1>
          
          {/* Welcome message */}
          <p className="text-gray-600 max-w-lg">
            Welcome to your dashboard. You have {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}.
            Here's an overview of your business today.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Weather Widget */}
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center mb-1">
              <weather.icon className="w-6 h-6 text-blue-600 mr-2" />
              <span className="font-medium text-blue-700">{weather.temp}</span>
            </div>
            <p className="text-xs text-blue-600">{weather.condition}</p>
          </div>
          
          {/* Notifications */}
          <Link 
            to="/notifications"
            className="relative bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Bell className="w-6 h-6 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomeWidget; 