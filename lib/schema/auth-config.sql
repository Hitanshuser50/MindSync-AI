-- Enable Google OAuth provider in Supabase Auth

-- This is a reminder to configure Google OAuth in the Supabase dashboard:
-- 1. Go to Authentication > Providers
-- 2. Enable Google
-- 3. Add your Google Client ID and Secret
-- 4. Set the redirect URL to: https://your-domain.com/auth/callback

-- Create a users_usage table to track usage limits (optional - we're using localStorage in this implementation)
CREATE TABLE IF NOT EXISTS usage_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature)
);

-- Create policy to allow users to view and update their own usage
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_usage ON usage_limits
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY update_own_usage ON usage_limits
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY insert_own_usage ON usage_limits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Ensure subscriptions table exists for tracking premium status
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inactive',
  plan_type TEXT NOT NULL DEFAULT 'free',
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create policy to allow users to view their own subscription
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_subscription ON subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

