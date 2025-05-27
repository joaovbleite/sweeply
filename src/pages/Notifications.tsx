import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Mail
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import AppLayout from "@/components/AppLayout";

interface Notification {
  id: string;
  type: 'job' | 'payment' | 'client' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  icon?: React.ReactNode;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'job' | 'payment' | 'client' | 'system'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  // Mock notifications data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'job',
        title: 'New Job Scheduled',
        message: 'You have a new cleaning job scheduled for tomorrow at 2:00 PM for Sarah Johnson.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        priority: 'high',
        actionUrl: '/calendar',
        actionLabel: 'View Calendar',
        icon: <Briefcase className="w-5 h-5" />
      },
      {
        id: '2',
        type: 'payment',
        title: 'Payment Received',
        message: 'Payment of $250.00 has been received from John Doe for Invoice #INV-2024-0045.',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        read: false,
        priority: 'medium',
        actionUrl: '/invoices',
        actionLabel: 'View Invoice',
        icon: <DollarSign className="w-5 h-5" />
      },
      {
        id: '3',
        type: 'client',
        title: 'New Client Added',
        message: 'Emily Wilson has been added as a new client. Remember to schedule their initial consultation.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        priority: 'low',
        actionUrl: '/clients',
        actionLabel: 'View Client',
        icon: <UserPlus className="w-5 h-5" />
      },
      {
        id: '4',
        type: 'reminder',
        title: 'Job Reminder',
        message: 'Don\'t forget! You have a deep cleaning job at 123 Main St in 30 minutes.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        read: false,
        priority: 'high',
        actionUrl: '/jobs',
        actionLabel: 'View Job',
        icon: <Clock className="w-5 h-5" />
      },
      {
        id: '5',
        type: 'system',
        title: 'System Update',
        message: 'New features have been added to the calendar view. Check out the timeline and map views!',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: true,
        priority: 'low',
        actionUrl: '/calendar',
        actionLabel: 'Explore Features',
        icon: <Info className="w-5 h-5" />
      },
      {
        id: '6',
        type: 'payment',
        title: 'Invoice Overdue',
        message: 'Invoice #INV-2024-0042 for $180.00 is now 5 days overdue. Consider sending a reminder.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        read: false,
        priority: 'high',
        actionUrl: '/invoices',
        actionLabel: 'Send Reminder',
        icon: <AlertCircle className="w-5 h-5" />
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  // Mark as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast.success('All notifications marked as read');
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success('Notification deleted');
  };

  // Delete selected
  const deleteSelected = () => {
    setNotifications(prev => 
      prev.filter(notif => !selectedNotifications.has(notif.id))
    );
    setSelectedNotifications(new Set());
    toast.success(`${selectedNotifications.size} notifications deleted`);
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

  // Get icon color based on type
  const getIconColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-100';
    
    switch (type) {
      case 'job': return 'text-blue-600 bg-blue-100';
      case 'payment': return 'text-green-600 bg-green-100';
      case 'client': return 'text-purple-600 bg-purple-100';
      case 'reminder': return 'text-orange-600 bg-orange-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-8 h-8 text-pulse-500" />
                Notifications
              </h1>
              <p className="mt-1 text-gray-600">
                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <Link
              to="/settings"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notification Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {['all', 'unread', 'job', 'payment', 'client', 'system'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterType
                      ? 'bg-pulse-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  {filterType === 'unread' && unreadCount > 0 && (
                    <span className="ml-1">({unreadCount})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-2">
              {selectedNotifications.size > 0 ? (
                <>
                  <button
                    onClick={deleteSelected}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
                  >
                    Delete Selected ({selectedNotifications.size})
                  </button>
                  <button
                    onClick={() => setSelectedNotifications(new Set())}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                  >
                    Clear Selection
                  </button>
                </>
              ) : (
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark All as Read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
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
            filteredNotifications.map((notification) => (
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
                    {notification.icon}
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
                        {notification.actionUrl && (
                          <Link
                            to={notification.actionUrl}
                            onClick={() => markAsRead(notification.id)}
                            className="inline-flex items-center gap-1 mt-2 text-sm text-pulse-600 hover:text-pulse-700 font-medium"
                          >
                            {notification.actionLabel}
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>

                      {/* Actions Menu */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
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

        {/* Notification Settings Reminder */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6 text-center">
          <Mail className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">Manage your notification preferences</h3>
          <p className="text-sm text-gray-600 mb-3">
            Control which notifications you receive and how you receive them
          </p>
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 text-sm text-pulse-600 hover:text-pulse-700 font-medium"
          >
            Go to Settings
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default Notifications; 