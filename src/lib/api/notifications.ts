import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'job' | 'payment' | 'client' | 'system' | 'reminder' | 'team';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationFilters {
  type?: Notification['type'];
  read?: boolean;
  priority?: Notification['priority'];
  from_date?: string;
  to_date?: string;
}

export const notificationsApi = {
  // Get all notifications for the current user
  async getAll(filters?: NotificationFilters): Promise<Notification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters?.read !== undefined) {
      query = query.eq('read', filters.read);
    }
    
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    
    if (filters?.from_date) {
      query = query.gte('created_at', filters.from_date);
    }
    
    if (filters?.to_date) {
      query = query.lte('created_at', filters.to_date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }

    return data || [];
  },

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      throw new Error('Failed to fetch unread count');
    }

    return count || 0;
  },

  // Get recent notifications (for dropdown)
  async getRecent(limit: number = 5): Promise<Notification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent notifications:', error);
      throw new Error('Failed to fetch recent notifications');
    }

    return data || [];
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  },

  // Mark multiple notifications as read
  async markMultipleAsRead(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', ids);

    if (error) {
      console.error('Error marking notifications as read:', error);
      throw new Error('Failed to mark notifications as read');
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Error marking all as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  },

  // Delete notification
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  },

  // Delete multiple notifications
  async deleteMultiple(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting notifications:', error);
      throw new Error('Failed to delete notifications');
    }
  },

  // Create a system notification (admin use)
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    const { error } = await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_type: 'system',
      p_title: title,
      p_message: message,
      p_priority: priority
    });

    if (error) {
      console.error('Error creating system notification:', error);
      throw new Error('Failed to create system notification');
    }
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void
  ) {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          onNotification(payload.new as Notification);
        }
      )
      .subscribe();

    return subscription;
  }
}; 