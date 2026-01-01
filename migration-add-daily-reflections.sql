-- =====================================================
-- MIGRATION: Add daily_reflections table
-- Date: 2026-01-01
-- =====================================================
-- This migration adds support for evening reflection tracking
-- =====================================================

-- Create daily_reflections table
CREATE TABLE IF NOT EXISTS daily_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reflection_date DATE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  went_well TEXT,
  would_change TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reflection_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_id ON daily_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON daily_reflections(user_id, reflection_date DESC);

-- Enable RLS
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own reflections" ON daily_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON daily_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON daily_reflections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON daily_reflections
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_daily_reflections_updated_at
  BEFORE UPDATE ON daily_reflections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- NOTES
-- =====================================================
-- Run this migration in your Supabase SQL Editor
-- After running, users can save daily reflections
-- Reflections are unique per user per date (upsert behavior)
-- =====================================================
