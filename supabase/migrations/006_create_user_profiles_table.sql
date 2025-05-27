-- Create user_profiles table for storing user settings and preferences
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Personal Information
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    
    -- Business Information
    business_name TEXT,
    business_type TEXT DEFAULT 'residential' CHECK (business_type IN ('residential', 'commercial', 'both')),
    business_address TEXT,
    website TEXT,
    tax_id TEXT,
    default_service_area INTEGER DEFAULT 25,
    working_hours JSONB DEFAULT '{
        "monday": {"start": "08:00", "end": "18:00", "enabled": true},
        "tuesday": {"start": "08:00", "end": "18:00", "enabled": true},
        "wednesday": {"start": "08:00", "end": "18:00", "enabled": true},
        "thursday": {"start": "08:00", "end": "18:00", "enabled": true},
        "friday": {"start": "08:00", "end": "18:00", "enabled": true},
        "saturday": {"start": "09:00", "end": "16:00", "enabled": true},
        "sunday": {"start": "10:00", "end": "15:00", "enabled": false}
    }',
    
    -- Preferences
    timezone TEXT DEFAULT 'America/New_York',
    currency TEXT DEFAULT 'USD',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    time_format TEXT DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
    default_job_duration INTEGER DEFAULT 120,
    auto_invoicing BOOLEAN DEFAULT true,
    show_tips BOOLEAN DEFAULT true,
    
    -- Notification Settings
    email_notifications JSONB DEFAULT '{
        "newJobs": true,
        "jobReminders": true,
        "paymentReceived": true,
        "clientMessages": true,
        "systemUpdates": false
    }',
    sms_notifications JSONB DEFAULT '{
        "urgentAlerts": true,
        "jobReminders": false,
        "paymentReminders": true
    }',
    push_notifications JSONB DEFAULT '{
        "enabled": true,
        "jobUpdates": true,
        "messages": true
    }',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create default profile on user signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile(); 