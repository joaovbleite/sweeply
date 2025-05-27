import React, { useState, useEffect, useRef } from "react";
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Info,
  Loader2,
  Download,
  Upload,
  Trash2,
  Key,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";
import AppLayout from "@/components/AppLayout";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { profileApi, UserProfile } from "@/lib/api/profile";
import { downloadAsJSON, setTheme, getTheme, Theme } from "@/lib/utils";

const Settings = () => {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { formatCurrency } = useLocale();
  const { user } = useAuth();
  
  // State for different settings sections
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'notifications' | 'security' | 'preferences'>('profile');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: '',
    bio: ''
  });

  // Business settings
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessType: 'residential' as 'residential' | 'commercial' | 'both',
    address: '',
    website: '',
    taxId: '',
    defaultServiceArea: '25',
    workingHours: {
      monday: { start: '08:00', end: '18:00', enabled: true },
      tuesday: { start: '08:00', end: '18:00', enabled: true },
      wednesday: { start: '08:00', end: '18:00', enabled: true },
      thursday: { start: '08:00', end: '18:00', enabled: true },
      friday: { start: '08:00', end: '18:00', enabled: true },
      saturday: { start: '09:00', end: '16:00', enabled: true },
      sunday: { start: '10:00', end: '15:00', enabled: false }
    }
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      newJobs: true,
      jobReminders: true,
      paymentReceived: true,
      clientMessages: true,
      systemUpdates: false
    },
    smsNotifications: {
      urgentAlerts: true,
      jobReminders: false,
      paymentReminders: true
    },
    pushNotifications: {
      enabled: true,
      jobUpdates: true,
      messages: true
    }
  });

  // Security settings
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: '30'
  });

  // Preference settings
  const [preferences, setPreferences] = useState({
    language: i18n.language,
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h' as '12h' | '24h',
    theme: getTheme(),
    defaultJobDuration: '120',
    autoInvoicing: true,
    showTips: true
  });

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setInitialLoading(true);
        const profile = await profileApi.getProfile();
        
        if (profile) {
          setUserProfile(profile);
          
          // Update profile data
          setProfileData({
            fullName: profile.full_name || '',
            email: user?.email || '',
            phone: profile.phone || '',
            avatar: profile.avatar_url || '',
            bio: profile.bio || ''
          });

          // Update business data
          setBusinessData({
            businessName: profile.business_name || '',
            businessType: profile.business_type || 'residential',
            address: profile.business_address || '',
            website: profile.website || '',
            taxId: profile.tax_id || '',
            defaultServiceArea: profile.default_service_area?.toString() || '25',
            workingHours: (profile.working_hours as typeof businessData.workingHours) || businessData.workingHours
          });

          // Update notification settings
          setNotificationSettings({
            emailNotifications: (profile.email_notifications as typeof notificationSettings.emailNotifications) || notificationSettings.emailNotifications,
            smsNotifications: (profile.sms_notifications as typeof notificationSettings.smsNotifications) || notificationSettings.smsNotifications,
            pushNotifications: (profile.push_notifications as typeof notificationSettings.pushNotifications) || notificationSettings.pushNotifications
          });

          // Update preferences
          setPreferences({
            language: i18n.language,
            timezone: profile.timezone || 'America/New_York',
            currency: profile.currency || 'USD',
            dateFormat: profile.date_format || 'MM/DD/YYYY',
            timeFormat: profile.time_format || '12h',
            theme: 'light',
            defaultJobDuration: profile.default_job_duration?.toString() || '120',
            autoInvoicing: profile.auto_invoicing ?? true,
            showTips: profile.show_tips ?? true
          });
        } else {
          // Set defaults from user auth data
          setProfileData(prev => ({
            ...prev,
            fullName: user?.user_metadata?.full_name || '',
            email: user?.email || ''
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setInitialLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user, i18n.language]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Update profile in database
      await profileApi.upsertProfile({
        full_name: profileData.fullName,
        phone: profileData.phone,
        avatar_url: profileData.avatar,
        bio: profileData.bio
      });

      // Update auth metadata
      await profileApi.updateAuthMetadata({
        full_name: profileData.fullName
      });

      // Update email if changed
      if (profileData.email !== user?.email) {
        await profileApi.updateEmail(profileData.email);
        toast.success('Email update confirmation sent to your new email address');
      }

      toast.success(t('settings:profileUpdated'));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || t('common:errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusiness = async () => {
    setLoading(true);
    try {
      await profileApi.upsertProfile({
        business_name: businessData.businessName,
        business_type: businessData.businessType,
        business_address: businessData.address,
        website: businessData.website,
        tax_id: businessData.taxId,
        default_service_area: parseInt(businessData.defaultServiceArea),
        working_hours: businessData.workingHours
      });

      toast.success(t('settings:businessSettingsUpdated'));
    } catch (error: any) {
      console.error('Error updating business settings:', error);
      toast.error(error.message || t('common:errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await profileApi.upsertProfile({
        email_notifications: notificationSettings.emailNotifications,
        sms_notifications: notificationSettings.smsNotifications,
        push_notifications: notificationSettings.pushNotifications
      });

      toast.success(t('settings:notificationSettingsUpdated'));
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      toast.error(error.message || t('common:errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
      toast.error(t('settings:passwordMismatch'));
      return;
    }
    
    setLoading(true);
    try {
      // Change password if provided
      if (securityData.newPassword) {
        await profileApi.changePassword(securityData.newPassword);
        toast.success('Password updated successfully');
      }

      // Note: 2FA and session timeout would require additional backend implementation
      toast.success(t('settings:securitySettingsUpdated'));
      setSecurityData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error: any) {
      console.error('Error updating security settings:', error);
      toast.error(error.message || t('common:errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await profileApi.upsertProfile({
        timezone: preferences.timezone,
        currency: preferences.currency,
        date_format: preferences.dateFormat,
        time_format: preferences.timeFormat,
        default_job_duration: parseInt(preferences.defaultJobDuration),
        auto_invoicing: preferences.autoInvoicing,
        show_tips: preferences.showTips
      });

      // Apply theme change
      setTheme(preferences.theme);

      toast.success(t('settings:preferencesUpdated'));
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast.error(error.message || t('common:errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  // Avatar upload handler
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setAvatarUploading(true);
    try {
      const avatarUrl = await profileApi.uploadAvatar(file);
      
      // Update profile with new avatar URL
      await profileApi.upsertProfile({ avatar_url: avatarUrl });
      
      // Update local state
      setProfileData(prev => ({ ...prev, avatar: avatarUrl }));
      
      toast.success('Avatar updated successfully!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Export user data
  const handleExportData = async () => {
    try {
      setLoading(true);
      const userData = await profileApi.exportAllUserData();
      downloadAsJSON(userData, 'sweeply-user-data');
      toast.success('Data exported successfully!');
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast.error(error.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  // Resend email verification
  const handleResendVerification = async () => {
    try {
      await profileApi.resendEmailVerification();
      toast.success('Verification email sent!');
    } catch (error: any) {
      console.error('Error sending verification:', error);
      toast.error(error.message || 'Failed to send verification email');
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    );
    
    if (!confirmed) return;

    const finalConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    );

    if (finalConfirm !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }

    try {
      setLoading(true);
      await profileApi.deleteAccount();
      toast.success('Account deleted successfully');
      // User will be redirected by auth state change
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  // Theme change handler
  const handleThemeChange = (newTheme: Theme) => {
    setPreferences(prev => ({ ...prev, theme: newTheme }));
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  const tabs = [
    { id: 'profile' as const, label: t('settings:profile'), icon: User },
    { id: 'business' as const, label: t('settings:business'), icon: Building2 },
    { id: 'notifications' as const, label: t('settings:notifications'), icon: Bell },
    { id: 'security' as const, label: t('settings:security'), icon: Shield },
    { id: 'preferences' as const, label: t('settings:preferences'), icon: Palette }
  ];

  // Show loading state while initial data is loading
  if (initialLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-pulse-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading settings...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-pulse-500" />
            {t('settings:settings')}
          </h1>
          <p className="mt-1 text-gray-600">{t('settings:manageYourAccount')}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-xl shadow-sm p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                          activeTab === tab.id
                            ? 'bg-pulse-50 text-pulse-600 border border-pulse-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('settings:profileInformation')}</h2>
                
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    {profileData.avatar ? (
                      <img 
                        src={profileData.avatar} 
                        alt="Avatar" 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-pulse-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {profileData.fullName.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {avatarUploading ? (
                        <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{profileData.fullName || t('settings:yourName')}</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>{profileData.email}</span>
                      {user?.email_confirmed_at ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Verified
                        </span>
                      ) : (
                        <button 
                          onClick={handleResendVerification}
                          className="text-orange-600 hover:text-orange-700 text-sm underline"
                        >
                          Verify Email
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-pulse-600 hover:text-pulse-700 text-sm font-medium"
                    >
                      {t('settings:changePhoto')}
                    </button>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:fullName')}
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:email')}
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:phone')}
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:bio')}
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      placeholder={t('settings:bioPlaceholder')}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-6 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? t('common:saving') : t('common:save')}
                  </button>
                </div>
              </div>
            )}

            {/* Business Settings */}
            {activeTab === 'business' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('settings:businessSettings')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:businessName')}
                    </label>
                    <input
                      type="text"
                      value={businessData.businessName}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, businessName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:businessType')}
                    </label>
                    <select
                      value={businessData.businessType}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, businessType: e.target.value as 'residential' | 'commercial' | 'both' }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    >
                      <option value="residential">{t('settings:residential')}</option>
                      <option value="commercial">{t('settings:commercial')}</option>
                      <option value="both">{t('settings:both')}</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:businessAddress')}
                    </label>
                    <input
                      type="text"
                      value={businessData.address}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:website')}
                    </label>
                    <input
                      type="url"
                      value={businessData.website}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:defaultServiceArea')} (miles)
                    </label>
                    <input
                      type="number"
                      value={businessData.defaultServiceArea}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, defaultServiceArea: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Working Hours */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings:workingHours')}</h3>
                  <div className="space-y-4">
                    {Object.entries(businessData.workingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center gap-4">
                        <div className="w-24">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {t(`settings:${day}`)}
                          </span>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={hours.enabled}
                            onChange={(e) => setBusinessData(prev => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [day]: { ...hours, enabled: e.target.checked }
                              }
                            }))}
                            className="rounded border-gray-300 text-pulse-600 focus:ring-pulse-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">{t('settings:open')}</span>
                        </label>
                        {hours.enabled && (
                          <>
                            <input
                              type="time"
                              value={hours.start}
                              onChange={(e) => setBusinessData(prev => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  [day]: { ...hours, start: e.target.value }
                                }
                              }))}
                              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={hours.end}
                              onChange={(e) => setBusinessData(prev => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  [day]: { ...hours, end: e.target.value }
                                }
                              }))}
                              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSaveBusiness}
                    disabled={loading}
                    className="px-6 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? t('common:saving') : t('common:save')}
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Settings */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('settings:preferences')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:language')}
                    </label>
                    <LanguageSwitcher />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:timezone')}
                    </label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:currency')}
                    </label>
                    <select
                      value={preferences.currency}
                      onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:dateFormat')}
                    </label>
                    <select
                      value={preferences.dateFormat}
                      onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:timeFormat')}
                    </label>
                    <select
                      value={preferences.timeFormat}
                      onChange={(e) => setPreferences(prev => ({ ...prev, timeFormat: e.target.value as '12h' | '24h' }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    >
                      <option value="12h">12-hour (2:30 PM)</option>
                      <option value="24h">24-hour (14:30)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:defaultJobDuration')} (minutes)
                    </label>
                    <input
                      type="number"
                      value={preferences.defaultJobDuration}
                      onChange={(e) => setPreferences(prev => ({ ...prev, defaultJobDuration: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Toggle Settings */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{t('settings:autoInvoicing')}</h4>
                      <p className="text-sm text-gray-600">{t('settings:autoInvoicingDesc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.autoInvoicing}
                        onChange={(e) => setPreferences(prev => ({ ...prev, autoInvoicing: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pulse-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{t('settings:showTips')}</h4>
                      <p className="text-sm text-gray-600">{t('settings:showTipsDesc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.showTips}
                        onChange={(e) => setPreferences(prev => ({ ...prev, showTips: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pulse-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse-600"></div>
                    </label>
                  </div>
                </div>

                {/* Theme Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:theme')}
                    </label>
                    <select 
                      value={preferences.theme}
                      onChange={(e) => handleThemeChange(e.target.value as Theme)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings:timeFormat')}
                    </label>
                    <select 
                      value={preferences.timeFormat}
                      onChange={(e) => setPreferences(prev => ({ ...prev, timeFormat: e.target.value as '12h' | '24h' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    >
                      <option value="12h">12-hour (2:30 PM)</option>
                      <option value="24h">24-hour (14:30)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={loading}
                    className="px-6 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? t('common:saving') : t('common:save')}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('settings:notificationSettings')}</h2>
                
                {/* Email Notifications */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-pulse-500" />
                    {t('settings:emailNotifications')}
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(notificationSettings.emailNotifications).map(([key, enabled]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{t(`settings:${key}`)}</h4>
                          <p className="text-sm text-gray-600">{t(`settings:${key}Desc`)}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              emailNotifications: {
                                ...prev.emailNotifications,
                                [key]: e.target.checked
                              }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pulse-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SMS Notifications */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-pulse-500" />
                    {t('settings:smsNotifications')}
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(notificationSettings.smsNotifications).map(([key, enabled]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{t(`settings:${key}`)}</h4>
                          <p className="text-sm text-gray-600">{t(`settings:${key}Desc`)}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              smsNotifications: {
                                ...prev.smsNotifications,
                                [key]: e.target.checked
                              }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pulse-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-pulse-500" />
                    {t('settings:pushNotifications')}
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(notificationSettings.pushNotifications).map(([key, enabled]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{t(`settings:${key}`)}</h4>
                          <p className="text-sm text-gray-600">{t(`settings:${key}Desc`)}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              pushNotifications: {
                                ...prev.pushNotifications,
                                [key]: e.target.checked
                              }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pulse-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={loading}
                    className="px-6 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? t('common:saving') : t('common:save')}
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900">{t('settings:security')}</h2>
                
                {/* Data Export Section */}
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <div className="flex items-start gap-4">
                    <Download className="w-6 h-6 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">Export Your Data</h3>
                      <p className="text-blue-700 mb-4">
                        Download a complete copy of your account data in JSON format. This includes your profile, clients, jobs, and invoices.
                      </p>
                      <button
                        onClick={handleExportData}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Export Data
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Account created</p>
                        <p className="text-sm text-gray-600">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Email verification</p>
                        <p className="text-sm text-gray-600">
                          {user?.email_confirmed_at ? (
                            `Verified on ${new Date(user.email_confirmed_at).toLocaleDateString()}`
                          ) : (
                            'Not verified'
                          )}
                        </p>
                      </div>
                      {user?.email_confirmed_at ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <X className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-red-200 bg-red-50 border p-6 rounded-lg">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
                      <p className="text-red-700 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowDangerZone(!showDangerZone)}
                          className="text-red-600 hover:text-red-700 font-medium underline"
                        >
                          {showDangerZone ? 'Hide' : 'Show'} deletion options
                        </button>
                        
                        {showDangerZone && (
                          <div className="pt-3 border-t border-red-200">
                            <button
                              onClick={handleDeleteAccount}
                              disabled={loading}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" />
                                  Delete Account
                                </>
                              )}
                            </button>
                            <p className="text-sm text-red-600 mt-2">
                              This will permanently delete your account and all associated data.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings; 