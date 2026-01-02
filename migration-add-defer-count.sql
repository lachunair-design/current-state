-- =====================================================
-- MIGRATION: Add defer_count to tasks table
-- Date: 2026-01-02
-- =====================================================
-- This migration adds tracking for how many times a task has been deferred
-- Used to trigger helpful nudges when tasks are repeatedly deferred
-- =====================================================

-- Add defer_count column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS defer_count INTEGER DEFAULT 0;

-- Set existing deferred tasks to have at least count of 1
UPDATE tasks SET defer_count = 1 WHERE status = 'deferred' AND defer_count = 0;

-- =====================================================
-- NOTES
-- =====================================================
-- Run this migration in your Supabase SQL Editor
-- After running, the app will track defer counts and show nudges
-- when tasks are deferred 3+ times
-- =====================================================
