-- Add additional settings fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS branding_settings JSONB DEFAULT '{
    "logo": "",
    "brandColor": "#3B82F6",
    "accentColor": "#EF4444",
    "companySlogan": "",
    "emailSignature": "",
    "invoiceFooter": "",
    "showBrandingOnInvoices": true,
    "customDomain": "",
    "socialMedia": {
        "facebook": "",
        "instagram": "",
        "twitter": "",
        "linkedin": ""
    }
}';

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS mobile_settings JSONB DEFAULT '{
    "enableOfflineMode": true,
    "autoSyncInterval": "15",
    "dataUsageOptimization": true,
    "locationServices": true,
    "cameraQuality": "high",
    "pushNotificationSound": "default",
    "biometricLogin": false,
    "autoLogout": "30"
}';

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS advanced_business_settings JSONB DEFAULT '{
    "taxSettings": {
        "taxRate": "8.25",
        "taxName": "Sales Tax",
        "includeTaxInPrices": false,
        "taxIdNumber": ""
    },
    "invoiceSettings": {
        "invoiceNumberPrefix": "SW-",
        "invoiceNumberStart": "1001",
        "paymentTerms": "30",
        "lateFeePercentage": "2.5",
        "automaticReminders": true,
        "reminderDays": [7, 3, 1]
    },
    "customerPortal": {
        "enableSelfBooking": true,
        "allowRescheduling": true,
        "showPricing": false,
        "requireApproval": true
    },
    "marketingSettings": {
        "enableReviewRequests": true,
        "reviewRequestDelay": "24",
        "referralProgram": true,
        "referralReward": "25"
    }
}';

-- Add storage bucket configuration for branding assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding',
  'branding',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create policy for authenticated users to upload their own branding assets
CREATE POLICY "Users can upload their own branding assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'branding' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to update their own branding assets
CREATE POLICY "Users can update their own branding assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'branding' AND
  auth.uid()::text = (storage.foldername(name))[1]
) WITH CHECK (
  bucket_id = 'branding' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to delete their own branding assets
CREATE POLICY "Users can delete their own branding assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'branding' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for public access to view branding assets
CREATE POLICY "Public can view branding assets" ON storage.objects
FOR SELECT USING (bucket_id = 'branding');

-- Create function to update branding settings
CREATE OR REPLACE FUNCTION update_branding_settings(
    p_user_id UUID,
    p_branding_settings JSONB
) RETURNS JSONB AS $$
BEGIN
    UPDATE user_profiles
    SET branding_settings = p_branding_settings,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
    END IF;
    
    RETURN jsonb_build_object('success', true, 'message', 'Branding settings updated');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update mobile settings
CREATE OR REPLACE FUNCTION update_mobile_settings(
    p_user_id UUID,
    p_mobile_settings JSONB
) RETURNS JSONB AS $$
BEGIN
    UPDATE user_profiles
    SET mobile_settings = p_mobile_settings,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
    END IF;
    
    RETURN jsonb_build_object('success', true, 'message', 'Mobile settings updated');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update advanced business settings
CREATE OR REPLACE FUNCTION update_advanced_business_settings(
    p_user_id UUID,
    p_advanced_settings JSONB
) RETURNS JSONB AS $$
BEGIN
    UPDATE user_profiles
    SET advanced_business_settings = p_advanced_settings,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
    END IF;
    
    RETURN jsonb_build_object('success', true, 'message', 'Advanced business settings updated');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all user settings
CREATE OR REPLACE FUNCTION get_user_settings(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_profile user_profiles%ROWTYPE;
    v_service_types JSONB;
    v_team_members JSONB;
    v_integrations JSONB;
BEGIN
    -- Get user profile
    SELECT * INTO v_profile FROM user_profiles WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
    END IF;
    
    -- Get service types
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'name', name,
            'description', description,
            'defaultPrice', default_price,
            'defaultDuration', default_duration,
            'category', category,
            'isActive', is_active
        )
    ) INTO v_service_types
    FROM service_types 
    WHERE user_id = p_user_id AND is_active = true;
    
    -- Get team members
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', tm.id,
            'name', COALESCE(up.full_name, au.email),
            'email', au.email,
            'role', tm.role,
            'status', tm.status,
            'joinedAt', tm.joined_at
        )
    ) INTO v_team_members
    FROM team_members tm
    JOIN auth.users au ON au.id = tm.member_user_id
    LEFT JOIN user_profiles up ON up.user_id = tm.member_user_id
    WHERE tm.user_id = p_user_id AND tm.status = 'active';
    
    -- Get integrations
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'name', integration_name,
            'displayName', display_name,
            'type', integration_type,
            'isConnected', is_connected,
            'lastSync', last_sync,
            'syncStatus', sync_status
        )
    ) INTO v_integrations
    FROM integration_configs 
    WHERE user_id = p_user_id AND is_enabled = true;
    
    RETURN jsonb_build_object(
        'success', true,
        'profile', row_to_json(v_profile),
        'serviceTypes', COALESCE(v_service_types, '[]'::jsonb),
        'teamMembers', COALESCE(v_team_members, '[]'::jsonb),
        'integrations', COALESCE(v_integrations, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 