import { supabase } from '@/lib/supabase';

export interface BrandingSettings {
  logo: string;
  brandColor: string;
  accentColor: string;
  companySlogan: string;
  emailSignature: string;
  invoiceFooter: string;
  showBrandingOnInvoices: boolean;
  customDomain: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
}

export interface AdvancedBusinessSettings {
  taxSettings: {
    taxRate: string;
    taxName: string;
    includeTaxInPrices: boolean;
    taxIdNumber: string;
  };
  invoiceSettings: {
    invoiceNumberPrefix: string;
    invoiceNumberStart: string;
    paymentTerms: string;
    lateFeePercentage: string;
    automaticReminders: boolean;
    reminderDays: number[];
  };
  customerPortal: {
    enableSelfBooking: boolean;
    allowRescheduling: boolean;
    showPricing: boolean;
    requireApproval: boolean;
  };
  marketingSettings: {
    enableReviewRequests: boolean;
    reviewRequestDelay: string;
    referralProgram: boolean;
    referralReward: string;
  };
}

export interface AllUserSettings {
  branding: BrandingSettings;
  advanced: AdvancedBusinessSettings;
}

class SettingsAPI {
  // Branding Settings
  async getBrandingSettings(): Promise<BrandingSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .select('branding_settings')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data?.branding_settings || this.getDefaultBrandingSettings();
  }

  async updateBrandingSettings(brandingSettings: Partial<BrandingSettings>): Promise<BrandingSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current settings and merge with updates
    const currentSettings = await this.getBrandingSettings();
    const updatedSettings = { ...currentSettings, ...brandingSettings };

    const { data, error } = await supabase.rpc('update_branding_settings', {
      p_user_id: user.id,
      p_branding_settings: updatedSettings,
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.error || 'Failed to update branding settings');
    }

    return updatedSettings;
  }

  // Advanced Business Settings
  async getAdvancedBusinessSettings(): Promise<AdvancedBusinessSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .select('advanced_business_settings')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data?.advanced_business_settings || this.getDefaultAdvancedBusinessSettings();
  }

  async updateAdvancedBusinessSettings(advancedSettings: Partial<AdvancedBusinessSettings>): Promise<AdvancedBusinessSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current settings and merge with updates
    const currentSettings = await this.getAdvancedBusinessSettings();
    const updatedSettings = { ...currentSettings, ...advancedSettings };

    const { data, error } = await supabase.rpc('update_advanced_business_settings', {
      p_user_id: user.id,
      p_advanced_settings: updatedSettings,
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.error || 'Failed to update advanced business settings');
    }

    return updatedSettings;
  }

  // Get All Settings
  async getAllSettings(): Promise<AllUserSettings> {
    const [branding, advanced] = await Promise.all([
      this.getBrandingSettings(),
      this.getAdvancedBusinessSettings(),
    ]);

    return {
      branding,
      advanced,
    };
  }

  // Comprehensive Settings using Database Function
  async getComprehensiveSettings(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('get_user_settings', {
      p_user_id: user.id,
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.error || 'Failed to load settings');
    }

    return data;
  }

  // File Upload for Branding Assets
  async uploadLogo(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/logo.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('branding')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('branding')
      .getPublicUrl(fileName);

    // Update branding settings with new logo URL
    await this.updateBrandingSettings({ logo: publicUrl });

    return publicUrl;
  }

  async deleteLogo(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current logo to extract file path
    const brandingSettings = await this.getBrandingSettings();
    if (!brandingSettings.logo) return;

    // Extract file path from URL
    const urlParts = brandingSettings.logo.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `${user.id}/${fileName}`;

    const { error } = await supabase.storage
      .from('branding')
      .remove([filePath]);

    if (error) throw error;

    // Update branding settings to remove logo URL
    await this.updateBrandingSettings({ logo: '' });
  }

  // Default Settings
  private getDefaultBrandingSettings(): BrandingSettings {
    return {
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
        linkedin: '',
      },
    };
  }

  private getDefaultAdvancedBusinessSettings(): AdvancedBusinessSettings {
    return {
      taxSettings: {
        taxRate: '8.25',
        taxName: 'Sales Tax',
        includeTaxInPrices: false,
        taxIdNumber: '',
      },
      invoiceSettings: {
        invoiceNumberPrefix: 'SW-',
        invoiceNumberStart: '1001',
        paymentTerms: '30',
        lateFeePercentage: '2.5',
        automaticReminders: true,
        reminderDays: [7, 3, 1],
      },
      customerPortal: {
        enableSelfBooking: true,
        allowRescheduling: true,
        showPricing: false,
        requireApproval: true,
      },
      marketingSettings: {
        enableReviewRequests: true,
        reviewRequestDelay: '24',
        referralProgram: true,
        referralReward: '25',
      },
    };
  }

  // Utility Methods
  async resetBrandingSettings(): Promise<BrandingSettings> {
    const defaultSettings = this.getDefaultBrandingSettings();
    return this.updateBrandingSettings(defaultSettings);
  }

  async resetAdvancedBusinessSettings(): Promise<AdvancedBusinessSettings> {
    const defaultSettings = this.getDefaultAdvancedBusinessSettings();
    return this.updateAdvancedBusinessSettings(defaultSettings);
  }

  async exportSettings(): Promise<AllUserSettings> {
    return this.getAllSettings();
  }

  async importSettings(settings: Partial<AllUserSettings>): Promise<AllUserSettings> {
    const promises = [];

    if (settings.branding) {
      promises.push(this.updateBrandingSettings(settings.branding));
    }

    if (settings.advanced) {
      promises.push(this.updateAdvancedBusinessSettings(settings.advanced));
    }

    await Promise.all(promises);
    return this.getAllSettings();
  }
}

export const settingsApi = new SettingsAPI(); 