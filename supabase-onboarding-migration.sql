-- =====================================================
-- ONBOARDING SYSTEM - DATABASE MIGRATION
-- =====================================================
-- Adds onboarding tracking columns to profiles table
-- Sets existing users as already onboarded
-- =====================================================

-- Add onboarding columns if they don't exist
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- For existing users who already have goals, mark them as onboarded
-- This prevents them from being redirected to onboarding
UPDATE profiles
SET onboarding_completed = TRUE,
    onboarding_step = 3
WHERE onboarding_completed IS NULL
   OR onboarding_completed = FALSE;

-- Create index for faster onboarding status checks
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding
  ON profiles(onboarding_completed)
  WHERE NOT onboarding_completed;

-- Update table comment
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user has completed the onboarding flow';
COMMENT ON COLUMN profiles.onboarding_step IS 'Current step in onboarding process (0-3)';
