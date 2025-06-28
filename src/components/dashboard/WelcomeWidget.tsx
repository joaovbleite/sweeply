import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Sparkles } from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import '@/pages/dashboard.css'; // Import dashboard-specific styles

const WelcomeWidget = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
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

  // Format today's date like "Wednesday, June 4th"
  const formattedDate = format(new Date(), "EEEE, MMMM do");
  
  // Unified header for both mobile and desktop
  return (
    <div className="dashboard-welcome-widget">
      <div className="sticky top-0 left-0 right-0 z-30 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-[#0d3547]/70 text-base">{formattedDate}</p>
          
          <div className="flex items-center gap-4">
            {/* Star Icon */}
            <Link to="/ai-chat" className="bg-transparent">
              <Sparkles className="w-5 h-5 text-[#0d3547]" />
            </Link>
            
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
      </div>
    </div>
  );
};

export default WelcomeWidget; 