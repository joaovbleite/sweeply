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

    // First, check if a profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new profile with fallbacks
      const dataToInsert = {
        user_id: user.id,
        full_name: profileData.full_name || 
                   user.user_metadata?.full_name || 
                   user.user_metadata?.name ||
                   user.email?.split('@')[0] || 
                   'User',
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // Update user auth metadata
  async updateAuthMetadata(metadata: Record<string, any>) {
    const { error } = await supabase.auth.updateUser({
      data: metadata
    });

    if (error) throw error;
  },

  // Verify current password
  async verifyPassword(currentPassword: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Sign in with current credentials to verify password
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    });

    return !error;
  },

  // Change password with current password verification
  async changePassword(currentPassword: string, newPassword: string) {
    // First verify the current password
    const isCurrentPasswordValid = await this.verifyPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update to new password
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
  },

  // Upload avatar image
  async uploadAvatar(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create file name with user ID and timestamp to avoid conflicts
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  // Export all user data (GDPR compliance)
  async exportAllUserData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get profile data
    const profile = await this.getProfile();

    // Get all related data
    const [clients, jobs, invoices] = await Promise.all([
      supabase.from('clients').select('*').eq('user_id', user.id),
      supabase.from('jobs').select('*').eq('user_id', user.id),
      supabase.from('invoices').select('*').eq('user_id', user.id)
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at
      },
      profile,
      clients: clients.data || [],
      jobs: jobs.data || [],
      invoices: invoices.data || []
    };
  },

  // Delete user account and all data
  async deleteAccount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Delete user will cascade delete all related data due to foreign key constraints
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw error;
  },

  // Resend email verification
  async resendEmailVerification() {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: (await supabase.auth.getUser()).data.user?.email || ''
    });

    if (error) throw error;
  }
}; 