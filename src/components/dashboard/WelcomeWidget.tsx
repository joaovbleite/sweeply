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
    <div className="pt-6 pb-3 px-4 bg-white">
      {/* Date display */}
      <p className="text-[#0d3547]/70 text-lg mb-1">{formattedDate}</p>
      
      {/* Greeting with notification icons */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0d3547]">
          {getGreeting()}, {userName.split(' ')[0]}
        </h1>
        
        <div className="flex items-center gap-3">
          {/* Star Icon */}
          <button className="bg-transparent p-1">
            <Sparkles className="w-6 h-6 text-[#0d3547]" />
          </button>
          
          {/* Notifications Bell */}
          <Link 
            to="/notifications"
            className="relative bg-transparent p-1"
          >
            <Bell className="w-6 h-6 text-[#0d3547]" />
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