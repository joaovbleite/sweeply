import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange, signOut as supabaseSignOut, supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to refresh authentication
  const refreshAuth = async (): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        setUser(null);
        return null;
      }
      
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Unexpected error refreshing auth:', error);
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    // Check current user on mount
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabaseSignOut();
      if (error) throw error;
      
      setUser(null);
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}; 
 
 
 
 