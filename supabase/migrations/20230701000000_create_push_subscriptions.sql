-- Create push subscriptions table
CREATE TABLE IF NOT EXISTS user_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_info JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_push_subscriptions_user_id ON user_push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_push_subscriptions_is_active ON user_push_subscriptions(is_active);

-- Add RLS policies
ALTER TABLE user_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
  ON user_push_subscriptions
  USING (auth.uid() = user_id);

-- Policy for service role to manage all subscriptions
CREATE POLICY "Service role can manage all push subscriptions"
  ON user_push_subscriptions
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_push_subscriptions_updated_at
  BEFORE UPDATE ON user_push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 