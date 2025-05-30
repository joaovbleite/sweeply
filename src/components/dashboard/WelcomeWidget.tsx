import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Sparkles, TrendingUp, Target, Zap, Plus, Calendar, Users, Lightbulb, Bell } from 'lucide-react';
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

  // Random motivational quotes
  const quotes = [
    { text: "A clean space is a happy place!", icon: Sparkles },
    { text: "Building success one clean at a time", icon: TrendingUp },
    { text: "Your dedication makes homes shine", icon: Target },
    { text: "Excellence in every detail", icon: Zap }
  ];

  // Business tips that rotate daily
  const businessTips = [
    "💡 Follow up with clients 24 hours after service to ensure satisfaction",
    "💡 Offer package deals for recurring weekly or bi-weekly cleanings",
    "💡 Take before/after photos to showcase your quality work",
    "💡 Ask satisfied clients for referrals - word of mouth is powerful",
    "💡 Set aside 15 minutes each day to update your schedule",
    "💡 Seasonal deep cleaning services can boost your revenue",
    "💡 Professional photos for your portfolio attract premium clients"
  ];

  const todayQuote = quotes[new Date().getDay() % quotes.length];
  const todayTip = businessTips[new Date().getDate() % businessTips.length];
  const QuoteIcon = todayQuote.icon;

  return (
    <div className="bg-gradient-to-r from-pulse-500 to-blue-700 rounded-2xl p-4 sm:p-6 text-white shadow-xl relative">
      {/* Top right icons - adjusted for mobile */}
      <div className="absolute top-4 right-4 flex items-center gap-2 sm:gap-3">
        {/* Star Icon */}
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5 sm:p-2 hover:bg-white/30 transition-colors">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        
        {/* Notifications Bell */}
        <Link 
          to="/notifications"
          className="relative bg-white/20 backdrop-blur-sm rounded-full p-1.5 sm:p-2 hover:bg-white/30 transition-colors"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        
        {/* Profile Picture */}
        {userProfile?.avatar_url ? (
          <img 
            src={userProfile.avatar_url} 
            alt="Profile" 
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white/50 shadow-sm"
          />
        ) : (
          <div className="w-7 h-7 sm:w-9 sm:h-9 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div className="flex-1 pr-16 sm:pr-32">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 leading-tight">
            {getGreeting()}, {userName}! 👋
          </h2>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <QuoteIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <p className="text-sm sm:text-base md:text-lg opacity-90">{todayQuote.text}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <div>
              <p className="opacity-75">Today's Date</p>
              <p className="font-semibold">{new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-white/20"></div>
            <div>
              <p className="opacity-75">Current Time</p>
              <p className="font-semibold">{new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Business Tip */}
      <div className="border-t border-white/20 pt-3 sm:pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-between items-start">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link 
              to="/jobs/new" 
              className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all duration-200 backdrop-blur-sm text-xs sm:text-sm"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">New Job</span>
            </Link>
            <Link 
              to="/calendar" 
              className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all duration-200 backdrop-blur-sm text-xs sm:text-sm"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">Schedule</span>
            </Link>
            <Link 
              to="/clients" 
              className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all duration-200 backdrop-blur-sm text-xs sm:text-sm"
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">Clients</span>
            </Link>
          </div>

          {/* Daily Business Tip */}
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm w-full sm:w-auto mt-1 sm:mt-0">
            <Lightbulb className="w-4 h-4 min-w-4 text-yellow-300" />
            <span className="text-xs sm:text-sm opacity-90 line-clamp-2">{todayTip}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeWidget; 