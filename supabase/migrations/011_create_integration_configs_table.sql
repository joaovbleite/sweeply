-- Create integration_configs table for managing third-party integrations
CREATE TABLE IF NOT EXISTS integration_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Integration Details
    integration_type TEXT NOT NULL CHECK (integration_type IN ('payment', 'calendar', 'accounting', 'communication', 'marketing', 'storage', 'crm')),
    integration_name TEXT NOT NULL, -- 'stripe', 'quickbooks', 'google-calendar', 'mailchimp', etc.
    display_name TEXT NOT NULL, -- User-friendly name
    
    -- Status and Configuration
    is_connected BOOLEAN DEFAULT false,
    is_enabled BOOLEAN DEFAULT true,
    config_data JSONB DEFAULT '{}', -- Store API keys, settings, etc. (encrypted)
    webhook_settings JSONB DEFAULT '{}',
    
    -- Sync Information
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status TEXT DEFAULT 'never' CHECK (sync_status IN ('never', 'success', 'error', 'in_progress')),
    last_error TEXT,
    sync_frequency TEXT DEFAULT 'manual' CHECK (sync_frequency IN ('manual', 'hourly', 'daily', 'weekly')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    connected_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure unique integration per user
    UNIQUE(user_id, integration_name)
);

-- Create integration_sync_logs table for tracking sync operations
CREATE TABLE IF NOT EXISTS integration_sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    integration_config_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE NOT NULL,
    
    -- Sync Details
    sync_type TEXT NOT NULL, -- 'manual', 'scheduled', 'webhook'
    sync_direction TEXT NOT NULL CHECK (sync_direction IN ('import', 'export', 'bidirectional')),
    status TEXT NOT NULL CHECK (status IN ('started', 'success', 'error', 'cancelled')),
    
    -- Results
    records_processed INTEGER DEFAULT 0,
    records_success INTEGER DEFAULT 0,
    records_error INTEGER DEFAULT 0,
    error_message TEXT,
    sync_data JSONB DEFAULT '{}', -- Additional sync metadata
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER, -- Duration in milliseconds
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_integration_configs_user_id ON integration_configs(user_id);
CREATE INDEX idx_integration_configs_type ON integration_configs(integration_type);
CREATE INDEX idx_integration_configs_name ON integration_configs(integration_name);
CREATE INDEX idx_integration_configs_connected ON integration_configs(is_connected);
CREATE INDEX idx_integration_configs_enabled ON integration_configs(is_enabled);
CREATE INDEX idx_integration_configs_sync_status ON integration_configs(sync_status);

CREATE INDEX idx_integration_sync_logs_user_id ON integration_sync_logs(user_id);
CREATE INDEX idx_integration_sync_logs_config_id ON integration_sync_logs(integration_config_id);
CREATE INDEX idx_integration_sync_logs_status ON integration_sync_logs(status);
CREATE INDEX idx_integration_sync_logs_started_at ON integration_sync_logs(started_at);

-- Enable Row Level Security
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for integration_configs
CREATE POLICY "Users can view their own integration configs" ON integration_configs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integration configs" ON integration_configs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integration configs" ON integration_configs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integration configs" ON integration_configs
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for integration_sync_logs
CREATE POLICY "Users can view their own sync logs" ON integration_sync_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs" ON integration_sync_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_integration_configs_updated_at
    BEFORE UPDATE ON integration_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create default integrations for new users
CREATE OR REPLACE FUNCTION create_default_integrations()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO integration_configs (user_id, integration_type, integration_name, display_name, is_connected)
    VALUES 
        (NEW.id, 'payment', 'stripe', 'Stripe', false),
        (NEW.id, 'accounting', 'quickbooks', 'QuickBooks', false),
        (NEW.id, 'calendar', 'google-calendar', 'Google Calendar', false),
        (NEW.id, 'marketing', 'mailchimp', 'Mailchimp', false),
        (NEW.id, 'communication', 'twilio', 'Twilio SMS', false),
        (NEW.id, 'payment', 'square', 'Square', false),
        (NEW.id, 'accounting', 'xero', 'Xero', false),
        (NEW.id, 'calendar', 'outlook', 'Outlook Calendar', false)
    ON CONFLICT (user_id, integration_name) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to add default integrations when user signs up
CREATE TRIGGER on_auth_user_created_integrations
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_integrations();

-- Function to connect an integration
CREATE OR REPLACE FUNCTION connect_integration(
    p_user_id UUID,
    p_integration_name TEXT,
    p_config_data JSONB
) RETURNS JSONB AS $$
DECLARE
    v_integration_id UUID;
BEGIN
    -- Update integration config
    UPDATE integration_configs
    SET is_connected = true,
        config_data = p_config_data,
        connected_at = NOW(),
        updated_at = NOW(),
        sync_status = 'success',
        last_sync = NOW()
    WHERE user_id = p_user_id 
      AND integration_name = p_integration_name
    RETURNING id INTO v_integration_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Integration not found');
    END IF;
    
    -- Log the connection
    INSERT INTO integration_sync_logs (user_id, integration_config_id, sync_type, sync_direction, status, completed_at)
    VALUES (p_user_id, v_integration_id, 'manual', 'bidirectional', 'success', NOW());
    
    RETURN jsonb_build_object('success', true, 'integration_id', v_integration_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to disconnect an integration
CREATE OR REPLACE FUNCTION disconnect_integration(
    p_user_id UUID,
    p_integration_name TEXT
) RETURNS JSONB AS $$
DECLARE
    v_integration_id UUID;
BEGIN
    -- Update integration config
    UPDATE integration_configs
    SET is_connected = false,
        config_data = '{}',
        updated_at = NOW(),
        sync_status = 'never',
        last_sync = NULL
    WHERE user_id = p_user_id 
      AND integration_name = p_integration_name
    RETURNING id INTO v_integration_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Integration not found');
    END IF;
    
    -- Log the disconnection
    INSERT INTO integration_sync_logs (user_id, integration_config_id, sync_type, sync_direction, status, completed_at)
    VALUES (p_user_id, v_integration_id, 'manual', 'bidirectional', 'success', NOW());
    
    RETURN jsonb_build_object('success', true, 'integration_id', v_integration_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 