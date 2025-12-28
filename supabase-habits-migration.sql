-- =====================================================
-- HABITS FEATURE - DATABASE MIGRATION
-- =====================================================
-- Adds energy-aware habit tracking with 3 habit types:
-- 1. Performance (needs high energy)
-- 2. Foundational (do regardless of energy)
-- 3. Restorative (improves low energy states)
-- =====================================================

-- =====================================================
-- HABITS TABLE
-- =====================================================
-- Stores user habits with energy-scaled versions

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Basic info
  title TEXT NOT NULL,
  habit_type TEXT NOT NULL CHECK (habit_type IN ('performance', 'foundational', 'restorative')),

  -- Three scaled versions of the habit
  full_version TEXT NOT NULL,
  scaled_version TEXT,
  minimal_version TEXT,

  -- Targeting and scheduling
  target_frequency TEXT NOT NULL DEFAULT 'daily', -- 'daily', '3x/week', '5x/week', 'when_needed'
  target_days JSONB, -- ['monday', 'wednesday', 'friday'] for specific days
  linked_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,

  -- Personal context
  why_this_helps TEXT, -- User's personal reason
  best_time_of_day TEXT, -- 'morning', 'afternoon', 'evening', 'night', 'anytime'

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HABIT COMPLETIONS TABLE
-- =====================================================
-- Tracks habit completions with energy impact data

CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Completion details
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  version_completed TEXT NOT NULL CHECK (version_completed IN ('full', 'scaled', 'minimal')),

  -- Energy tracking (to learn what helps)
  energy_level_before INTEGER CHECK (energy_level_before BETWEEN 1 AND 5),
  energy_level_after INTEGER CHECK (energy_level_after BETWEEN 1 AND 5),

  -- Optional context
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Habits indexes
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_type ON habits(habit_type);
CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(is_active);
CREATE INDEX IF NOT EXISTS idx_habits_goal ON habits(linked_goal_id);

-- Completions indexes
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON habit_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at ON habit_completions(completed_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- Habits policies
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Habit completions policies
CREATE POLICY "Users can view their own habit completions"
  ON habit_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit completions"
  ON habit_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit completions"
  ON habit_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit completions"
  ON habit_completions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp for habits
CREATE OR REPLACE FUNCTION update_habits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_habits_updated_at();
