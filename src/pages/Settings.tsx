import React, { useState, useEffect } from "react";
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard,
  Save,
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
  Trash2,
  Key,
  Activity,
  Briefcase,
  Zap,
  Link,
  FileText,
  Camera,
  Edit,
  Plus,
  Minus,
  Copy,
  Calendar as CalendarIcon,
  Webhook,
  PieChart,
  MessageSquare,
  Smartphone,
  Cloud,
  Database,
  Paintbrush,
  Receipt,
  Target,
  TrendingUp,
  Monitor,
  Tablet,
  Wifi,
  MapPinIcon,
  Chrome,
  Globe as BrowserIcon,
  LogOut,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";
import AppLayout from "@/components/AppLayout";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { profileApi, UserProfile } from "@/lib/api/profile";
import { downloadAsJSON } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// Import new API functions
import { serviceTypesApi, ServiceType } from "@/lib/api/service-types";
import { teamManagementApi, TeamMember, TeamInvitation } from "@/lib/api/team-management";
import { integrationsApi, IntegrationConfig } from "@/lib/api/integrations";
import { settingsApi, BrandingSettings, AdvancedBusinessSettings } from "@/lib/api/settings";
import { useProfile } from "@/hooks/useProfile";

// Types for device and activity tracking
interface DeviceInfo {
  id: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ip_address?: string;
  location?: string;
  last_seen: string;
  is_current: boolean;
  user_agent: string;
}

interface ActivityEntry {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'profile_update' | 'data_export' | 'settings_change';
  description: string;
  timestamp: string;
  ip_address?: string;
  device_info?: string;
  success: boolean;
}

