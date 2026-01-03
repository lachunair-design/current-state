-- =====================================================
-- MIGRATION: Add weekly_plans table
-- Date: 2026-01-03
-- =====================================================
-- This migration adds weekly planning tracking
-- Enables Sunday/Monday planning ritual and capacity awareness
-- =====================================================

-- =====================================================
-- WEEKLY PLANS TABLE
-- =====================================================
-- Tracks when users complete weekly planning

CREATE TABLE IF NOT EXISTS weekly_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Week identification
  week_start_date DATE NOT NULL, -- Monday of the week
  week_end_date DATE NOT NULL,   -- Sunday of the week

  -- Planning details
  planned_at TIMESTAMPTZ DEFAULT NOW(),
  focus_goal_ids UUID[] DEFAULT '{}', -- Goals to focus on this week
  notes TEXT,

  -- Capacity planning
  estimated_capacity INTEGER, -- How many tasks user thinks they can do
  actual_completed INTEGER DEFAULT 0, -- Tracked automatically

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate plans for same week
  UNIQUE(user_id, week_start_date)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_weekly_plans_user_id ON weekly_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_week_start ON weekly_plans(week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_user_week ON weekly_plans(user_id, week_start_date DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own weekly plans"
  ON weekly_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly plans"
  ON weekly_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly plans"
  ON weekly_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly plans"
  ON weekly_plans FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_weekly_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER weekly_plans_updated_at
  BEFORE UPDATE ON weekly_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_plans_updated_at();

-- =====================================================
-- NOTES
-- =====================================================
-- Run this migration in your Supabase SQL Editor
-- After running, the app will enable weekly planning flow
-- Users will be prompted to plan on Sunday/Monday
-- Planning helps set realistic capacity and focus
-- =====================================================
