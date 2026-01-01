-- =====================================================
-- CURRENT STATE - SUPABASE DATABASE SCHEMA
-- =====================================================
-- This schema supports the Current State productivity app
-- with energy-aware task matching for multi-income professionals.
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- Stores user profile data and onboarding state
-- One profile per auth.users record

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{"daily_checkin": true, "gentle_reminders": true}'::jsonb,
  first_task_completed_at TIMESTAMPTZ,
  streak_current INTEGER DEFAULT 0,
  streak_longest INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- GOALS TABLE
-- =====================================================
-- User-defined goals across different life domains

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('career', 'business', 'finance', 'health', 'relationships', 'personal')),
  description TEXT,
  success_metric TEXT,
  target_date DATE,
  estimated_value NUMERIC,
  income_stream_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TASKS TABLE
-- =====================================================
-- Individual tasks tagged with energy requirements

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  energy_required TEXT NOT NULL DEFAULT 'medium' CHECK (energy_required IN ('low', 'medium', 'high')),
  work_type TEXT NOT NULL DEFAULT 'admin' CHECK (work_type IN ('light_lift', 'steady_focus', 'deep_work', 'admin')),
  time_estimate TEXT NOT NULL DEFAULT 'medium' CHECK (time_estimate IN ('tiny', 'short', 'medium', 'long', 'extended')),
  priority TEXT NOT NULL DEFAULT 'should_do' CHECK (priority IN ('must_do', 'should_do', 'could_do', 'someday')),
  estimated_value NUMERIC,
  hourly_rate_equivalent NUMERIC,
  is_billable BOOLEAN DEFAULT FALSE,
  preferred_day_of_week INTEGER[],
  preferred_time_of_day TEXT[],
  ideal_context TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'deferred', 'archived')),
  completed_at TIMESTAMPTZ,
  deferred_until DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB,
  times_suggested INTEGER DEFAULT 0,
  times_accepted INTEGER DEFAULT 0,
  times_declined INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DAILY_RESPONSES TABLE
-- =====================================================
-- Stores user's daily check-in responses

CREATE TABLE IF NOT EXISTS daily_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 5),
  mental_clarity INTEGER NOT NULL CHECK (mental_clarity >= 1 AND mental_clarity <= 5),
  emotional_state INTEGER NOT NULL CHECK (emotional_state >= 1 AND emotional_state <= 5),
  available_time INTEGER NOT NULL CHECK (available_time >= 1 AND available_time <= 5),
  environment_quality INTEGER NOT NULL CHECK (environment_quality >= 1 AND environment_quality <= 5),
  composite_score NUMERIC GENERATED ALWAYS AS (
    (energy_level + mental_clarity + emotional_state + available_time + environment_quality) / 5.0
  ) STORED,
  notes TEXT,
  suggested_task_ids UUID[]
);

-- =====================================================
-- TASK_SUGGESTIONS TABLE
-- =====================================================
-- Records of which tasks were suggested to users and their responses

CREATE TABLE IF NOT EXISTS task_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  daily_response_id UUID REFERENCES daily_responses(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  suggested_at TIMESTAMPTZ DEFAULT NOW(),
  match_score NUMERIC NOT NULL,
  match_reasons TEXT[],
  user_action TEXT CHECK (user_action IN ('accepted', 'declined', 'deferred', 'completed', 'ignored')),
  responded_at TIMESTAMPTZ,
  decline_reason TEXT,
  suggestion_rank INTEGER NOT NULL
);

-- =====================================================
-- DAILY_SUMMARIES TABLE
-- =====================================================
-- Aggregated daily metrics for tracking progress

CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  tasks_accepted INTEGER DEFAULT 0,
  tasks_deferred INTEGER DEFAULT 0,
  minutes_worked INTEGER,
  value_generated NUMERIC DEFAULT 0,
  avg_energy_level NUMERIC,
  avg_mental_clarity NUMERIC,
  checkins_count INTEGER DEFAULT 0,
  goals_worked_on UUID[],
  is_active_day BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, summary_date)
);

-- =====================================================
-- DAILY REFLECTIONS TABLE
-- =====================================================
-- Stores evening reflections for tracking daily wins and learnings

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

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed) WHERE NOT onboarding_completed;

-- Goals
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_active ON goals(user_id, is_active) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_goals_display_order ON goals(user_id, display_order);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_active ON tasks(user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at) WHERE completed_at IS NOT NULL;

-- Daily Responses
CREATE INDEX IF NOT EXISTS idx_daily_responses_user_id ON daily_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_responses_user_date ON daily_responses(user_id, responded_at DESC);

-- Task Suggestions
CREATE INDEX IF NOT EXISTS idx_task_suggestions_user_id ON task_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_suggestions_daily_response ON task_suggestions(daily_response_id);
CREATE INDEX IF NOT EXISTS idx_task_suggestions_task_id ON task_suggestions(task_id);

-- Daily Summaries
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, summary_date DESC);

-- Daily Reflections
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_id ON daily_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON daily_reflections(user_id, reflection_date DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Goals: Users can only manage their own goals
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks: Users can only manage their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Daily Responses: Users can only manage their own responses
CREATE POLICY "Users can view own daily responses" ON daily_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily responses" ON daily_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily responses" ON daily_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Task Suggestions: Users can only view their own suggestions
CREATE POLICY "Users can view own task suggestions" ON task_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task suggestions" ON task_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task suggestions" ON task_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily Summaries: Users can only view their own summaries
CREATE POLICY "Users can view own daily summaries" ON daily_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily summaries" ON daily_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily summaries" ON daily_summaries
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily Reflections: Users can only manage their own reflections
CREATE POLICY "Users can view own reflections" ON daily_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON daily_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON daily_reflections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON daily_reflections
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reflections_updated_at BEFORE UPDATE ON daily_reflections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - remove in production)
-- =====================================================
-- Uncomment below to insert sample categories/defaults if needed

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Run this schema in your Supabase SQL Editor
-- 2. Make sure to configure Auth settings in Supabase Dashboard:
--    - Enable email/password authentication
--    - Set Site URL to your Vercel domain
--    - Add auth callback URL: https://your-domain.vercel.app/auth/callback
-- 3. To regenerate TypeScript types:
--    - Use Supabase CLI: supabase gen types typescript --project-id YOUR_PROJECT_ID
--    - Or manually update src/types/database.ts
-- =====================================================
