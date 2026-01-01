// =====================================================
// CURRENT STATE - DATABASE TYPES
// =====================================================

// Enums
export type GoalCategory = 
  | 'career'
  | 'business'
  | 'finance'
  | 'health'
  | 'relationships'
  | 'personal';

export type EnergyLevel = 'low' | 'medium' | 'high';

export type WorkType =
  | 'light_lift'
  | 'steady_focus'
  | 'deep_work'
  | 'admin';

export type TimeEstimate = 'tiny' | 'short' | 'medium' | 'long' | 'extended';

export type PriorityLevel = 'must_do' | 'should_do' | 'could_do' | 'someday';

export type TaskStatus = 'active' | 'in_progress' | 'completed' | 'deferred' | 'archived';

export type UserAction = 'accepted' | 'declined' | 'deferred' | 'completed' | 'ignored';

export type HabitType = 'performance' | 'foundational' | 'restorative';

export type HabitVersion = 'full' | 'scaled' | 'minimal';

export type FrequencyType = 'daily' | '3x/week' | '5x/week' | 'when_needed';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';

// Core Tables
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  country: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  timezone: string;
  notification_preferences: {
    daily_checkin: boolean;
    gentle_reminders: boolean;
  };
  first_task_completed_at: string | null;
  streak_current: number;
  streak_longest: number;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  category: GoalCategory;
  description: string | null;
  success_metric: string | null;
  target_date: string | null;
  estimated_value: number | null;
  income_stream_name: string | null;
  is_active: boolean;
  is_archived: boolean;
  completed_at: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  goal_id: string | null;
  title: string;
  description: string | null;
  energy_required: EnergyLevel;
  work_type: WorkType;
  time_estimate: TimeEstimate;
  priority: PriorityLevel;
  estimated_value: number | null;
  hourly_rate_equivalent: number | null;
  is_billable: boolean;
  preferred_day_of_week: number[] | null;
  preferred_time_of_day: string[] | null;
  ideal_context: string | null;
  status: TaskStatus;
  completed_at: string | null;
  deferred_until: string | null;
  is_recurring: boolean;
  recurrence_pattern: Record<string, unknown> | null;
  times_suggested: number;
  times_accepted: number;
  times_declined: number;
  created_at: string;
  updated_at: string;
}

export interface DailyResponse {
  id: string;
  user_id: string;
  responded_at: string;
  energy_level: number;
  mental_clarity: number;
  emotional_state: number;
  available_time: number;
  environment_quality: number;
  composite_score: number;
  notes: string | null;
  suggested_task_ids: string[] | null;
}

export interface TaskSuggestion {
  id: string;
  user_id: string;
  daily_response_id: string | null;
  task_id: string;
  suggested_at: string;
  match_score: number;
  match_reasons: string[];
  user_action: UserAction | null;
  responded_at: string | null;
  decline_reason: string | null;
  suggestion_rank: number;
}

export interface DailySummary {
  id: string;
  user_id: string;
  summary_date: string;
  tasks_completed: number;
  tasks_accepted: number;
  tasks_deferred: number;
  minutes_worked: number | null;
  value_generated: number;
  avg_energy_level: number | null;
  avg_mental_clarity: number | null;
  checkins_count: number;
  goals_worked_on: string[] | null;
  is_active_day: boolean;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  habit_type: HabitType;
  full_version: string;
  scaled_version: string | null;
  minimal_version: string | null;
  target_frequency: FrequencyType;
  target_days: string[] | null;
  linked_goal_id: string | null;
  why_this_helps: string | null;
  best_time_of_day: TimeOfDay | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  version_completed: HabitVersion;
  energy_level_before: number | null;
  energy_level_after: number | null;
  notes: string | null;
  created_at: string;
}

