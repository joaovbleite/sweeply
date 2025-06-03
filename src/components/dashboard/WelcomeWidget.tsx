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
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  // Random motivational quotes - removed "A clean space is a happy place!"
  const quotes = [
    { text: "Building success one clean at a time", icon: TrendingUp },
    { text: "Your dedication makes homes shine", icon: Target },
    { text: "Excellence in every detail", icon: Zap },
    { text: "Quality service brings lasting clients", icon: Sparkles }
  ];

  // Business tips that rotate hourly
  const businessTips = [
    "💡 Set aside 15 minutes each day to update your schedule",
    "💡 Take before/after photos to showcase your quality work",
    "💡 Seasonal deep cleaning services can boost your revenue",
    "💡 Professional photos for your portfolio attract premium clients",
    "💡 Follow up with clients after service to ensure satisfaction",
    "💡 Bundle services to increase average job value",
    "💡 Consider eco-friendly products to attract conscious clients",
    "💡 Track cleaning supplies to optimize inventory costs"
  ];

  // Use the current hour to select a quote (changes daily)
  const todayQuote = quotes[new Date().getDay() % quotes.length];
  
  // Use the current hour to select a tip (changes hourly)
  const currentTip = businessTips[new Date().getHours() % businessTips.length];
  const QuoteIcon = todayQuote.icon;

  return (
    <div className="bg-gradient-to-r from-pulse-500 to-blue-700 rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 text-white shadow-xl relative overflow-hidden mt-4 sm:mt-4 md:mt-2">
      {/* Menu Icon - Removed */}
      
      {/* Top right icons */}
      <div className="absolute top-3 right-3 flex items-center gap-2 sm:gap-2.5 md:gap-3">
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
        
        {/* Profile Picture */}
        {userProfile?.avatar_url ? (
          <img 
            src={userProfile.avatar_url} 
            alt="Profile" 
            className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-white/50 shadow-sm"
          />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex items-start justify-between mb-3 sm:mb-5 md:mb-6 mt-8 sm:mt-0">
        <div className="flex-1 pr-14 sm:pr-20 md:pr-32">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1.5 md:mb-2 leading-tight">
            {getGreeting()}, {userName.split(' ')[0]} <span className="inline-block">👋</span>
          </h2>
          
          {/* Remove Today's Date and Current Time - already removed */}
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs md:text-sm">
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
      </div>

      {/* Quick Actions & Business Tip */}
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

          {/* Daily Business Tip - changed to hourly */}
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg backdrop-blur-sm w-full sm:w-auto mt-1.5 sm:mt-0">
            <Lightbulb className="w-3.5 h-3.5 min-w-[14px] text-yellow-300" />
            <span className="text-xs sm:text-sm md:text-base opacity-90 line-clamp-2">{currentTip}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeWidget; 