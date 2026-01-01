-- =====================================================
-- MIGRATION: Update work_type enum values
-- Date: 2026-01-01
-- =====================================================
-- This migration updates the work_type constraint from 6 types to 4 simpler types
-- Old: deep_work, creative, admin, communication, physical, learning
-- New: light_lift, steady_focus, deep_work, admin
-- =====================================================

-- Step 1: Drop the existing constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_work_type_check;

-- Step 2: Add the new constraint with updated values
ALTER TABLE tasks ADD CONSTRAINT tasks_work_type_check
  CHECK (work_type IN ('light_lift', 'steady_focus', 'deep_work', 'admin'));

-- Step 3: Update existing tasks to map old types to new types
-- This preserves existing data by mapping to the closest equivalent

UPDATE tasks SET work_type = 'steady_focus' WHERE work_type = 'creative';
UPDATE tasks SET work_type = 'light_lift' WHERE work_type = 'communication';
UPDATE tasks SET work_type = 'light_lift' WHERE work_type = 'physical';
UPDATE tasks SET work_type = 'steady_focus' WHERE work_type = 'learning';
-- deep_work and admin remain unchanged

-- =====================================================
-- NOTES
-- =====================================================
-- Run this migration in your Supabase SQL Editor
-- After running, all new tasks will use the simplified 4-type system
-- Existing tasks will be mapped to the new types automatically
-- =====================================================
