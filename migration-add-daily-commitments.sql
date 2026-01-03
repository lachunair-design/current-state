-- =====================================================
-- MIGRATION: Add daily_commitments table
-- Date: 2026-01-03
-- =====================================================
-- This migration adds tracking for daily task commitments
-- Enables the "closed loop" workflow where users commit to tasks
-- and the system tracks whether commitments are fulfilled
-- =====================================================

-- =====================================================
-- DAILY COMMITMENTS TABLE
-- =====================================================
-- Tracks when users commit to tasks as their daily focus

CREATE TABLE IF NOT EXISTS daily_commitments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Commitment details
  commitment_date DATE NOT NULL,
  committed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Fulfillment tracking
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  abandoned BOOLEAN DEFAULT FALSE,
  abandoned_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate commitments for same task on same day
  UNIQUE(user_id, task_id, commitment_date)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_daily_commitments_user_id ON daily_commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_commitments_task_id ON daily_commitments(task_id);
CREATE INDEX IF NOT EXISTS idx_daily_commitments_date ON daily_commitments(commitment_date);
CREATE INDEX IF NOT EXISTS idx_daily_commitments_completed ON daily_commitments(completed);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE daily_commitments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own commitments"
  ON daily_commitments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own commitments"
  ON daily_commitments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own commitments"
  ON daily_commitments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own commitments"
  ON daily_commitments FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- NOTES
-- =====================================================
-- Run this migration in your Supabase SQL Editor
-- After running, the app will enable the commitment workflow
-- Users will be able to commit to tasks as their daily focus
-- The system will track completion of commitments vs. tasks
-- =====================================================
