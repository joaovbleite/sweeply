import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  business_name?: string;
  business_type?: 'residential' | 'commercial' | 'both';
  business_address?: string;
  website?: string;
  tax_id?: string;
  default_service_area?: number;
  working_hours?: Record<string, { start: string; end: string; enabled: boolean }>;
  timezone?: string;
  currency?: string;
  date_format?: string;
  time_format?: '12h' | '24h';
  default_job_duration?: number;
  auto_invoicing?: boolean;
  show_tips?: boolean;
  email_notifications?: Record<string, boolean>;
  sms_notifications?: Record<string, boolean>;
  push_notifications?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export const profileApi = {
  // Get user profile
  async getProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data;
  },

  // Create or update user profile
  async upsertProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update user auth metadata
  async updateAuthMetadata(metadata: Record<string, any>) {
    const { error } = await supabase.auth.updateUser({
      data: metadata
    });

    if (error) throw error;
  },

  // Change password
  async changePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  },

  // Update email
  async updateEmail(newEmail: string) {
    const { error } = await supabase.auth.updateUser({
      email: newEmail
    });

    if (error) throw error;
  }
}; 