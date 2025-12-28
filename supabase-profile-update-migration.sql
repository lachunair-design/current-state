-- =====================================================
-- PROFILE UPDATE - DATABASE MIGRATION
-- =====================================================
-- Adds additional profile fields for user customization
-- =====================================================

-- Add new columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update profiles table comment
COMMENT ON TABLE profiles IS 'User profiles with preferences and settings';
