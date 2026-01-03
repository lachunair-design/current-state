-- =====================================================
-- WIPE USER DATA - Start Fresh
-- =====================================================
-- This script deletes ALL data for the current user
-- Run this in Supabase SQL Editor to reset your account
-- =====================================================

-- WARNING: This will delete ALL your data including:
-- - Goals
-- - Tasks
-- - Daily commitments
-- - Weekly plans
-- - Reflections
-- - Habits and habit completions
-- - Daily responses
-- - Task suggestions
-- - Daily summaries
-- - Your profile (which resets onboarding)

-- Due to CASCADE constraints, deleting your profile will
-- automatically delete all related data.

-- =====================================================
-- OPTION 1: Delete everything (including profile)
-- =====================================================
-- This will make you go through onboarding again

DELETE FROM profiles
WHERE id = auth.uid();

-- =====================================================
-- OPTION 2: Keep profile, delete all activity data
-- =====================================================
-- Uncomment the lines below if you want to keep your
-- profile but delete all tasks, goals, commitments, etc.

-- DELETE FROM weekly_plans WHERE user_id = auth.uid();
-- DELETE FROM daily_commitments WHERE user_id = auth.uid();
-- DELETE FROM daily_reflections WHERE user_id = auth.uid();
-- DELETE FROM habit_completions WHERE user_id = auth.uid();
-- DELETE FROM habits WHERE user_id = auth.uid();
-- DELETE FROM task_suggestions WHERE user_id = auth.uid();
-- DELETE FROM daily_responses WHERE user_id = auth.uid();
-- DELETE FROM daily_summaries WHERE user_id = auth.uid();
-- DELETE FROM tasks WHERE user_id = auth.uid();
-- DELETE FROM goals WHERE user_id = auth.uid();

-- If using Option 2, also reset onboarding:
-- UPDATE profiles
-- SET onboarding_completed = false,
--     onboarding_step = 0
-- WHERE id = auth.uid();

-- =====================================================
-- After running this script:
-- =====================================================
-- 1. If you used Option 1: You'll be logged out and need to sign up again
-- 2. If you used Option 2: Refresh the page and you'll go through onboarding
-- 3. All your data will be gone - fresh start!
-- =====================================================
