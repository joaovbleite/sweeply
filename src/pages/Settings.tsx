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
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";
import AppLayout from "@/components/AppLayout";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { profileApi, UserProfile } from "@/lib/api/profile";
import { downloadAsJSON, setTheme, getTheme, Theme } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// Import new API functions
import { serviceTypesApi, ServiceType } from "@/lib/api/service-types";
import { teamManagementApi, TeamMember, TeamInvitation } from "@/lib/api/team-management";
import { integrationsApi, IntegrationConfig } from "@/lib/api/integrations";
import { settingsApi, BrandingSettings, MobileSettings, AdvancedBusinessSettings } from "@/lib/api/settings";
import { useProfile } from "@/hooks/useProfile";

const Settings = () => {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { formatCurrency } = useLocale();
  const { user } = useAuth();
  const { refreshProfile } = useProfile();
  
  // State for different settings sections
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'team' | 'services' | 'integrations' | 'notifications' | 'security' | 'preferences' | 'mobile' | 'branding'>('profile');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showDangerZone, setShowDangerZone] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: '',
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

  // Mobile App Settings - now will be loaded from API
  const [mobileSettings, setMobileSettings] = useState<MobileSettings>({
    enableOfflineMode: true,
    autoSyncInterval: '15',
    dataUsageOptimization: true,
    locationServices: true,
    cameraQuality: 'high',
    pushNotificationSound: 'default',
    biometricLogin: false,
    autoLogout: '30'
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

  // Load all data from APIs
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setInitialLoading(true);
        
        // Load profile and settings data in parallel
        const [
          profile,
          services,
          teamMembersData,
          invitationsData,
          integrationsData,
          brandingSettings,
          mobileAppSettings,
          advancedSettings
        ] = await Promise.all([
          profileApi.getProfile(),
          serviceTypesApi.getServiceTypes(),
          teamManagementApi.getTeamMembers(),
          teamManagementApi.getTeamInvitations(),
          integrationsApi.getIntegrations(),
          settingsApi.getBrandingSettings(),
          settingsApi.getMobileSettings(),
          settingsApi.getAdvancedBusinessSettings()
        ]);

        // Set service types
        setServiceTypes(services);

        // Set team data
        setTeamMembers(teamMembersData);
        setTeamInvitations(invitationsData);

        // Set integrations
        setIntegrations(integrationsData);

        // Set branding
        setBrandingData(brandingSettings);

        // Set mobile settings
        setMobileSettings(mobileAppSettings);

        // Set advanced business settings
        setAdvancedBusinessData(advancedSettings);

        // ... existing profile data setting code ...
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
      loadAllData();
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

      // Refresh global profile data so navigation bar updates
      await refreshProfile();

      toast.success(t('settings:profileUpdated'));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || t('common:errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setAvatarUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user?.id}-${Date.now()}.${fileExt}`;
      
      // For now, we'll use a data URL as placeholder since we don't have Supabase storage setup
      // In production, you would upload to Supabase storage and get the public URL
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      // Update profile data with new avatar URL
      setProfileData(prev => ({ ...prev, avatar: dataUrl }));
      setAvatarPreview(null);

      // Save avatar to database immediately
      await profileApi.upsertProfile({
        avatar_url: dataUrl
      });

      // Refresh global profile data so navigation bar updates immediately
      await refreshProfile();

      toast.success('Profile picture uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload profile picture');
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    try {
      setProfileData(prev => ({ ...prev, avatar: '' }));
      setAvatarPreview(null);

      // Save removal to database immediately
      await profileApi.upsertProfile({
        avatar_url: ''
      });

      // Refresh global profile data so navigation bar updates immediately
      await refreshProfile();

      toast.success('Profile picture removed');
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast.error(error.message || 'Failed to remove profile picture');
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
      if (securityData.currentPassword && securityData.newPassword) {
        // Validate password strength
        if (securityData.newPassword.length < 8) {
          toast.error('Password must be at least 8 characters long');
          return;
        }

        await profileApi.changePassword(securityData.currentPassword, securityData.newPassword);
        toast.success('Password updated successfully');
      }

      // Note: 2FA and session timeout would require additional backend implementation
      if (securityData.currentPassword || securityData.newPassword) {
        toast.success('Security settings updated successfully');
      }
      
      setSecurityData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error: any) {
      console.error('Error updating security settings:', error);
      if (error.message === 'Current password is incorrect') {
        toast.error('Current password is incorrect');
      } else {
      toast.error(error.message || t('common:errorOccurred'));
      }
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

  // Team Management Functions
  const handleInviteTeamMember = async () => {
    if (!newMemberEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      await teamManagementApi.createInvitation({
        email: newMemberEmail,
        role: newMemberRole,
        invitation_message: `You've been invited to join our Sweeply team as a ${newMemberRole}.`
      });

      // Reload invitations
      const invitations = await teamManagementApi.getTeamInvitations();
      setTeamInvitations(invitations);

      setNewMemberEmail('');
      toast.success('Team member invited successfully!');
    } catch (error: any) {
      console.error('Error inviting team member:', error);
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this team member?');
    if (!confirmed) return;

    setLoading(true);
    try {
      await teamManagementApi.removeTeamMember(memberId);
      
      // Reload team members
      const members = await teamManagementApi.getTeamMembers();
      setTeamMembers(members);

      toast.success('Team member removed successfully');
    } catch (error: any) {
      console.error('Error removing team member:', error);
      toast.error(error.message || 'Failed to remove team member');
    } finally {
      setLoading(false);
    }
  };

  // Service Type Functions
  const handleAddServiceType = async () => {
    const newService: any = {
      name: 'New Service',
      description: 'Description for new service',
      default_price: 100,
      default_duration: 120,
      category: 'residential' as const
    };

    setLoading(true);
    try {
      await serviceTypesApi.createServiceType(newService);
      
      // Reload service types
      const services = await serviceTypesApi.getServiceTypes();
      setServiceTypes(services);

      toast.success('Service type added successfully');
    } catch (error: any) {
      console.error('Error adding service type:', error);
      toast.error(error.message || 'Failed to add service type');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateServiceType = async (id: string, updates: Partial<ServiceType>) => {
    setLoading(true);
    try {
      await serviceTypesApi.updateServiceType(id, updates);
      
      // Reload service types
      const services = await serviceTypesApi.getServiceTypes();
      setServiceTypes(services);

      toast.success('Service type updated successfully');
    } catch (error: any) {
      console.error('Error updating service type:', error);
      toast.error(error.message || 'Failed to update service type');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveServiceType = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this service type?');
    if (!confirmed) return;

    setLoading(true);
    try {
      await serviceTypesApi.deleteServiceType(id);
      
      // Reload service types
      const services = await serviceTypesApi.getServiceTypes();
      setServiceTypes(services);

      toast.success('Service type removed successfully');
    } catch (error: any) {
      console.error('Error removing service type:', error);
      toast.error(error.message || 'Failed to remove service type');
    } finally {
      setLoading(false);
    }
  };

  // Integration Functions
  const handleConnectIntegration = async (integrationName: string) => {
    setLoading(true);
    try {
      // For demo purposes, we'll just update the connection status
      // In a real app, this would involve OAuth flows or API key setup
      await integrationsApi.connectIntegration({
        integration_name: integrationName,
        config_data: { connected: true, connected_at: new Date().toISOString() }
      });

      // Reload integrations
      const integrationsData = await integrationsApi.getIntegrations();
      setIntegrations(integrationsData);

      toast.success(`${integrationName} connected successfully!`);
    } catch (error: any) {
      console.error('Error connecting integration:', error);
      toast.error(error.message || 'Failed to connect integration');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectIntegration = async (integrationName: string) => {
    const confirmed = window.confirm(`Are you sure you want to disconnect ${integrationName}?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await integrationsApi.disconnectIntegration(integrationName);

      // Reload integrations
      const integrationsData = await integrationsApi.getIntegrations();
      setIntegrations(integrationsData);

      toast.success(`${integrationName} disconnected successfully`);
    } catch (error: any) {
      console.error('Error disconnecting integration:', error);
      toast.error(error.message || 'Failed to disconnect integration');
    } finally {
      setLoading(false);
    }
  };

  // CSV Export Functions for Accounting Integration
  const handleExportCustomers = async () => {
    try {
      setLoading(true);
      
      // Get all clients data
      const clients = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id);

      if (!clients.data || clients.data.length === 0) {
        toast.error('No customer data found to export');
        return;
      }

      // QuickBooks-compatible customer CSV format
      const csvContent = [
        // QuickBooks customer import headers
        ['Name', 'Company Name', 'First Name', 'Last Name', 'Email', 'Phone', 'Fax', 'Mobile', 'Website', 'Address Line 1', 'Address Line 2', 'City', 'State/Province', 'Zip/Postal Code', 'Country', 'Customer Type', 'Terms', 'Tax Code', 'Tax ID', 'Resale Number', 'Account Number', 'Credit Limit', 'Price Level', 'Preferred Payment Method', 'Preferred Delivery Method', 'Notes'].join(','),
        ...clients.data.map(client => {
          // Split name into first and last for QuickBooks
          const nameParts = client.name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          return [
            `"${client.name}"`, // Name (Company Name for businesses)
            client.client_type === 'commercial' ? `"${client.name}"` : '', // Company Name
            `"${firstName}"`, // First Name
            `"${lastName}"`, // Last Name
            client.email || '', // Email
            client.phone || '', // Phone
            '', // Fax
            '', // Mobile
            '', // Website
            `"${client.address || ''}"`, // Address Line 1
            '', // Address Line 2
            client.city || '', // City
            client.state || '', // State/Province
            client.zip || '', // Zip/Postal Code
            'US', // Country
            client.client_type === 'commercial' ? 'Commercial' : 'Residential', // Customer Type
            'Net 30', // Terms
            '', // Tax Code
            '', // Tax ID
            '', // Resale Number
            client.id, // Account Number (using client ID)
            '', // Credit Limit
            '', // Price Level
            '', // Preferred Payment Method
            '', // Preferred Delivery Method
            `"${client.notes || ''}"` // Notes
          ].join(',');
        })
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quickbooks-customers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Customer data exported for QuickBooks!');
    } catch (error: any) {
      console.error('Error exporting customers:', error);
      toast.error(error.message || 'Failed to export customer data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportInvoices = async () => {
    try {
      setLoading(true);
      
      // Get all invoices with client data
      const invoices = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('user_id', user?.id);

      if (!invoices.data || invoices.data.length === 0) {
        toast.error('No invoice data found to export');
        return;
      }

      // QuickBooks-compatible invoice CSV format
      const csvContent = [
        // QuickBooks invoice import headers
        ['Invoice No', 'Customer', 'Invoice Date', 'Due Date', 'Terms', 'Item(s)', 'Description', 'Qty', 'Rate', 'Amount', 'Tax', 'Total', 'Status', 'Memo', 'Billing Address', 'Shipping Address'].join(','),
        ...invoices.data.map(invoice => {
          const client = invoice.client as any;
          const itemsDescription = invoice.items?.map((item: any) => `${item.description} (${item.quantity} x $${item.rate})`).join('; ') || '';
          
          return [
            invoice.invoice_number, // Invoice No
            `"${client?.name || 'Unknown Client'}"`, // Customer
            invoice.issue_date, // Invoice Date
            invoice.due_date, // Due Date
            'Net 30', // Terms
            itemsDescription ? `"${itemsDescription}"` : '', // Item(s)
            `"${invoice.notes || ''}"`, // Description
            invoice.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 1, // Qty (total quantity)
            invoice.subtotal || 0, // Rate (using subtotal as rate)
            invoice.subtotal || 0, // Amount
            invoice.tax_amount || 0, // Tax
            invoice.total_amount || 0, // Total
            invoice.status === 'paid' ? 'Paid' : invoice.status === 'sent' ? 'Sent' : 'Draft', // Status
            `"${invoice.notes || ''}"`, // Memo
            `"${client?.address ? `${client.address}, ${client.city || ''}, ${client.state || ''} ${client.zip || ''}` : ''}"`, // Billing Address
            '' // Shipping Address
          ].join(',');
        })
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quickbooks-invoices-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice data exported for QuickBooks!');
    } catch (error: any) {
      console.error('Error exporting invoices:', error);
      toast.error(error.message || 'Failed to export invoice data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJobs = async () => {
    try {
      setLoading(true);
      
      // Get all jobs with client data
      const jobs = await supabase
        .from('jobs')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('user_id', user?.id);

      if (!jobs.data || jobs.data.length === 0) {
        toast.error('No job data found to export');
        return;
      }

      // QuickBooks-compatible service/job CSV format for expenses/income tracking
      const csvContent = [
        // Headers for QuickBooks service tracking
        ['Date', 'Transaction Type', 'Customer', 'Service', 'Description', 'Amount', 'Status', 'Reference', 'Address', 'Duration (mins)', 'Notes'].join(','),
        ...jobs.data.map(job => {
          const client = job.client as any;
          
          return [
            job.scheduled_date, // Date
            'Income', // Transaction Type
            `"${client?.name || 'Unknown Client'}"`, // Customer
            job.service_type || 'Cleaning Service', // Service
            `"${job.title || ''}"`, // Description
            job.actual_price || job.estimated_price || 0, // Amount
            job.status === 'completed' ? 'Completed' : job.status === 'in_progress' ? 'In Progress' : 'Scheduled', // Status
            job.id, // Reference (job ID)
            `"${job.address || client?.address || ''}"`, // Address
            job.estimated_duration || '', // Duration
            `"${job.completion_notes || job.special_instructions || ''}"` // Notes
          ].join(',');
        })
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quickbooks-services-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Job/Service data exported for QuickBooks!');
    } catch (error: any) {
      console.error('Error exporting jobs:', error);
      toast.error(error.message || 'Failed to export job data');
    } finally {
      setLoading(false);
    }
  };

  // Save Functions
  const handleSaveBranding = async () => {
    setLoading(true);
    try {
      await settingsApi.updateBrandingSettings(brandingData);
      toast.success('Branding settings saved successfully');
    } catch (error: any) {
      console.error('Error saving branding settings:', error);
      toast.error(error.message || 'Failed to save branding settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMobileSettings = async () => {
    setLoading(true);
    try {
      await settingsApi.updateMobileSettings(mobileSettings);
      toast.success('Mobile settings saved successfully');
    } catch (error: any) {
      console.error('Error saving mobile settings:', error);
      toast.error(error.message || 'Failed to save mobile settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdvancedBusiness = async () => {
    setLoading(true);
    try {
      await settingsApi.updateAdvancedBusinessSettings(advancedBusinessData);
      toast.success('Advanced business settings saved successfully');
    } catch (error: any) {
      console.error('Error saving advanced business settings:', error);
      toast.error(error.message || 'Failed to save advanced business settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: t('settings:profile'), icon: User },
    { id: 'business' as const, label: t('settings:business'), icon: Building2 },
    { id: 'team' as const, label: 'Team Management', icon: Users },
    { id: 'services' as const, label: 'Services & Pricing', icon: Briefcase },
    { id: 'integrations' as const, label: 'Integrations', icon: Zap },
    { id: 'branding' as const, label: 'Branding', icon: Paintbrush },
    { id: 'notifications' as const, label: t('settings:notifications'), icon: Bell },
    { id: 'mobile' as const, label: 'Mobile App', icon: Smartphone },
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
                    {avatarPreview || profileData.avatar ? (
                      <img 
                        src={avatarPreview || profileData.avatar} 
                        alt="Avatar" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-pulse-500 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                        {profileData.fullName.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    
                    {/* Upload progress overlay */}
                    {avatarUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a professional photo for your profile. Recommended size: 400x400px. Max file size: 5MB.
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <label className="relative cursor-pointer">
                    <input
                      type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                          disabled={avatarUploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                        <div className={`px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 flex items-center gap-2 ${
                          avatarUploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}>
                          <Camera className="w-4 h-4" />
                          {avatarUploading ? 'Uploading...' : 'Upload Photo'}
                  </div>
                      </label>
                      
                      {(profileData.avatar || avatarPreview) && !avatarUploading && (
                        <button 
                          onClick={handleRemoveAvatar}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Supported formats: JPEG, PNG, WebP
                    </div>
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

            {/* Team Management */}
            {activeTab === 'team' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Team Management</h2>
                  <div className="text-sm text-gray-600">
                    {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Invite New Team Member */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Team Member</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="team@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as 'admin' | 'manager' | 'cleaner' | 'viewer')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    >
                        <option value="viewer">Viewer</option>
                        <option value="cleaner">Cleaner</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleInviteTeamMember}
                        disabled={loading || !newMemberEmail.trim()}
                        className="w-full px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Invite
                      </button>
                    </div>
                  </div>
                  </div>
                  
                {/* Team Members List */}
                <div className="space-y-4">
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No team members yet. Invite your first team member above.</p>
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-pulse-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-pulse-600" />
                          </div>
                  <div>
                            <h4 className="font-medium text-gray-900">{member.member_name || 'Unknown'}</h4>
                            <p className="text-sm text-gray-600">{member.member_email || 'No email'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.status === 'active' ? 'bg-green-100 text-green-800' :
                            member.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {member.status}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                            {member.role}
                          </span>
                          <button
                            onClick={() => handleRemoveTeamMember(member.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  </div>
                  
                {/* Role Permissions Info */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Role Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                      <span className="font-medium text-blue-800">Admin:</span>
                      <p className="text-blue-700">Full access to all features and settings</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Manager:</span>
                      <p className="text-blue-700">Manage jobs, clients, and team members</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Cleaner:</span>
                      <p className="text-blue-700">View assigned jobs and update job status</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Viewer:</span>
                      <p className="text-blue-700">Read-only access to jobs and reports</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Services & Pricing */}
            {activeTab === 'services' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Services & Pricing</h2>
                  <button
                    onClick={handleAddServiceType}
                    className="px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Service
                  </button>
                  </div>
                  
                <div className="space-y-6">
                  {serviceTypes.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                  <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => handleUpdateServiceType(service.id, { name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                            value={service.category}
                            onChange={(e) => handleUpdateServiceType(service.id, { category: e.target.value as 'residential' | 'commercial' | 'specialized' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    >
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="specialized">Specialized</option>
                    </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Default Price</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                            <input
                              type="number"
                              value={service.default_price}
                              onChange={(e) => handleUpdateServiceType(service.id, { default_price: Number(e.target.value) })}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                            <input
                              type="number"
                              value={service.default_duration}
                              onChange={(e) => handleUpdateServiceType(service.id, { default_duration: Number(e.target.value) })}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={service.is_active}
                              onChange={(e) => handleUpdateServiceType(service.id, { is_active: e.target.checked })}
                              className="rounded border-gray-300 text-pulse-600 focus:ring-pulse-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Active</span>
                          </label>
                          <button
                            onClick={() => handleRemoveServiceType(service.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={service.description}
                          onChange={(e) => handleUpdateServiceType(service.id, { description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                          placeholder="Service description for clients..."
                        />
                      </div>
                    </div>
                  ))}
                  </div>
                  
                {/* Advanced Business Settings */}
                <div className="mt-8 space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Business Settings</h3>

                  {/* Tax Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Tax Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={advancedBusinessData.taxSettings.taxRate}
                          onChange={(e) => setAdvancedBusinessData(prev => ({
                            ...prev,
                            taxSettings: { ...prev.taxSettings, taxRate: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax Name</label>
                        <input
                          type="text"
                          value={advancedBusinessData.taxSettings.taxName}
                          onChange={(e) => setAdvancedBusinessData(prev => ({
                            ...prev,
                            taxSettings: { ...prev.taxSettings, taxName: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center pt-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={advancedBusinessData.taxSettings.includeTaxInPrices}
                            onChange={(e) => setAdvancedBusinessData(prev => ({
                              ...prev,
                              taxSettings: { ...prev.taxSettings, includeTaxInPrices: e.target.checked }
                            }))}
                            className="rounded border-gray-300 text-pulse-600 focus:ring-pulse-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Include tax in prices</span>
                    </label>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Invoice Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number Prefix</label>
                        <input
                          type="text"
                          value={advancedBusinessData.invoiceSettings.invoiceNumberPrefix}
                          onChange={(e) => setAdvancedBusinessData(prev => ({
                            ...prev,
                            invoiceSettings: { ...prev.invoiceSettings, invoiceNumberPrefix: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Starting Number</label>
                        <input
                          type="text"
                          value={advancedBusinessData.invoiceSettings.invoiceNumberStart}
                          onChange={(e) => setAdvancedBusinessData(prev => ({
                            ...prev,
                            invoiceSettings: { ...prev.invoiceSettings, invoiceNumberStart: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms (days)</label>
                    <input
                      type="number"
                          value={advancedBusinessData.invoiceSettings.paymentTerms}
                          onChange={(e) => setAdvancedBusinessData(prev => ({
                            ...prev,
                            invoiceSettings: { ...prev.invoiceSettings, paymentTerms: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Late Fee (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={advancedBusinessData.invoiceSettings.lateFeePercentage}
                          onChange={(e) => setAdvancedBusinessData(prev => ({
                            ...prev,
                            invoiceSettings: { ...prev.invoiceSettings, lateFeePercentage: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSaveAdvancedBusiness}
                    disabled={loading}
                    className="px-6 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Integrations</h2>
                <p className="text-gray-600 mb-8">Connect your favorite tools and services to streamline your workflow.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            integration.integration_type === 'payment' ? 'bg-green-100' :
                            integration.integration_type === 'calendar' ? 'bg-blue-100' :
                            integration.integration_type === 'accounting' ? 'bg-purple-100' :
                            integration.integration_type === 'marketing' ? 'bg-orange-100' :
                            'bg-gray-100'
                          }`}>
                            {integration.integration_type === 'payment' && <CreditCard className="w-6 h-6 text-green-600" />}
                            {integration.integration_type === 'calendar' && <CalendarIcon className="w-6 h-6 text-blue-600" />}
                            {integration.integration_type === 'accounting' && <Receipt className="w-6 h-6 text-purple-600" />}
                            {integration.integration_type === 'marketing' && <TrendingUp className="w-6 h-6 text-orange-600" />}
                            {integration.integration_type === 'communication' && <MessageSquare className="w-6 h-6 text-gray-600" />}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{integration.display_name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{integration.integration_type}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          integration.is_connected 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {integration.is_connected ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          {integration.integration_name === 'stripe' && 'Accept online payments securely'}
                          {integration.integration_name === 'quickbooks' && 'Sync your financial data automatically'}
                          {integration.integration_name === 'google-calendar' && 'Sync appointments with your calendar'}
                          {integration.integration_name === 'mailchimp' && 'Manage customer communications and marketing'}
                        </p>
                        {integration.last_sync && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last synced: {new Date(integration.last_sync).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {integration.is_connected ? (
                          <>
                            <button
                              onClick={() => handleDisconnectIntegration(integration.integration_name)}
                              disabled={loading}
                              className="flex-1 px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 text-sm"
                            >
                              Disconnect
                            </button>
                            <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                              <SettingsIcon className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleConnectIntegration(integration.integration_name)}
                            disabled={loading}
                            className="flex-1 px-3 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 text-sm"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Webhook Settings */}
                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Webhook className="w-5 h-5" />
                    Webhook Settings
                  </h3>
                  <p className="text-gray-600 mb-4">Configure webhooks for real-time data synchronization with external systems.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                      <input
                        type="url"
                        placeholder="https://your-app.com/webhooks/sweeply"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-pulse-600 focus:ring-pulse-500" />
                        <span className="ml-2 text-sm text-gray-700">Job updates</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-pulse-600 focus:ring-pulse-500" />
                        <span className="ml-2 text-sm text-gray-700">Payment updates</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-pulse-600 focus:ring-pulse-500" />
                        <span className="ml-2 text-sm text-gray-700">Client updates</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* CSV Export for Accounting */}
                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-600" />
                    Export to Accounting Software
                  </h3>
                  <p className="text-gray-600 mb-6">Export your business data in QuickBooks-compatible CSV format for easy import into accounting software.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Export Customers */}
                    <div className="bg-white rounded-lg border border-blue-200 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Customer List</h4>
                          <p className="text-sm text-gray-600">Export all customer data</p>
                        </div>
                      </div>
                      <button
                        onClick={handleExportCustomers}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Export Customers
                      </button>
                    </div>

                    {/* Export Invoices */}
                    <div className="bg-white rounded-lg border border-blue-200 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Invoice Data</h4>
                          <p className="text-sm text-gray-600">Export invoice records</p>
                        </div>
                      </div>
                      <button
                        onClick={handleExportInvoices}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Export Invoices
                      </button>
                    </div>

                    {/* Export Jobs/Services */}
                    <div className="bg-white rounded-lg border border-blue-200 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Job Records</h4>
                          <p className="text-sm text-gray-600">Export service/job data</p>
                        </div>
                      </div>
                      <button
                        onClick={handleExportJobs}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Export Jobs
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-yellow-800 font-medium mb-1">How to import into QuickBooks:</p>
                        <ol className="text-yellow-700 list-decimal list-inside space-y-1">
                          <li>Download the CSV file using the buttons above</li>
                          <li>In QuickBooks, go to File → Utilities → Import → IIF Files (for Customers) or Excel Files</li>
                          <li>Select your downloaded CSV file and follow the import wizard</li>
                          <li>Map the fields as needed during import</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Branding */}
            {activeTab === 'branding' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Branding & Customization</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        {brandingData.logo ? (
                          <img src={brandingData.logo} alt="Logo" className="mx-auto max-h-24" />
                        ) : (
                          <div>
                            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Upload your company logo</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" />
                        <button className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                          Choose File
                        </button>
                      </div>
                    </div>

                    {/* Color Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={brandingData.brandColor}
                            onChange={(e) => setBrandingData(prev => ({ ...prev, brandColor: e.target.value }))}
                            className="w-12 h-10 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={brandingData.brandColor}
                            onChange={(e) => setBrandingData(prev => ({ ...prev, brandColor: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={brandingData.accentColor}
                            onChange={(e) => setBrandingData(prev => ({ ...prev, accentColor: e.target.value }))}
                            className="w-12 h-10 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={brandingData.accentColor}
                            onChange={(e) => setBrandingData(prev => ({ ...prev, accentColor: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Slogan</label>
                      <input
                        type="text"
                        value={brandingData.companySlogan}
                        onChange={(e) => setBrandingData(prev => ({ ...prev, companySlogan: e.target.value }))}
                        placeholder="Your company's slogan or tagline"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      />
                    </div>

                    {/* Social Media */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Social Media Links</h4>
                      <div className="space-y-3">
                        <input
                          type="url"
                          value={brandingData.socialMedia.facebook}
                          onChange={(e) => setBrandingData(prev => ({
                            ...prev,
                            socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                          }))}
                          placeholder="Facebook URL"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        />
                        <input
                          type="url"
                          value={brandingData.socialMedia.instagram}
                          onChange={(e) => setBrandingData(prev => ({
                            ...prev,
                            socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                          }))}
                          placeholder="Instagram URL"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Email Templates */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Signature</label>
                      <textarea
                        value={brandingData.emailSignature}
                        onChange={(e) => setBrandingData(prev => ({ ...prev, emailSignature: e.target.value }))}
                        rows={4}
                        placeholder="Your email signature"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Footer</label>
                      <textarea
                        value={brandingData.invoiceFooter}
                        onChange={(e) => setBrandingData(prev => ({ ...prev, invoiceFooter: e.target.value }))}
                        rows={3}
                        placeholder="Text to appear at the bottom of invoices"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      />
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
                      <div 
                        className="bg-white rounded border p-4"
                        style={{ borderColor: brandingData.brandColor }}
                      >
                        <div 
                          className="text-lg font-semibold mb-2"
                          style={{ color: brandingData.brandColor }}
                        >
                          {businessData.businessName || 'Your Business Name'}
                        </div>
                        <p className="text-sm text-gray-600">{brandingData.companySlogan}</p>
                        <div 
                          className="mt-3 px-3 py-1 rounded text-white text-sm inline-block"
                          style={{ backgroundColor: brandingData.accentColor }}
                        >
                          Sample Button
                        </div>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={brandingData.showBrandingOnInvoices}
                          onChange={(e) => setBrandingData(prev => ({ ...prev, showBrandingOnInvoices: e.target.checked }))}
                          className="rounded border-gray-300 text-pulse-600 focus:ring-pulse-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show branding on invoices</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSaveBranding}
                    disabled={loading}
                    className="px-6 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Branding'}
                  </button>
                </div>
              </div>
            )}

            {/* Mobile App Settings */}
            {activeTab === 'mobile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Mobile App Settings</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Performance & Data</h3>
                    
                    <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                          <h4 className="text-sm font-medium text-gray-900">Offline Mode</h4>
                          <p className="text-sm text-gray-600">Work without internet connection</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                            checked={mobileSettings.enableOfflineMode}
                            onChange={(e) => setMobileSettings(prev => ({ ...prev, enableOfflineMode: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pulse-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                          <h4 className="text-sm font-medium text-gray-900">Data Usage Optimization</h4>
                          <p className="text-sm text-gray-600">Reduce data consumption</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                            checked={mobileSettings.dataUsageOptimization}
                            onChange={(e) => setMobileSettings(prev => ({ ...prev, dataUsageOptimization: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pulse-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse-600"></div>
                    </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Auto Sync Interval</label>
                        <select
                          value={mobileSettings.autoSyncInterval}
                          onChange={(e) => setMobileSettings(prev => ({ ...prev, autoSyncInterval: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        >
                          <option value="5">Every 5 minutes</option>
                          <option value="15">Every 15 minutes</option>
                          <option value="30">Every 30 minutes</option>
                          <option value="60">Every hour</option>
                          <option value="manual">Manual only</option>
                        </select>
                      </div>
                  </div>
                </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Security & Privacy</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                  <div>
                          <h4 className="text-sm font-medium text-gray-900">Location Services</h4>
                          <p className="text-sm text-gray-600">Enable GPS for job navigation</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mobileSettings.locationServices}
                            onChange={(e) => setMobileSettings(prev => ({ ...prev, locationServices: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pulse-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse-600"></div>
                    </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Biometric Login</h4>
                          <p className="text-sm text-gray-600">Use fingerprint or face ID</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mobileSettings.biometricLogin}
                            onChange={(e) => setMobileSettings(prev => ({ ...prev, biometricLogin: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pulse-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Auto Logout (minutes)</label>
                    <select 
                          value={mobileSettings.autoLogout}
                          onChange={(e) => setMobileSettings(prev => ({ ...prev, autoLogout: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="never">Never</option>
                    </select>
                  </div>

                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Camera Quality</label>
                    <select 
                          value={mobileSettings.cameraQuality}
                          onChange={(e) => setMobileSettings(prev => ({ ...prev, cameraQuality: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                    >
                          <option value="low">Low (faster uploads)</option>
                          <option value="medium">Medium</option>
                          <option value="high">High (best quality)</option>
                    </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSaveMobileSettings}
                    disabled={loading}
                    className="px-6 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Mobile Settings'}
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

            {/* Preferences Settings */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('settings:preferences')}</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Language & Region</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-gray-400" />
                          <LanguageSwitcher />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        >
                          <option value="America/New_York">Eastern Time (UTC-5)</option>
                          <option value="America/Chicago">Central Time (UTC-6)</option>
                          <option value="America/Denver">Mountain Time (UTC-7)</option>
                          <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
                          <option value="America/Phoenix">Arizona Time (UTC-7)</option>
                          <option value="America/Anchorage">Alaska Time (UTC-9)</option>
                          <option value="Pacific/Honolulu">Hawaii Time (UTC-10)</option>
                          <option value="Europe/London">London Time (UTC+0)</option>
                          <option value="Europe/Paris">Paris Time (UTC+1)</option>
                          <option value="Asia/Tokyo">Tokyo Time (UTC+9)</option>
                          <option value="Australia/Sydney">Sydney Time (UTC+11)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select
                          value={preferences.currency}
                          onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        >
                          <option value="USD">USD - US Dollar ($)</option>
                          <option value="EUR">EUR - Euro (€)</option>
                          <option value="GBP">GBP - British Pound (£)</option>
                          <option value="CAD">CAD - Canadian Dollar ($)</option>
                          <option value="AUD">AUD - Australian Dollar ($)</option>
                          <option value="JPY">JPY - Japanese Yen (¥)</option>
                          <option value="CHF">CHF - Swiss Franc (₣)</option>
                          <option value="SEK">SEK - Swedish Krona (kr)</option>
                          <option value="NOK">NOK - Norwegian Krone (kr)</option>
                          <option value="DKK">DKK - Danish Krone (kr)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Display & Format</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                        <select
                          value={preferences.dateFormat}
                          onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY (12/25/2024)</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY (25/12/2024)</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-25)</option>
                          <option value="DD MMM YYYY">DD MMM YYYY (25 Dec 2024)</option>
                          <option value="MMM DD, YYYY">MMM DD, YYYY (Dec 25, 2024)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                        <select
                          value={preferences.timeFormat}
                          onChange={(e) => setPreferences(prev => ({ ...prev, timeFormat: e.target.value as '12h' | '24h' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        >
                          <option value="12h">12-hour (2:30 PM)</option>
                          <option value="24h">24-hour (14:30)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['light', 'dark', 'system'] as Theme[]).map((theme) => (
                            <button
                              key={theme}
                              onClick={() => handleThemeChange(theme)}
                              className={`p-3 rounded-lg border-2 transition-colors ${
                                preferences.theme === theme
                                  ? 'border-pulse-500 bg-pulse-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="text-center">
                                {theme === 'light' && <div className="w-8 h-8 bg-white border border-gray-300 rounded mx-auto mb-2"></div>}
                                {theme === 'dark' && <div className="w-8 h-8 bg-gray-800 rounded mx-auto mb-2"></div>}
                                {theme === 'system' && (
                                  <div className="flex mx-auto mb-2 w-8 h-8 rounded overflow-hidden">
                                    <div className="w-4 h-8 bg-white border-r border-gray-300"></div>
                                    <div className="w-4 h-8 bg-gray-800"></div>
                                  </div>
                                )}
                                <span className="text-sm font-medium capitalize">{theme === 'system' ? 'Auto' : theme}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Preferences */}
                <div className="mt-8 space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Business Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Job Duration</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                        <select
                          value={preferences.defaultJobDuration}
                          onChange={(e) => setPreferences(prev => ({ ...prev, defaultJobDuration: e.target.value }))}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        >
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="90">1.5 hours</option>
                          <option value="120">2 hours</option>
                          <option value="150">2.5 hours</option>
                          <option value="180">3 hours</option>
                          <option value="240">4 hours</option>
                          <option value="300">5 hours</option>
                          <option value="360">6 hours</option>
                          <option value="480">8 hours</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Automatic Invoicing</h4>
                          <p className="text-sm text-gray-600">Create invoices automatically when jobs are completed</p>
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
                          <h4 className="text-sm font-medium text-gray-900">Show Tips & Tutorials</h4>
                          <p className="text-sm text-gray-600">Display helpful tips and onboarding guides</p>
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
                  </div>
                </div>

                {/* Preview Section */}
                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Preview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Date & Time Format</h5>
                      <div className="bg-white rounded border p-3">
                        <p className="text-sm">
                          Today: {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: preferences.dateFormat.includes('MMM') ? 'short' : '2-digit',
                            day: '2-digit',
                            ...(preferences.dateFormat === 'YYYY-MM-DD' && { year: 'numeric', month: '2-digit', day: '2-digit' })
                          })}
                        </p>
                        <p className="text-sm">
                          Time: {new Date().toLocaleTimeString('en-US', {
                            hour12: preferences.timeFormat === '12h',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Currency Format</h5>
                      <div className="bg-white rounded border p-3">
                        <p className="text-sm">
                          Service Price: {formatCurrency(150)}
                        </p>
                        <p className="text-sm">
                          Total Amount: {formatCurrency(1250.50)}
                        </p>
                      </div>
                    </div>
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

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900">{t('settings:security')}</h2>
                
                {/* Password Change Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Key className="w-5 h-5 text-pulse-500" />
                    Change Password
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent pr-12"
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password *
                      </label>
                      <input
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                      {securityData.newPassword && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">Password strength:</div>
                          <div className="flex gap-1">
                            <div className={`h-1 w-full rounded ${securityData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            <div className={`h-1 w-full rounded ${securityData.newPassword.length >= 8 && /[A-Z]/.test(securityData.newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            <div className={`h-1 w-full rounded ${securityData.newPassword.length >= 8 && /[0-9]/.test(securityData.newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            <div className={`h-1 w-full rounded ${securityData.newPassword.length >= 8 && /[^A-Za-z0-9]/.test(securityData.newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                      {securityData.confirmPassword && securityData.newPassword !== securityData.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <X className="w-3 h-3" />
                          Passwords do not match
                        </p>
                      )}
                      {securityData.confirmPassword && securityData.newPassword === securityData.confirmPassword && (
                        <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Passwords match
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className={`flex items-center gap-2 ${securityData.newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                        {securityData.newPassword.length >= 8 ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 border border-gray-300 rounded-sm" />}
                        At least 8 characters long
                      </li>
                      <li className={`flex items-center gap-2 ${/[A-Z]/.test(securityData.newPassword) ? 'text-green-600' : ''}`}>
                        {/[A-Z]/.test(securityData.newPassword) ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 border border-gray-300 rounded-sm" />}
                        Contains uppercase letter
                      </li>
                      <li className={`flex items-center gap-2 ${/[0-9]/.test(securityData.newPassword) ? 'text-green-600' : ''}`}>
                        {/[0-9]/.test(securityData.newPassword) ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 border border-gray-300 rounded-sm" />}
                        Contains number
                      </li>
                      <li className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(securityData.newPassword) ? 'text-green-600' : ''}`}>
                        {/[^A-Za-z0-9]/.test(securityData.newPassword) ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 border border-gray-300 rounded-sm" />}
                        Contains special character
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSaveSecurity}
                      disabled={loading || !securityData.currentPassword || !securityData.newPassword || securityData.newPassword !== securityData.confirmPassword || securityData.newPassword.length < 8}
                      className="px-6 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </div>

                {/* Session Management */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-pulse-500" />
                    Security Preferences
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Session Timeout</h4>
                        <p className="text-sm text-gray-600">Automatically log out after period of inactivity</p>
                      </div>
                      <select
                        value={securityData.sessionTimeout}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="480">8 hours</option>
                        <option value="never">Never</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Coming Soon</span>
                        <label className="relative inline-flex items-center cursor-pointer opacity-50">
                          <input
                            type="checkbox"
                            checked={securityData.twoFactorEnabled}
                            disabled={true}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
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