import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Bell, 
  Check, 
  X, 
  Calendar, 
  Users, 
  FileText, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Trash2,
  Filter,
  ChevronRight,
  Settings,
  MoreHorizontal,
  Briefcase,
  CreditCard,
  UserPlus,
  Mail,
  Package,
  ArrowLeft,
  SlidersHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import AppLayout from "@/components/AppLayout";
import { notificationsApi, Notification, NotificationFilters } from "@/lib/api/notifications";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | Notification['type']>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Main tabs to display (the 4 most important ones)
  const mainTabs = ['all', 'unread', 'job', 'client'] as const;
  
  // All available filters for the sidebar
  const allFilters = ['all', 'unread', 'job', 'payment', 'client', 'reminder', 'system', 'team'] as const;

  // Load notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const filters: NotificationFilters = {};
      if (filter === 'unread') {
        filters.read = false;
      } else if (filter !== 'all') {
        filters.type = filter as Notification['type'];
      }

      const data = await notificationsApi.getAll(filters);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const subscription = notificationsApi.subscribeToNotifications(
      user.id,
      (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        toast.info(newNotification.title, {
          description: newNotification.message,
          action: newNotification.action_url ? {
            label: newNotification.action_label || 'View',
            onClick: () => window.location.href = newNotification.action_url!
          } : undefined
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Handle click outside sidebar to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowFilterSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Delete selected
  const deleteSelected = async () => {
    try {
      await notificationsApi.deleteMultiple(Array.from(selectedNotifications));
      setNotifications(prev => 
        prev.filter(notif => !selectedNotifications.has(notif.id))
      );
      setSelectedNotifications(new Set());
      toast.success(`${selectedNotifications.size} notifications deleted`);
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast.error('Failed to delete notifications');
    }
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Get icon for notification type
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'job':
        return <Briefcase className="w-5 h-5" />;
      case 'payment':
        return <DollarSign className="w-5 h-5" />;
      case 'client':
        return <UserPlus className="w-5 h-5" />;
      case 'reminder':
        return <Clock className="w-5 h-5" />;
      case 'system':
        return <Info className="w-5 h-5" />;
      case 'team':
        return <Users className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Get icon color based on type and priority
  const getIconColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') return 'text-red-600 bg-red-100';
    
    switch (type) {
      case 'job': return 'text-blue-600 bg-blue-100';
      case 'payment': return 'text-green-600 bg-green-100';
      case 'client': return 'text-purple-600 bg-purple-100';
      case 'reminder': return 'text-orange-600 bg-orange-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      case 'team': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Custom right element for PageHeader
  const headerRightElement = (
    <button 
      onClick={() => setShowFilterSidebar(true)}
      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
    >
      <SlidersHorizontal className="w-5 h-5" />
    </button>
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pulse-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-white flex flex-col">
        {/* Use PageHeader with custom right element */}
        <PageHeader
          title="Notifications"
          onBackClick={() => navigate(-1)}
          rightElement={headerRightElement}
        />

        <div className="px-4 py-6 flex-1 overflow-y-auto">
          <p className="text-gray-600 mb-6">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>

        {/* Main tabs - limited to 4 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 hide-scrollbar">
          {mainTabs.map((tabType) => (
            <button
              key={tabType}
              onClick={() => setFilter(tabType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === tabType
                  ? 'bg-pulse-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tabType === 'all' ? 'All' : 
                tabType === 'unread' ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` : 
                tabType.charAt(0).toUpperCase() + tabType.slice(1)}
            </button>
          ))}
        </div>

        {/* Mark All as Read Button */}
        <div className="mb-6">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark All as Read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You're all caught up! Check back later for new updates."
                  : `No ${filter} notifications to display.`}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm p-4 transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-pulse-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                    className="mt-1 rounded border-gray-300 text-pulse-500 focus:ring-pulse-500"
                  />

                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${getIconColor(notification.type, notification.priority)}`}>
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold ${notification.read ? 'text-gray-900' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                        
                        {/* Action Button */}
                        {notification.action_url && (
                          <Link
                            to={notification.action_url}
                            onClick={() => markAsRead(notification.id)}
                            className="inline-flex items-center gap-1 mt-2 text-sm text-pulse-500 hover:text-pulse-600 font-medium"
                          >
                            {notification.action_label || 'View'}
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>

                      {/* Actions Menu */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                        
                        <div className="relative group">
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Check className="w-4 h-4" />
                                Mark as Read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Selected Button (when selections exist) */}
        {selectedNotifications.size > 0 && (
          <div className="mt-6">
            <div className="flex gap-2">
              <button
                onClick={deleteSelected}
                className="flex-1 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
              >
                Delete Selected ({selectedNotifications.size})
              </button>
              <button
                onClick={() => setSelectedNotifications(new Set())}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Notification Settings Reminder */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6 text-center">
          <Mail className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">Manage your notification preferences</h3>
          <p className="text-sm text-gray-600 mb-3">
            Control which notifications you receive and how you receive them
          </p>
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 text-sm text-pulse-500 hover:text-pulse-600 font-medium"
          >
            Go to Settings
            <ChevronRight className="w-4 h-4" />
          </Link>
          </div>
        </div>
      </div>

      {/* Filter Sidebar */}
      {showFilterSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-50 flex justify-end">
          <div 
            ref={sidebarRef}
            className="bg-white w-80 h-full shadow-xl animate-slide-in-right"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Notification Filters</h2>
              <button 
                onClick={() => setShowFilterSidebar(false)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="space-y-2">
                {allFilters.map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => {
                      setFilter(filterType);
                      setShowFilterSidebar(false);
                    }}
                    className={`w-full py-3 px-4 rounded-lg text-left text-sm font-medium transition-colors flex items-center justify-between ${
                      filter === filterType
                        ? 'bg-pulse-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {filterType === 'all' && <Bell className="w-4 h-4" />}
                      {filterType === 'unread' && <Mail className="w-4 h-4" />}
                      {filterType === 'job' && <Briefcase className="w-4 h-4" />}
                      {filterType === 'payment' && <DollarSign className="w-4 h-4" />}
                      {filterType === 'client' && <UserPlus className="w-4 h-4" />}
                      {filterType === 'reminder' && <Clock className="w-4 h-4" />}
                      {filterType === 'system' && <Info className="w-4 h-4" />}
                      {filterType === 'team' && <Users className="w-4 h-4" />}
                      {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    </span>
                    {filter === filterType && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Notifications; 