const Settings = () => {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { formatCurrency, refreshPreferences, preferences: localePreferences, loading: localeLoading } = useLocale();
  const { user } = useAuth();
  const { refreshProfile } = useProfile();
  
  // State for different settings sections
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'team' | 'services' | 'branding' | 'notifications' | 'security' | 'preferences'>('profile');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showDangerZone, setShowDangerZone] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    avatar: user?.user_metadata?.avatar_url || '',
    bio: ''
  });

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Business settings
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessType: 'residential' as 'residential' | 'commercial' | 'both',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    registrationNumber: '',
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
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h' as '12h' | '24h'
  });

  // Team Management
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'manager' | 'cleaner' | 'viewer'>('cleaner');

  // Service Types & Pricing - now will be loaded from API
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  // Integrations - now will be loaded from API
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);

  // Branding Settings - now will be loaded from API
  const [brandingData, setBrandingData] = useState<BrandingSettings>({
    logo: '',
    brandColor: '#3B82F6',
    accentColor: '#EF4444',
    companySlogan: '',
    emailSignature: '',
    invoiceFooter: '',
    showBrandingOnInvoices: true,
    customDomain: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    }
  });

  // Advanced Business Settings - now will be loaded from API
  const [advancedBusinessData, setAdvancedBusinessData] = useState<AdvancedBusinessSettings>({
    taxSettings: {
      taxRate: '8.25',
      taxName: 'Sales Tax',
      includeTaxInPrices: false,
      taxIdNumber: ''
    },
    invoiceSettings: {
      invoiceNumberPrefix: 'SW-',
      invoiceNumberStart: '1001',
      paymentTerms: '30',
      lateFeePercentage: '2.5',
      automaticReminders: true,
      reminderDays: [7, 3, 1]
    },
    customerPortal: {
      enableSelfBooking: true,
      allowRescheduling: true,
      showPricing: false,
      requireApproval: true
    },
    marketingSettings: {
      enableReviewRequests: true,
      reviewRequestDelay: '24',
      referralProgram: true,
      referralReward: '25'
    }
  });

  // Export state
  const [exporting, setExporting] = useState(false);

  // Device and Activity tracking state
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  // Add useEffect to load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Set default profile data if user exists
        if (user) {
          setProfileData(prev => ({
            ...prev,
            fullName: user.user_metadata?.full_name || '',
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
            avatar: user.user_metadata?.avatar_url || ''
          }));
        }
        
        // Try to load profile data in the background, but don't block rendering
        try {
          const profile = await profileApi.getProfile();
          if (profile) {
            setProfileData(prev => ({
              ...prev,
              fullName: profile.full_name || prev.fullName,
              phone: profile.phone || prev.phone,
              avatar: profile.avatar_url || prev.avatar,
              bio: profile.bio || prev.bio
            }));
            setUserProfile(profile);
          }
        } catch (profileError) {
          console.error("Error loading profile data:", profileError);
          // Continue anyway, we'll use the basic user data from auth
        }
      } catch (error) {
        console.error("Error loading initial settings data:", error);
      }
    };

    loadInitialData();
  }, [user]);

  // Add your handleSaveProfile, handleAvatarUpload, etc. methods here

  const tabs = [
    { id: 'profile' as const, label: t('settings:profile'), icon: User },
    { id: 'business' as const, label: t('settings:business'), icon: Building2 },
    { id: 'team' as const, label: 'Team Management', icon: Users },
    { id: 'services' as const, label: 'Services & Pricing', icon: Briefcase },
    { id: 'branding' as const, label: 'Branding', icon: Paintbrush },
    { id: 'notifications' as const, label: t('settings:notifications'), icon: Bell },
    { id: 'security' as const, label: t('settings:security'), icon: Shield },
    { id: 'preferences' as const, label: t('settings:preferences'), icon: Palette }
  ];

  // Show loading state while initial data is loading
  if (initialLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <SettingsIcon className="w-7 h-7 sm:w-8 sm:h-8 text-pulse-500" />
            {t('settings:settings')}
          </h1>
          <p className="mt-1 text-gray-600">{t('settings:manageYourAccount')}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-xl shadow-sm p-2 sm:p-3 lg:p-4">
              <ul className="flex overflow-x-auto lg:overflow-visible lg:block flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 pb-1 lg:pb-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-shrink-0 lg:w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-left ${
                          activeTab === tab.id
                            ? 'bg-pulse-50 text-pulse-600 border border-pulse-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium whitespace-nowrap">{tab.label}</span>
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
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900">{t('settings:profileInformation')}</h2>
                  <p className="text-sm text-gray-600 mt-1">Update your personal information and profile settings</p>
                </div>
                
                <div className="p-4 sm:p-6">
                  {/* Avatar Section - More Mobile Friendly */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="relative flex-shrink-0 mb-2 sm:mb-0">
                      {avatarPreview || profileData.avatar ? (
                        <img 
                          src={avatarPreview || profileData.avatar} 
                          alt="Avatar" 
                          className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-pulse-500 to-pulse-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                          {profileData.fullName.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      
                      {avatarUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 className="font-medium text-gray-900 mb-1">Profile Picture</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        JPG, PNG or WebP. Max 5MB. Recommended 400x400px.
                      </p>
                      
                      <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                        <label className="relative cursor-pointer">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="px-3 py-1.5 bg-pulse-500 text-white rounded-md hover:bg-pulse-600 disabled:opacity-50 flex items-center gap-1.5 text-sm">
                            <Camera className="w-4 h-4" />
                            Upload
                          </div>
                        </label>
                        
                        <button 
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-1.5 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Profile Form - Mobile-optimized Layout */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          {t('settings:fullName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pulse-500 focus:border-pulse-500 transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          {t('settings:email')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pulse-500 focus:border-pulse-500 transition-colors"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('settings:phone')}
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pulse-500 focus:border-pulse-500 transition-colors"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('settings:bio')}
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pulse-500 focus:border-pulse-500 transition-colors resize-none"
                        placeholder={t('settings:bioPlaceholder')}
                      />
                      <p className="text-xs text-gray-500">Brief description for your profile</p>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 flex justify-end">
                    <button
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-pulse-500 text-white rounded-md hover:bg-pulse-600 disabled:opacity-50 flex items-center justify-center sm:justify-start gap-2 font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add other tabs here */}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings; 