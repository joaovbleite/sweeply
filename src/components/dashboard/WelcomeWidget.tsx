import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Sparkles } from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications';
import { format } from 'date-fns';

const WelcomeWidget = () => {
  const { user } = useAuth();
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

  // Format today's date like "Wednesday, June 4th"
  const formattedDate = format(new Date(), "EEEE, MMMM do");

  return (
    <div className="pt-14 pb-3 px-4 bg-white">
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
};

export default WelcomeWidget; 