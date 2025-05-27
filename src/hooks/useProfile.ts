import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileApi, UserProfile } from '@/lib/api/profile';

export const useProfile = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const profile = await profileApi.getProfile();
      setUserProfile(profile);
    } catch (err: any) {
      console.error('Error loading user profile:', err);
      setError(err.message || 'Failed to load profile');
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load profile on mount and when user changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Refresh function that can be called from anywhere
  const refreshProfile = useCallback(() => {
    return loadProfile();
  }, [loadProfile]);

  return {
    userProfile,
    loading,
    error,
    refreshProfile
  };
}; 