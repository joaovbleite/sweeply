import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connected successfully!');
    console.log('📊 Current session:', data.session ? 'User logged in' : 'No active session');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};

// Test function to check if environment variables are loaded
export const checkEnvironmentVariables = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('🔍 Environment Variables Check:');
  console.log('VITE_SUPABASE_URL:', url ? '✅ Loaded' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', key ? '✅ Loaded' : '❌ Missing');
  
  if (!url || !key) {
    console.log('⚠️  Please update your .env.local file with your Supabase credentials');
    return false;
  }
  
  if (url.includes('your-project-id') || key.includes('your-anon-key')) {
    console.log('⚠️  Please replace placeholder values in .env.local with actual Supabase credentials');
    return false;
  }
  
  return true;
}; 