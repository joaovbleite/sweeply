-- Create service_types table for managing service offerings and pricing
CREATE TABLE IF NOT EXISTS service_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Service Details
    name TEXT NOT NULL,
    description TEXT,
    default_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    default_duration INTEGER NOT NULL DEFAULT 120, -- in minutes
    category TEXT NOT NULL DEFAULT 'residential' CHECK (category IN ('residential', 'commercial', 'specialized')),
    is_active BOOLEAN DEFAULT true,
    
    -- Service Configuration
    requires_estimate BOOLEAN DEFAULT false,
    allow_online_booking BOOLEAN DEFAULT true,
    service_order INTEGER DEFAULT 0, -- for display ordering
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_service_types_user_id ON service_types(user_id);
CREATE INDEX idx_service_types_category ON service_types(category);
CREATE INDEX idx_service_types_active ON service_types(is_active);
CREATE INDEX idx_service_types_order ON service_types(service_order);

-- Enable Row Level Security
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own service types" ON service_types
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own service types" ON service_types
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service types" ON service_types
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service types" ON service_types
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_service_types_updated_at
    BEFORE UPDATE ON service_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default service types for new users
CREATE OR REPLACE FUNCTION create_default_service_types()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO service_types (user_id, name, description, default_price, default_duration, category, service_order)
    VALUES 
        (NEW.id, 'Standard Cleaning', 'Regular house cleaning service', 120.00, 120, 'residential', 1),
        (NEW.id, 'Deep Cleaning', 'Comprehensive deep cleaning service', 250.00, 240, 'residential', 2),
        (NEW.id, 'Move-in/Move-out', 'Cleaning for moving transitions', 200.00, 180, 'specialized', 3),
        (NEW.id, 'Office Cleaning', 'Commercial office space cleaning', 150.00, 90, 'commercial', 4)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to add default service types when user signs up
CREATE TRIGGER on_auth_user_created_service_types
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_service_types(); 