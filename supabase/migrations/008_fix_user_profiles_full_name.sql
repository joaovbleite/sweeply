-- Fix user_profiles table to make full_name nullable
-- This is a hotfix for the constraint violation when updating profiles

-- Make full_name nullable
ALTER TABLE user_profiles ALTER COLUMN full_name DROP NOT NULL;

-- Update any existing records with null full_name
UPDATE user_profiles 
SET full_name = COALESCE(
    full_name,
    (SELECT COALESCE(
        auth.users.raw_user_meta_data->>'full_name',
        auth.users.raw_user_meta_data->>'name', 
        split_part(auth.users.email, '@', 1),
        'User'
    ) FROM auth.users WHERE auth.users.id = user_profiles.user_id)
)
WHERE full_name IS NULL OR full_name = '';

-- Recreate the user profile creation function with better fallbacks
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, full_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name', 
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1),
            'User'
        )
    )
    ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate key errors
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 