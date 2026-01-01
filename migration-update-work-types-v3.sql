-- =====================================================
-- MIGRATION: Update work_type from ENUM to TEXT with CHECK constraint
-- Date: 2026-01-01
-- =====================================================
-- This migration converts work_type from a PostgreSQL ENUM to TEXT
-- and updates from 6 types to 4 simpler types
-- Old: deep_work, creative, admin, communication, physical, learning
-- New: light_lift, steady_focus, deep_work, admin
-- =====================================================

-- Step 1: Update existing tasks to map old types to new types FIRST
-- (while still using the old enum)
UPDATE tasks SET work_type = 'deep_work' WHERE work_type = 'creative';
UPDATE tasks SET work_type = 'admin' WHERE work_type = 'communication';
UPDATE tasks SET work_type = 'admin' WHERE work_type = 'physical';
UPDATE tasks SET work_type = 'deep_work' WHERE work_type = 'learning';
-- deep_work and admin remain unchanged

-- Step 2: Add a temporary column with the new TEXT type
ALTER TABLE tasks ADD COLUMN work_type_new TEXT;

-- Step 3: Copy data from old column to new column
UPDATE tasks SET work_type_new = work_type::TEXT;

-- Step 4: Drop the old ENUM column WITH CASCADE to drop dependent views
ALTER TABLE tasks DROP COLUMN work_type CASCADE;

-- Step 5: Rename the new column to work_type
ALTER TABLE tasks RENAME COLUMN work_type_new TO work_type;

-- Step 6: Set NOT NULL constraint
ALTER TABLE tasks ALTER COLUMN work_type SET NOT NULL;

-- Step 7: Set default value
ALTER TABLE tasks ALTER COLUMN work_type SET DEFAULT 'admin';

-- Step 8: Add CHECK constraint with new values
ALTER TABLE tasks ADD CONSTRAINT tasks_work_type_check
  CHECK (work_type IN ('light_lift', 'steady_focus', 'deep_work', 'admin'));

-- Step 9: Now update to the actual new values
UPDATE tasks SET work_type = 'steady_focus' WHERE work_type = 'creative';
UPDATE tasks SET work_type = 'light_lift' WHERE work_type = 'communication';
UPDATE tasks SET work_type = 'light_lift' WHERE work_type = 'physical';
UPDATE tasks SET work_type = 'steady_focus' WHERE work_type = 'learning';

-- =====================================================
-- NOTES
-- =====================================================
-- This migration will DROP any views that depend on the work_type column
-- (view_active_tasks_with_goals, view_todays_suggestions, etc.)
-- You may need to recreate these views after running this migration
-- if they are still needed by your application
-- =====================================================
