import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

// Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zbtozsfnbmhvdzzypmrh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidG96c2ZuYm1odmR6enlwbXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMTk5MTQsImV4cCI6MjA2Mzc5NTkxNH0.1Dxhvt6d_86aWEMKw-hzSWqlNTHk9eHGB1DXHJgZA2E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signUp = async (email: string, password: string, fullName: string, company?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company: company || null,
      }
    }
  });
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
}; 
 
 
 
 