export interface DailyReflection {
  id: string;
  user_id: string;
  reflection_date: string;
  rating: number;
  went_well: string | null;
  would_change: string | null;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface TaskWithGoal extends Task {
  goal?: Goal | null;
}

export interface GoalWithTasks extends Goal {
  tasks?: Task[];
}

export interface HabitWithGoal extends Habit {
  goal?: Goal | null;
}

export interface HabitWithCompletions extends Habit {
  completions?: HabitCompletion[];
}

// Input types
export interface CreateGoalInput {
  title: string;
  category: GoalCategory;
  description?: string;
  success_metric?: string;
  target_date?: string;
  estimated_value?: number;
  income_stream_name?: string;
  display_order?: number;
}

export interface CreateTaskInput {
  title: string;
  goal_id?: string;
  description?: string;
  energy_required?: EnergyLevel;
  work_type?: WorkType;
  time_estimate?: TimeEstimate;
  priority?: PriorityLevel;
  estimated_value?: number;
  is_billable?: boolean;
}

export interface CreateDailyResponseInput {
  energy_level: number;
  mental_clarity: number;
  emotional_state: number;
  available_time: number;
  environment_quality: number;
  notes?: string;
}

export interface CreateHabitInput {
  title: string;
  habit_type: HabitType;
  full_version: string;
  scaled_version?: string;
  minimal_version?: string;
  target_frequency?: FrequencyType;
  target_days?: string[];
  linked_goal_id?: string;
  why_this_helps?: string;
  best_time_of_day?: TimeOfDay;
}

export interface CreateHabitCompletionInput {
  habit_id: string;
  version_completed: HabitVersion;
  energy_level_before?: number;
  energy_level_after?: number;
  notes?: string;
}

// UI Config
export const GOAL_CATEGORY_CONFIG: Record<GoalCategory, { label: string; icon: string; color: string }> = {
  career: { label: 'Career', icon: '💼', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  business: { label: 'Business', icon: '🚀', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  finance: { label: 'Finance', icon: '💰', color: 'bg-green-100 text-green-800 border-green-200' },
  health: { label: 'Health', icon: '❤️', color: 'bg-red-100 text-red-800 border-red-200' },
  relationships: { label: 'Relationships', icon: '👥', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  personal: { label: 'Personal', icon: '✨', color: 'bg-amber-100 text-amber-800 border-amber-200' },
};

export const ENERGY_LEVEL_CONFIG: Record<EnergyLevel, { label: string; color: string; description: string }> = {
  low: { label: 'Low Energy', color: 'bg-amber-100 text-amber-800', description: 'Quick wins & admin tasks' },
  medium: { label: 'Medium Energy', color: 'bg-blue-100 text-blue-800', description: 'Focused work & most tasks' },
  high: { label: 'High Energy', color: 'bg-green-100 text-green-800', description: 'Creative & strategic work' },
};

export const WORK_TYPE_CONFIG: Record<WorkType, { label: string; icon: string; description: string }> = {
  light_lift: { label: 'Light Lift', icon: '☁️', description: 'Low cognitive load, can do when tired' },
  steady_focus: { label: 'Steady Focus', icon: '🎯', description: 'Medium intensity, sustained attention' },
  deep_work: { label: 'Deep Work', icon: '🧠', description: 'High focus, high energy required' },
  admin: { label: 'Admin', icon: '📋', description: 'Administrative tasks like calls, bookings, emails' },
};

export const TIME_ESTIMATE_CONFIG: Record<TimeEstimate, { label: string; minutes: number }> = {
  tiny: { label: '5-15 min', minutes: 10 },
  short: { label: '15-30 min', minutes: 22 },
  medium: { label: '30-60 min', minutes: 45 },
  long: { label: '1-2 hours', minutes: 90 },
  extended: { label: '2+ hours', minutes: 180 },
};

export const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; color: string }> = {
  must_do: { label: 'Must Do', color: 'bg-red-100 text-red-800' },
  should_do: { label: 'Should Do', color: 'bg-orange-100 text-orange-800' },
  could_do: { label: 'Could Do', color: 'bg-blue-100 text-blue-800' },
  someday: { label: 'Someday', color: 'bg-gray-100 text-gray-600' },
};

export const HABIT_TYPE_CONFIG: Record<HabitType, { label: string; icon: string; color: string; description: string }> = {
  performance: {
    label: 'Performance',
    icon: '⚡',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Needs high energy - do when feeling great'
  },
  foundational: {
    label: 'Foundational',
    icon: '🌱',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Do regardless of energy - your daily anchors'
  },
  restorative: {
    label: 'Restorative',
    icon: '💆',
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Helps when energy is low - improves your state'
  },
};

export const FREQUENCY_CONFIG: Record<FrequencyType, { label: string; description: string }> = {
  daily: { label: 'Daily', description: 'Every day' },
  '3x/week': { label: '3x per week', description: 'Three times weekly' },
  '5x/week': { label: '5x per week', description: 'Five times weekly (weekdays)' },
  when_needed: { label: 'When needed', description: 'As needed, no fixed schedule' },
};

export const TIME_OF_DAY_CONFIG: Record<TimeOfDay, { label: string; icon: string }> = {
  morning: { label: 'Morning', icon: '🌅' },
  afternoon: { label: 'Afternoon', icon: '☀️' },
  evening: { label: 'Evening', icon: '🌆' },
  night: { label: 'Night', icon: '🌙' },
  anytime: { label: 'Anytime', icon: '🕐' },
};

// Questionnaire config
export const QUESTIONNAIRE_QUESTIONS = [
  {
    id: 'energy_level' as const,
    question: "How's your energy right now?",
    lowLabel: 'Running on empty',
    highLabel: 'Fully charged',
    icon: '⚡',
  },
  {
    id: 'mental_clarity' as const,
    question: 'How clear is your thinking?',
    lowLabel: 'Foggy',
    highLabel: 'Crystal clear',
    icon: '🧠',
  },
  {
    id: 'emotional_state' as const,
    question: 'How are you feeling emotionally?',
    lowLabel: 'Stressed',
    highLabel: 'Calm & positive',
    icon: '💭',
  },
  {
    id: 'available_time' as const,
    question: 'How much time do you have?',
    lowLabel: 'Just a few minutes',
    highLabel: 'Hours of deep work',
    icon: '⏰',
  },
  {
    id: 'environment_quality' as const,
    question: "What's your environment like?",
    lowLabel: 'Distracting',
    highLabel: 'Perfect focus zone',
    icon: '🏠',
  },
];

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, 'id' | 'email'>;
        Update: Partial<Profile>;
      };
      goals: {
        Row: Goal;
        Insert: Omit<Goal, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Goal>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'times_suggested' | 'times_accepted' | 'times_declined'>;
        Update: Partial<Task>;
      };
      daily_responses: {
        Row: DailyResponse;
        Insert: Omit<DailyResponse, 'id' | 'responded_at' | 'composite_score' | 'notes' | 'suggested_task_ids'> & Partial<Pick<DailyResponse, 'notes' | 'suggested_task_ids'>>;
        Update: Partial<DailyResponse>;
      };
      task_suggestions: {
        Row: TaskSuggestion;
        Insert: Omit<TaskSuggestion, 'id' | 'suggested_at'>;
        Update: Partial<TaskSuggestion>;
      };
      daily_summaries: {
        Row: DailySummary;
        Insert: Omit<DailySummary, 'id' | 'created_at'>;
        Update: Partial<DailySummary>;
      };
      habits: {
        Row: Habit;
        Insert: Omit<Habit, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Habit>;
      };
      habit_completions: {
        Row: HabitCompletion;
        Insert: Omit<HabitCompletion, 'id' | 'created_at' | 'completed_at'>;
        Update: Partial<HabitCompletion>;
      };
      daily_reflections: {
        Row: DailyReflection;
        Insert: Omit<DailyReflection, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<DailyReflection>;
      };
    };
  };
}
