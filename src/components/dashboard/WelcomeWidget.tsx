import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Sparkles, TrendingUp, Target, Zap, Plus, Calendar, Users, Lightbulb, Bell, ClipboardCheck, DollarSign } from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications';

const WelcomeWidget = () => {
  const { user } = useAuth();
  const { userProfile } = useProfile();
  const [unreadCount, setUnreadCount] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  
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
  
  // Update tip every 5 minutes
  useEffect(() => {
    // Initial tip based on current minutes
    const minutes = new Date().getMinutes();
    setTipIndex(Math.floor(minutes / 5) % cleaningTips.length);
    
    // Set interval to check every minute if we need to change the tip
    const interval = setInterval(() => {
      const currentMinutes = new Date().getMinutes();
      const newTipIndex = Math.floor(currentMinutes / 5) % cleaningTips.length;
      if (newTipIndex !== tipIndex) {
        setTipIndex(newTipIndex);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [tipIndex]);
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  // Random motivational quotes
  const quotes = [
    { text: "Building success one clean at a time", icon: TrendingUp },
    { text: "Your dedication makes homes shine", icon: Target },
    { text: "Excellence in every detail", icon: Zap },
    { text: "Quality service brings lasting clients", icon: Sparkles }
  ];

  // Tips of the day for cleaners
  const cleaningTips = [
    "💡 Start cleaning from the top down - dust ceiling fans before sweeping floors",
    "💡 Microfiber cloths trap more dust than regular cloths and are reusable",
    "💡 Use vinegar and baking soda for tough stains and odors in bathrooms",
    "💡 Keep separate cloths for different areas (kitchen, bathroom) to prevent cross-contamination",
    "💡 Clean shower glass with a squeegee after each use to prevent hard water stains",
    "💡 Spray shower walls with diluted dish soap to prevent mildew between cleanings",
    "💡 Use a toothbrush for tight spaces like faucet bases and grout lines",
    "💡 Clean your vacuum filter regularly for maximum suction power",
    "💡 Always clean from cleanest to dirtiest areas to avoid spreading germs",
    "💡 Use a pillow case to dust ceiling fan blades without spreading dust",
    "💡 Lemons can naturally clean and deodorize cutting boards and garbage disposals",
    "💡 Wash your cleaning tools regularly for better performance"
  ];

  // Use the current day to select a quote
  const todayQuote = quotes[new Date().getDay() % quotes.length];
  const currentTip = cleaningTips[tipIndex];
  const QuoteIcon = todayQuote.icon;

  return (
    <div className="bg-gradient-to-r from-pulse-500 to-blue-700 rounded-none sm:rounded-xl md:rounded-2xl p-3 sm:p-5 md:p-6 text-white shadow-xl relative overflow-hidden mt-8 sm:mt-6 md:mt-4 -mx-4 sm:mx-0 w-[calc(100%+32px)] sm:w-auto">
      {/* Notification icons aligned with greeting */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
          {getGreeting()}, {userName.split(' ')[0]} <span className="inline-block">👋</span>
        </h2>
        
        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
          {/* Star Icon */}
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5 sm:p-2 md:p-2.5 hover:bg-white/30 transition-colors">
            <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
          </div>
          
          {/* Notifications Bell */}
          <Link 
            to="/notifications"
            className="relative bg-white/20 backdrop-blur-sm rounded-full p-1.5 sm:p-2 md:p-2.5 hover:bg-white/30 transition-colors"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[9px] sm:text-[10px] md:text-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="flex-1 pr-4 sm:pr-20 md:pr-32 mb-3 sm:mb-5 md:mb-6">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs md:text-sm mt-2">
          <div className="flex items-center gap-1.5">
            <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <div>
              <p className="opacity-75">Today's Tasks</p>
              <p className="font-semibold">2 Pending</p>
            </div>
          </div>
          <div className="h-6 w-px bg-white/20"></div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <div>
              <p className="opacity-75">Weekly Earnings</p>
              <p className="font-semibold">$180.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Tip of the Day */}
      <div className="border-t border-white/20 pt-2.5 sm:pt-3.5 md:pt-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-start">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2.5 md:gap-3 mt-0">
            <Link 
              to="/jobs/new" 
              className="bg-white/20 hover:bg-white/30 px-2.5 sm:px-3.5 md:px-4 py-1 sm:py-2 md:py-2.5 rounded-lg flex items-center gap-1 sm:gap-2 md:gap-2.5 transition-all duration-200 backdrop-blur-sm text-xs sm:text-sm md:text-base"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />
              <span className="font-medium">New Job</span>
            </Link>
            <Link 
              to="/calendar" 
              className="bg-white/20 hover:bg-white/30 px-2.5 sm:px-3.5 md:px-4 py-1 sm:py-2 md:py-2.5 rounded-lg flex items-center gap-1 sm:gap-2 md:gap-2.5 transition-all duration-200 backdrop-blur-sm text-xs sm:text-sm md:text-base"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />
              <span className="font-medium">Schedule</span>
            </Link>
            <Link 
              to="/clients" 
              className="bg-white/20 hover:bg-white/30 px-2.5 sm:px-3.5 md:px-4 py-1 sm:py-2 md:py-2.5 rounded-lg flex items-center gap-1 sm:gap-2 md:gap-2.5 transition-all duration-200 backdrop-blur-sm text-xs sm:text-sm md:text-base"
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />
              <span className="font-medium">Clients</span>
            </Link>
          </div>

          {/* Tip of the Day - updated every 5 minutes */}
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg backdrop-blur-sm w-full sm:w-auto mt-1.5 sm:mt-0">
            <Lightbulb className="w-3.5 h-3.5 min-w-[14px] text-yellow-300" />
            <div>
              <span className="text-[10px] sm:text-xs opacity-75 block">Tip of the day</span>
              <span className="text-xs sm:text-sm opacity-90 line-clamp-2">{currentTip}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeWidget; 