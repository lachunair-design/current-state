# Product Requirements Document (PRD)
## Current State - Energy-Aware Productivity Platform

**Version**: 1.0
**Last Updated**: December 28, 2025
**Status**: Living Document
**Product Owner**: Current State Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision & Mission](#product-vision--mission)
3. [Target Users](#target-users)
4. [Core Value Proposition](#core-value-proposition)
5. [Completed Features (MVP)](#completed-features-mvp)
6. [Future Roadmap](#future-roadmap)
7. [Technical Architecture](#technical-architecture)
8. [User Stories](#user-stories)
9. [Success Metrics](#success-metrics)
10. [Implementation Timeline](#implementation-timeline)
11. [Non-Functional Requirements](#non-functional-requirements)
12. [Open Questions](#open-questions)

---

## Executive Summary

**Current State** is a productivity platform designed specifically for multi-income professionals, entrepreneurs, and knowledge workers who juggle multiple goals and revenue streams. Unlike traditional task managers, Current State uses **energy-aware matching** to recommend the right tasks at the right time based on the user's current mental, emotional, and physical state.

### Key Differentiators
- **Energy-aware task matching**: Daily check-ins assess 5 dimensions of user state
- **Multi-goal support**: Designed for people with 3-5+ concurrent goals across life domains
- **Anti-burnout philosophy**: Encourages breaks, realistic planning, and overload detection
- **SMART goal framework**: Built-in validation and guidance for effective goal setting
- **Habit tracking with flexibility**: Energy-adaptive habit completion (removed rigid version tracking)

### Current Status
- **MVP Launched**: Core features operational
- **Active Development**: High-priority enhancements in progress
- **User Feedback**: Positive reception on UX simplification and energy matching

---

## Product Vision & Mission

### Vision
To become the #1 productivity platform for multi-passionate professionals who want to achieve ambitious goals without burning out.

### Mission
Help users make meaningful progress on what truly matters by matching their energy levels, available time, and mental state with the right work at the right moment.

### Core Philosophy
1. **Energy First**: Productivity is not about doing more—it's about doing the right thing when you're in the right state
2. **Anti-Overwhelm**: Detect and prevent overload before it happens
3. **Progress Over Perfection**: Celebrate small wins and flexible completion
4. **Human-Centered**: Acknowledge that people have varying energy, emotions, and physical states

---

## Target Users

### Primary Persona: "The Multi-Passionate Professional"

**Demographics**:
- Age: 25-45
- Occupation: Freelancers, entrepreneurs, side hustlers, knowledge workers
- Income: Multiple revenue streams (2-5+ sources)
- Location: Global, primarily US, UK, Canada, Australia

**Characteristics**:
- Manages 3-8 active goals simultaneously
- Juggles career + business + health + personal projects
- Struggles with traditional task managers (too rigid, not context-aware)
- Values flexibility but needs structure
- Prone to overcommitment and burnout
- Wants financial clarity (revenue tracking per goal)

**Pain Points**:
- "I never know which task to work on first"
- "I plan too much and then feel overwhelmed"
- "My to-do list doesn't consider that I'm exhausted today"
- "I lose track of which tasks actually move the needle on my goals"
- "I need to see all my projects and income streams in one place"

**Goals**:
- Achieve ambitious professional goals without sacrificing health
- Make consistent progress across multiple life domains
- Feel in control of time and priorities
- Increase revenue while maintaining work-life balance

---

## Core Value Proposition

### The "Current State" Promise
> "Know what to work on right now, based on how you feel right now."

### How We Deliver
1. **Daily Check-In** → Assess your current state (energy, clarity, emotions, time, environment)
2. **Smart Matching** → Get 3-5 task recommendations perfectly suited to your state
3. **Flexible Execution** → Complete tasks when they fit, defer when they don't
4. **Progress Tracking** → See meaningful progress on goals that matter
5. **Burnout Prevention** → Alerts when you're overcommitted, suggests breaks

---

## Completed Features (MVP)

### 1. User Authentication & Onboarding

**Status**: ✅ Complete

**Features**:
- Email/password authentication via Supabase Auth
- Secure password reset flow
- Automatic profile creation on signup
- Multi-step onboarding wizard:
  - Welcome screen
  - Goal setting (SMART framework)
  - Task creation guidance
  - Daily check-in introduction

**Technical Details**:
- Row-level security (RLS) enforced
- Server-side session management
- Automatic profile creation via database trigger
- Onboarding state tracking (`onboarding_completed`, `onboarding_step`)

**User Flow**:
1. User signs up with email/password
2. Profile created automatically
3. Guided through 4-step onboarding
4. Lands on dashboard ready to use

---

### 2. SMART Goals Framework

**Status**: ✅ Complete

**Features**:
- **Goal Categories**: Career, Business, Finance, Health, Relationships, Personal
- **SMART Validation**: Real-time feedback on goal quality
  - Specific: Clear title and description
  - Measurable: Success metric defined
  - Achievable: Realistic scope assessment
  - Relevant: Category alignment
  - Time-bound: Target date set
- **Financial Tracking**: Estimated value, income stream name
- **Goal Management**: Create, edit, archive, complete goals
- **Expandable Goal View** (NEW): Click to expand and see all linked tasks
- **Task Count Badges**: Visual indicator of active/completed tasks per goal

**Data Model**:
```sql
goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('career', 'business', ...)),
  description TEXT,
  success_metric TEXT,
  target_date DATE,
  estimated_value NUMERIC,
  income_stream_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMPTZ
)
```

**User Stories**:
- As a user, I want to create goals that follow the SMART framework so I can ensure they're achievable
- As a user, I want to see all tasks linked to a goal so I can understand what work contributes to that goal
- As a user, I want to track estimated financial value so I can prioritize revenue-generating goals

**Success Metrics**:
- 85%+ of users create at least 1 goal during onboarding
- Average user has 3-5 active goals
- SMART validation score average: 4.2/5

---

### 3. Energy-Aware Task Management

**Status**: ✅ Complete

**Features**:
- **Task Attributes**:
  - Energy required: Low / Medium / High
  - Work type: Deep Work, Creative, Admin, Communication, Physical, Learning
  - Time estimate: Tiny (5-15m), Short (15-30m), Medium (30-60m), Long (1-2h), Extended (2h+)
  - Priority: Must Do, Should Do, Could Do, Someday
- **Smart Defaults**: Pre-filled based on task title keywords
- **Goal Linking**: Tasks automatically linked to relevant goals
- **Task Filters** (NEW): Filter by status, work type, priority
- **Restore Completed Tasks** (NEW): Undo accidental completions
- **Task Status Management**: Active, In Progress, Completed, Deferred, Archived

**Advanced Features**:
- Billable tracking (hourly rate equivalent)
- Preferred time of day / day of week
- Ideal context notes
- Recurring task patterns (future)

**Data Model**:
```sql
tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  goal_id UUID REFERENCES goals(id),
  title TEXT NOT NULL,
  energy_required TEXT CHECK (energy_required IN ('low', 'medium', 'high')),
  work_type TEXT CHECK (work_type IN ('deep_work', 'creative', 'admin', ...)),
  time_estimate TEXT CHECK (time_estimate IN ('tiny', 'short', ...)),
  priority TEXT CHECK (priority IN ('must_do', 'should_do', ...)),
  status TEXT CHECK (status IN ('active', 'in_progress', 'completed', ...)),
  estimated_value NUMERIC,
  is_billable BOOLEAN,
  completed_at TIMESTAMPTZ
)
```

**User Stories**:
- As a user, I want to tag tasks with energy requirements so the system can match them to my state
- As a user, I want to filter tasks by status and priority so I can focus on what matters now
- As a user, I want to undo completed tasks so I can fix mistakes

**Success Metrics**:
- 90%+ task completion accuracy (users don't frequently restore)
- Average task completion time matches estimates within 20%
- 75%+ of tasks have goal linkage

---

### 4. Daily Check-In System

**Status**: ✅ Complete

**Features**:
- **5-Dimensional Assessment**:
  1. Energy Level (1-5): Physical energy and alertness
  2. Mental Clarity (1-5): Focus, cognitive sharpness
  3. Emotional State (1-5): Mood, emotional resilience
  4. Available Time (1-5): Hours of uninterrupted work time
  5. Environment Quality (1-5): Workspace setup, distractions
- **Composite Score**: Auto-calculated average (1-5)
- **Optional Notes**: Freeform context
- **Task Recommendations**: 3-5 tasks matched to current state
- **Historical Tracking**: View past check-ins and patterns

**Matching Algorithm**:
```
Match Score =
  (Energy Match × 0.3) +
  (Time Availability × 0.25) +
  (Work Type Fit × 0.2) +
  (Priority Weight × 0.15) +
  (Mental Clarity × 0.1)
```

**Data Model**:
```sql
daily_responses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  energy_level INTEGER CHECK (energy_level >= 1 AND <= 5),
  mental_clarity INTEGER CHECK (mental_clarity >= 1 AND <= 5),
  emotional_state INTEGER CHECK (emotional_state >= 1 AND <= 5),
  available_time INTEGER CHECK (available_time >= 1 AND <= 5),
  environment_quality INTEGER CHECK (environment_quality >= 1 AND <= 5),
  composite_score NUMERIC GENERATED ALWAYS AS (...)
)
```

**User Stories**:
- As a user, I want to check in daily so the system understands my current state
- As a user, I want task recommendations that match my energy so I'm not overwhelmed
- As a user, I want to see how my energy patterns change over time

---

### 5. Habit Tracking (Simplified)

**Status**: ✅ Complete (Recently Simplified)

**Features**:
- **Single-Input Creation**: Just define the habit title (removed annoying 3-version system!)
- **Habit Types**: Build (positive habits) / Break (negative habits)
- **Flexible Completion**: Single "Done" button (removed Full/Scaled/Minimal buttons)
- **Goal Linking**: Connect habits to goals
- **Motivation Tracking**: "Why this helps" field
- **Best Time**: Preferred time of day
- **Target Frequency**: Daily, 3x/week, etc.
- **Celebration**: Encouraging messages on completion

**What Changed** (User Feedback):
- ❌ REMOVED: Manual scaled_version and minimal_version inputs (too annoying!)
- ❌ REMOVED: 3-button completion UI (Full/Scaled/Minimal)
- ✅ NEW: Single "Done" button for simplicity
- ✅ NEW: App will auto-suggest lighter versions based on energy (future)

**Data Model**:
```sql
habits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  habit_type TEXT CHECK (habit_type IN ('build', 'break')),
  full_version TEXT,
  scaled_version TEXT, -- Now auto-generated (undefined for manual entries)
  minimal_version TEXT, -- Now auto-generated (undefined for manual entries)
  target_frequency TEXT,
  linked_goal_id UUID REFERENCES goals(id),
  why_this_helps TEXT,
  best_time_of_day TEXT
)
```

**User Stories**:
- As a user, I want to create habits quickly without complex inputs
- As a user, I want to mark habits complete with one tap
- As a user, I want the app to suggest easier versions when I'm low energy (coming soon)

---

### 6. User Profile & Settings

**Status**: ✅ Complete

**Features**:
- **Personal Information**:
  - Full name
  - Email (read-only)
  - **Country Dropdown** (NEW): 50+ countries
  - **Auto-Timezone Detection** (NEW): Based on country selection
- **Notification Preferences**:
  - Daily check-in reminders
  - Gentle task reminders
  - Celebration notifications
- **Feature Request Form** (NEW):
  - 500-character textarea
  - Submit ideas directly to team
  - Success confirmation message
- **Account Stats**:
  - Current streak
  - Longest streak
  - Total tasks completed

**User Stories**:
- As a user, I want to set my country so my timezone is correct
- As a user, I want to request features so I can shape the product
- As a user, I want to control notifications so I'm not overwhelmed

---

### 7. Visual Enhancements

**Status**: ✅ Complete

**Features**:
- **Floating Background Shapes** (NEW):
  - 3 gradient circles with gentle float animation
  - Staggered timing for organic movement
  - Low opacity (0.1) for subtlety
- **Page Gradients**: Soft gray-to-white background
- **Celebration Confetti**: Animated confetti on task/habit completion
- **Slide-In Animations**: Content animates in on page load
- **Responsive Design**: Mobile-first, works on all screen sizes

**Design Philosophy**:
- Modern, clean aesthetic
- Not distracting or overwhelming
- Professional yet approachable
- Accessibility-first (WCAG AA compliant)

---

### 8. Dashboard & Navigation

**Status**: ✅ Complete

**Features**:
- **Top Navigation**:
  - Logo + App name
  - Dashboard, Tasks, Goals, Habits, Check-in, Profile
  - User avatar + logout
- **Dashboard Widgets**:
  - Today's check-in status
  - Recommended tasks (3-5 based on latest check-in)
  - Active goals summary
  - Recent habit completions
  - Streak tracker
- **Quick Actions**: Floating action buttons for common tasks

---

## Future Roadmap

### Phase 1: High Priority (Next 2-4 Weeks)

#### 1.1 Check-In Enhancement: "Anything Affecting You?"

**Problem**: Current check-in doesn't capture physical/mental blockers

**Solution**: Add multi-select question to daily check-in

**Features**:
- Checkbox options:
  - 😤 Bloated
  - 😡 Angry
  - 😰 Anxious
  - 😬 Nervous
  - 🤕 Headache
  - 😴 Tired
  - 🤒 Sick
  - ✍️ Other (text input)
- Store in `physical_mental_state` JSONB column
- Use data to filter out high-intensity tasks when user is struggling
- Show empathy messages: "You're feeling tired today. Here are some lighter tasks..."

**Technical Requirements**:
- Migration: Add `physical_mental_state JSONB` to `daily_responses` table
- Update check-in UI component
- Modify matching algorithm to penalize high-energy tasks when user is affected
- Add analytics: Track most common blockers

**Success Metrics**:
- 60%+ of users report at least one blocker per week
- Task completion rate increases by 15% when matched to affected state
- User satisfaction score increases on "task recommendations" question

**User Stories**:
- As a user, I want to indicate when I have a headache so I don't get intense tasks
- As a user, I want the app to understand when I'm anxious and suggest calming work
- As a user, I want to see patterns in what affects me over time

**Estimated Effort**: 3 days (1 day backend, 1 day frontend, 1 day testing)

---

#### 1.2 Task Intensity Levels

**Problem**: Current `work_type` doesn't capture cognitive load intensity

**Solution**: Add `intensity_level` field to tasks

**Features**:
- **Intensity Levels**:
  - 🪶 **Light Lift**: Low cognitive load, can do when tired
    - Examples: Responding to emails, scheduling meetings, filing documents
  - ⚖️ **Steady Focus**: Medium intensity, sustained attention
    - Examples: Research, planning, reviewing content
  - 🧠 **Deep Work**: High focus, high energy required
    - Examples: Writing, coding, strategic planning, creative work
- UI: Badge on task cards showing intensity
- Smart defaults based on work_type
- Filter tasks by intensity level
- Matching algorithm heavily weights intensity vs energy level

**Matching Logic**:
```javascript
if (userEnergy >= 4 && mentalClarity >= 4) {
  // Recommend Deep Work tasks
} else if (userEnergy >= 3) {
  // Recommend Steady Focus tasks
} else {
  // Recommend Light Lift tasks only
}
```

**Technical Requirements**:
- Migration: Add `intensity_level TEXT CHECK (intensity_level IN ('light_lift', 'steady_focus', 'deep_work'))` to tasks table
- Update task creation form
- Add intensity filter to Tasks page
- Modify matching algorithm with intensity weighting (0.35 weight)
- Backfill existing tasks with smart defaults

**Success Metrics**:
- 90%+ of new tasks have intensity level set
- Task acceptance rate increases by 20% when matched by intensity
- Users report "tasks feel more doable" in feedback

**User Stories**:
- As a user, I want to mark tasks as "light lift" so I can do them when I'm exhausted
- As a user, I want deep work tasks only recommended when I have high energy
- As a user, I want to filter tasks by intensity so I can batch similar work

**Estimated Effort**: 4 days (1 day migration, 2 days frontend, 1 day algorithm update)

---

#### 1.3 Evening Planning Reminder

**Problem**: Users forget to plan tomorrow's work

**Solution**: Daily reminder at user-specified time (e.g., 7 PM)

**Features**:
- **Settings**: User sets preferred reminder time
- **Notification Methods**:
  - Browser notification (primary)
  - Email reminder (optional)
- **Planning Interface**:
  - Review today's completions
  - Select 3-5 priority tasks for tomorrow
  - Check calendar availability (future: calendar integration)
  - Set tomorrow's focus theme
- **Smart Suggestions**: Recommend tasks based on:
  - Overdue must-do items
  - Goal deadlines approaching
  - Unfinished high-value tasks

**Technical Requirements**:
- Add `evening_reminder_time TIME` to profiles table
- Implement browser Notifications API
- Create planning dashboard page (`/planning`)
- Email reminder via Supabase Edge Functions + Resend
- Background job scheduler (cron) for reminder triggers

**Success Metrics**:
- 40%+ of users enable evening reminders
- 65%+ response rate to reminders (user opens planning interface)
- Users who plan ahead complete 25% more tasks next day

**User Stories**:
- As a user, I want a reminder to plan tomorrow so I start the day focused
- As a user, I want to review today's work before planning tomorrow
- As a user, I want to set my preferred reminder time

**Estimated Effort**: 5 days (2 days notifications, 2 days UI, 1 day backend)

---

### Phase 2: Medium Priority (Weeks 5-8)

#### 2.1 Pomodoro Timer Integration

**Problem**: Users want time tracking and focused work sessions

**Solution**: Built-in Pomodoro timer on each task

**Features**:
- **Start/Park Button** on each task card
- **Timer Display**: Visual countdown (25:00 → 00:00)
- **Work Cycles**:
  - 25 minutes work
  - 5 minutes short break
  - 15 minutes long break (after 4 cycles)
- **Timer Controls**:
  - Pause/resume
  - Skip break
  - End session early
- **Session Tracking**:
  - Total pomodoros completed per task
  - Actual time spent vs estimated time
  - Completion stats (# sessions today/this week)
- **Notifications**:
  - Browser notification on break start
  - Sound alert (optional, user configurable)
- **Break Suggestions**: Recommended activities during breaks

**Data Model**:
```sql
CREATE TABLE pomodoro_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  task_id UUID REFERENCES tasks(id),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  work_duration INTEGER, -- minutes
  break_duration INTEGER,
  cycles_completed INTEGER,
  was_interrupted BOOLEAN DEFAULT FALSE
);
```

**Technical Requirements**:
- Client-side timer with Web Workers (doesn't block UI)
- Notifications API permission request
- Persist timer state to localStorage (survive page refresh)
- Background tab detection (pause or continue?)
- Database logging for analytics

**Success Metrics**:
- 35%+ of users try Pomodoro timer
- 15%+ of active users use timer daily
- Tasks with timer usage have 30% higher completion rate

**User Stories**:
- As a user, I want to start a focused work session on a task
- As a user, I want to be reminded to take breaks
- As a user, I want to see how much time I actually spend on tasks

**Estimated Effort**: 7 days (3 days timer logic, 2 days UI, 2 days backend tracking)

---

#### 2.2 Break Time Suggestions

**Problem**: Users schedule too many back-to-back intensive tasks

**Solution**: Algorithm detects overload and suggests breaks

**Features**:
- **Detection Logic**:
  - User has 3+ Deep Work tasks scheduled consecutively
  - Total estimated work time > 4 hours without breaks
  - User's check-in shows declining energy over multiple days
- **Suggestions**:
  - "You have 6 hours of deep work planned. Consider adding a 15-minute break after task 3."
  - "Your energy has been below 3 for 3 days. Take a longer break today?"
- **Break Types**:
  - Short break (5-15 min): Walk, stretch, hydrate
  - Medium break (30 min): Lunch, exercise, meditation
  - Long break (1-2 hours): Exercise, social time, hobby
- **Educational Content**: Tips on why breaks improve focus

**Technical Requirements**:
- Task scheduling analyzer
- Energy trend analysis (daily_responses table)
- In-app notification system
- Break scheduling tool (add "Break" task type)

**Success Metrics**:
- 50%+ of users accept at least one break suggestion
- Users who take recommended breaks have 12% higher next-task completion
- Average daily energy score increases by 0.3 points

**User Stories**:
- As a user, I want to be warned when I'm planning too much intensive work
- As a user, I want suggestions for when to take breaks
- As a user, I want to understand why breaks matter

**Estimated Effort**: 4 days (2 days detection logic, 1 day UI, 1 day content)

---

#### 2.3 Calendar Integration (Google Calendar)

**Problem**: Users have calendars separate from task list

**Solution**: Two-way sync with Google Calendar

**Features**:
- **OAuth Connection**: One-click Google Calendar authorization
- **Side-by-Side View**:
  - Left pane: Task list with time estimates
  - Right pane: Calendar (day/week view)
- **Drag-and-Drop Timeblocking**:
  - Drag task from list → Drop on calendar slot
  - Creates calendar event with task title + notes
  - Task marked as "scheduled"
- **Smart Scheduling Assistant**:
  - Analyzes calendar free slots
  - Suggests optimal times based on:
    - Task energy requirements
    - User's typical energy patterns by time of day
    - Calendar availability
- **Overload Detection**:
  - "You have 8 hours of tasks but only 4 hours free on your calendar"
  - Recommendations: Defer tasks, reschedule, block focus time
- **Sync Behavior**:
  - Task completion → Mark calendar event as done
  - Calendar event completion → Mark task as completed
  - Two-way sync every 5 minutes

**Data Model**:
```sql
ALTER TABLE tasks ADD COLUMN calendar_event_id TEXT;
ALTER TABLE tasks ADD COLUMN scheduled_start TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN scheduled_end TIMESTAMPTZ;

CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  provider TEXT CHECK (provider IN ('google', 'outlook', 'apple')),
  access_token TEXT ENCRYPTED,
  refresh_token TEXT ENCRYPTED,
  calendar_id TEXT,
  last_synced_at TIMESTAMPTZ
);
```

**Technical Requirements**:
- Google Calendar API integration
- OAuth 2.0 flow (google-auth-library)
- Webhook subscriptions for calendar changes
- Conflict resolution logic (if calendar event deleted but task still active)
- Rate limiting (Google Calendar API: 1000 requests/day)

**Success Metrics**:
- 50%+ of users connect Google Calendar
- 30%+ of tasks get timeblocked to calendar
- Task completion rate increases 18% when scheduled on calendar

**User Stories**:
- As a user, I want to see my tasks and calendar together
- As a user, I want to drag tasks onto my calendar to timeblock
- As a user, I want alerts when my calendar is overbooked
- As a user, I want task completion to sync with my calendar

**Estimated Effort**: 12 days (4 days OAuth, 4 days sync logic, 3 days UI, 1 day testing)

---

#### 2.4 Weekly Planning & Review Dashboard

**Problem**: Users lack weekly visibility into progress

**Solution**: Dedicated dashboard for planning and reviewing weeks

**Features**:

**A. Weekly Planning (Sunday evening / Monday morning)**:
- Set 1-3 weekly focus goals
- Allocate tasks across the week
- Visual preview: Weekly calendar with task distribution
- Capacity check: "You have 25 hours of tasks and ~20 hours available"

**B. Weekly Review (Friday evening / Sunday)**:
- **What Got Done**:
  - Tasks completed count + full list
  - Completion rate (vs planned)
- **Time Breakdown**:
  - Pie chart: Hours spent by work type
  - Deep work: 12h, Admin: 8h, Meetings: 5h
- **Goal Progress**:
  - % progress on each active goal
  - "Goal 'Launch business' moved from 40% → 55%"
- **Energy Insights**:
  - Average daily energy levels
  - Chart: Energy by time of day (heatmap)
  - "You're most productive Tuesday/Wednesday mornings"
- **Achievements & Wins**:
  - Longest streak this week
  - High-value tasks completed
  - Encouraging summary

**Data Model**:
```sql
CREATE TABLE weekly_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  week_start_date DATE,
  focus_goals TEXT[],
  planned_task_ids UUID[],
  estimated_hours NUMERIC
);

-- Leverage existing daily_summaries table for review data
```

**Technical Requirements**:
- Date range queries (start of week, end of week)
- Aggregation queries on task completions
- Chart.js for visualizations (pie chart, heatmap)
- Weekly summary generator (Edge Function, runs Sundays)

**Success Metrics**:
- 40%+ of users view weekly review at least once
- Users who do weekly planning complete 22% more tasks
- Engagement with insights: 60%+ of users expand at least one insight

**User Stories**:
- As a user, I want to plan my week so I feel organized
- As a user, I want to see what I accomplished this week
- As a user, I want to understand my energy patterns
- As a user, I want to celebrate my progress

**Estimated Effort**: 8 days (3 days planning UI, 3 days review + analytics, 2 days charts)

---

### Phase 3: Long-Term Vision (Months 3-6)

#### 3.1 Social Login (Gmail, Apple, Microsoft)

**Problem**: Email/password signup has friction

**Solution**: One-click social login

**Features**:
- Sign in with Google
- Sign in with Apple
- Sign in with Microsoft
- Link multiple providers to one account

**Technical Requirements**:
- Supabase Auth providers configuration
- OAuth consent screens
- Email verification bypass for social logins

**Estimated Effort**: 5 days

---

#### 3.2 Import from Other Apps

**Problem**: Users have existing tasks in other tools

**Solution**: One-time import wizard

**Supported Platforms**:
- Todoist (via API)
- Notion (via API)
- Google Tasks
- Trello
- Apple Reminders (CSV export)

**Features**:
- OAuth connection to source platform
- Mapping wizard (map columns to Current State fields)
- Preview before import
- Bulk import with progress indicator

**Estimated Effort**: 10 days (2 days per platform)

---

#### 3.3 Needle-Moving Task Insights

**Problem**: Not all tasks are equally impactful

**Solution**: AI/algorithm highlights high-impact tasks

**Features**:
- ⚡ "High Impact" badge on tasks that:
  - Link to goals with tight deadlines
  - Have high estimated value
  - Block other tasks (dependencies)
  - User marked as "must do"
- Dedicated filter: "Show needle-movers only"
- Weekly summary: "Your top 3 needle-moving tasks this week"

**Estimated Effort**: 6 days

---

#### 3.4 Smart Task Deferral

**Problem**: Users keep deferring certain tasks indefinitely

**Solution**: Auto-detect procrastination patterns

**Features**:
- If task deferred 3+ times in 2 weeks → Ask: "Delete this or reschedule?"
- If user's calendar shows overload → Auto-defer non-essential tasks
- Learning: If user consistently defers a task type, stop suggesting it

**Estimated Effort**: 5 days

---

#### 3.5 Financial Clarity Module

**Status**: Needs scoping discussion with users

**Potential Features**:
- Revenue tracking per goal/income stream
- Expense allocation across goals
- Monthly financial review dashboard
- ROI calculator for business tasks
- Cash flow forecasting
- Invoice tracking integration (QuickBooks, FreshBooks)

**Open Questions**:
1. What's most valuable: Revenue tracking? Expense management? Both?
2. Should this be a separate tab or integrated into Goals?
3. Do users need budgeting tools or just tracking?
4. Integration priorities: Which accounting tools do users use?

**Estimated Effort**: TBD (pending user research)

---

## Technical Architecture

### Tech Stack

**Frontend**:
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components + Lucide React icons
- **State Management**: React hooks (useState, useEffect, useContext)
- **Forms**: React Hook Form (future)
- **Animations**: CSS keyframes, Framer Motion (future)

**Backend**:
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **API**: Supabase client (REST auto-generated from schema)
- **Edge Functions**: Supabase Edge Functions (Deno)
- **Storage**: Supabase Storage (for future image uploads)

**Infrastructure**:
- **Hosting**: Vercel (Frontend + API routes)
- **Database Hosting**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Domain**: TBD
- **SSL**: Automatic via Vercel

**DevOps**:
- **Version Control**: Git + GitHub
- **CI/CD**: Vercel auto-deploy on push to main
- **Monitoring**: Vercel Analytics (future: Sentry)
- **Logging**: Supabase logs + Vercel logs

---

### Database Schema

**Core Tables**:
1. `profiles` - User profiles and settings
2. `goals` - User goals (SMART framework)
3. `tasks` - Tasks with energy/time/priority metadata
4. `daily_responses` - Daily check-in responses
5. `task_suggestions` - Algorithm output and user feedback
6. `daily_summaries` - Aggregated daily metrics
7. `habits` - Habit tracking (build/break)
8. `habit_completions` - Habit completion log

**Future Tables**:
9. `pomodoro_sessions` - Timer tracking
10. `weekly_plans` - Weekly planning data
11. `calendar_connections` - OAuth tokens for calendar sync
12. `feature_requests` - User-submitted feature ideas

**Security**:
- Row-level security (RLS) on all tables
- Users can only access their own data
- Server-side validation on all mutations
- Encrypted sensitive fields (OAuth tokens)

---

### Key Algorithms

#### 1. Task Matching Algorithm (Current)

```javascript
function calculateMatchScore(task, userState) {
  const energyMatch =
    (task.energy_required === 'low' && userState.energy_level <= 2) ? 1.0 :
    (task.energy_required === 'medium' && userState.energy_level === 3) ? 0.9 :
    (task.energy_required === 'high' && userState.energy_level >= 4) ? 1.0 :
    0.5;

  const timeMatch =
    (task.time_estimate === 'tiny' && userState.available_time >= 1) ? 1.0 :
    (task.time_estimate === 'short' && userState.available_time >= 2) ? 0.9 :
    (task.time_estimate === 'medium' && userState.available_time >= 3) ? 0.8 :
    (task.time_estimate === 'long' && userState.available_time >= 4) ? 0.7 :
    0.4;

  const workTypeFit =
    (task.work_type === 'deep_work' && userState.mental_clarity >= 4) ? 1.0 :
    (task.work_type === 'admin' && userState.mental_clarity <= 3) ? 0.9 :
    0.7;

  const priorityWeight =
    task.priority === 'must_do' ? 1.0 :
    task.priority === 'should_do' ? 0.8 :
    task.priority === 'could_do' ? 0.5 :
    0.3;

  return (
    energyMatch * 0.3 +
    timeMatch * 0.25 +
    workTypeFit * 0.2 +
    priorityWeight * 0.15 +
    (userState.mental_clarity / 5) * 0.1
  );
}
```

#### 2. Future: Intensity-Based Matching

```javascript
function getRecommendedIntensity(userState) {
  const { energy_level, mental_clarity, physical_mental_state } = userState;

  // If user is affected by headache, sick, etc. → Light Lift only
  if (physical_mental_state && physical_mental_state.length > 0) {
    return 'light_lift';
  }

  // High energy + high clarity → Deep Work
  if (energy_level >= 4 && mental_clarity >= 4) {
    return 'deep_work';
  }

  // Medium state → Steady Focus
  if (energy_level >= 3 || mental_clarity >= 3) {
    return 'steady_focus';
  }

  // Low state → Light Lift
  return 'light_lift';
}
```

---

## User Stories

### Epic 1: Onboarding & Setup
- ✅ As a new user, I want to sign up quickly so I can start using the app
- ✅ As a new user, I want guided onboarding so I understand how to use the app
- ✅ As a new user, I want to set up my first goal so I have something to work towards

### Epic 2: Daily Workflow
- ✅ As a user, I want to check in daily so the app knows my current state
- ✅ As a user, I want task recommendations that match my energy so I'm not overwhelmed
- ✅ As a user, I want to complete tasks quickly without friction
- ⏳ As a user, I want to indicate physical/mental blockers so I get appropriate tasks
- ⏳ As a user, I want a reminder to plan tomorrow so I start focused

### Epic 3: Task Management
- ✅ As a user, I want to create tasks with energy/time metadata
- ✅ As a user, I want to filter tasks by status, priority, and type
- ✅ As a user, I want to undo completed tasks when I make mistakes
- ⏳ As a user, I want to tag tasks by intensity level
- ⏳ As a user, I want to see needle-moving tasks highlighted

### Epic 4: Goal Tracking
- ✅ As a user, I want to create SMART goals
- ✅ As a user, I want to see all tasks linked to a goal
- ✅ As a user, I want to track financial value per goal
- ⏳ As a user, I want weekly progress reports on goals

### Epic 5: Time Management
- ⏳ As a user, I want to use a Pomodoro timer on tasks
- ⏳ As a user, I want to timeblock tasks on my calendar
- ⏳ As a user, I want alerts when I'm overcommitted

### Epic 6: Insights & Analytics
- ⏳ As a user, I want to see my energy patterns over time
- ⏳ As a user, I want weekly review dashboards
- ⏳ As a user, I want to understand which tasks move the needle most

---

## Success Metrics

### North Star Metric
**Weekly Active Users (WAU) completing at least 3 tasks**

### Product Metrics

**Engagement**:
- Daily active users (DAU)
- Weekly active users (WAU)
- DAU/MAU ratio (stickiness): Target 30%+
- Average check-ins per week: Target 4+
- Average tasks completed per week: Target 8+

**Feature Adoption**:
- % users who complete onboarding: Target 85%+
- % users who create at least 1 goal: Target 90%+
- % users who create at least 3 tasks: Target 80%+
- % users who complete daily check-in 3+ times/week: Target 60%+
- % users who restore a task: <10% (low = good UX)

**Retention**:
- D1 retention: Target 60%+
- D7 retention: Target 40%+
- D30 retention: Target 25%+
- 90-day retention: Target 15%+

**Task Matching Quality**:
- Task acceptance rate (user starts suggested task): Target 70%+
- Task completion rate (accepted tasks that get done): Target 65%+
- Average match score of accepted tasks: Target 0.75+
- Decline rate with reason "too hard": <15%

**Goal Progress**:
- % goals with at least 1 linked task: Target 85%+
- Average tasks per goal: Target 5+
- % goals completed within target date: Target 40%+

**User Satisfaction**:
- NPS (Net Promoter Score): Target 40+
- Feature satisfaction ratings: Target 4.2/5
- Customer support tickets per 100 users: <5

---

## Implementation Timeline

### Q1 2026 (Weeks 1-12)

**Weeks 1-2**: Phase 1A
- Check-in enhancement: "Anything affecting you?"
- Bug fixes and performance optimization

**Weeks 3-4**: Phase 1B
- Task intensity levels
- Evening planning reminder

**Weeks 5-6**: Phase 2A
- Pomodoro timer integration (MVP)

**Weeks 7-8**: Phase 2B
- Break time suggestions
- Overload detection

**Weeks 9-12**: Phase 2C
- Calendar integration (Google Calendar)
- Side-by-side view
- Timeblocking drag-and-drop

### Q2 2026 (Weeks 13-24)

**Weeks 13-16**: Phase 3A
- Weekly planning dashboard
- Weekly review + analytics

**Weeks 17-20**: Phase 3B
- Social login (Google, Apple, Microsoft)
- Import from Todoist, Notion

**Weeks 21-24**: Phase 3C
- Needle-moving insights
- Smart task deferral
- Financial clarity scoping

### Q3 2026 (Weeks 25-36)

**TBD based on user feedback**:
- Financial clarity module
- Advanced analytics
- Mobile app (React Native PWA)
- Team collaboration features

---

## Non-Functional Requirements

### Performance
- **Page Load Time**: <2 seconds on 3G
- **Time to Interactive (TTI)**: <3 seconds
- **Database Query Time**: <200ms for 95th percentile
- **API Response Time**: <500ms for 95th percentile

### Security
- **Authentication**: Supabase Auth with JWT tokens
- **Data Encryption**: At rest (database) and in transit (HTTPS)
- **Row-Level Security**: Enforced on all tables
- **OWASP Top 10**: Mitigated (XSS, CSRF, SQL injection, etc.)
- **Password Policy**: Min 8 characters, complexity requirements
- **Session Management**: Automatic expiry after 7 days

### Accessibility
- **WCAG 2.1 Level AA Compliance**
- **Keyboard Navigation**: All features accessible via keyboard
- **Screen Reader Support**: ARIA labels, semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio for text
- **Focus Indicators**: Visible on all interactive elements

### Scalability
- **Database**: PostgreSQL supports 100K+ users
- **API Rate Limiting**: 100 requests/minute per user
- **Horizontal Scaling**: Vercel auto-scales frontend
- **Database Connection Pooling**: Supabase Pooler (max 500 connections)

### Reliability
- **Uptime Target**: 99.5% (Vercel + Supabase SLA)
- **Backup Frequency**: Daily (Supabase automatic backups)
- **Disaster Recovery**: Point-in-time recovery (7-day retention)

### Browser Support
- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile**: iOS Safari 14+, Chrome Android 90+

### Mobile Responsiveness
- **Breakpoints**: Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- **Touch Targets**: Minimum 44×44px
- **Gestures**: Swipe to complete/defer (future)

---

## Open Questions

### Product Questions

1. **Financial Clarity Scope**:
   - What specific features are most valuable to users?
   - Should it be a separate module or integrated into Goals?
   - Which accounting integrations are priority?

2. **Calendar Integration Priority**:
   - Start with Google Calendar or support multiple providers?
   - Should we support Outlook and Apple Calendar in Phase 1?

3. **Notification Strategy**:
   - Browser notifications only, or add email/SMS?
   - What's the tolerance for notification frequency?
   - Push notifications for mobile app?

4. **Import Priorities**:
   - Which task management tools do users currently use?
   - Is one-time import sufficient or need ongoing sync?

5. **Pricing Model**:
   - Freemium? Free tier limits?
   - Premium features: Which features should be gated?
   - Pricing: $8/month? $12/month? Annual discount?

### Technical Questions

1. **Mobile Strategy**:
   - Progressive Web App (PWA) first or native React Native?
   - Desktop app (Electron)?

2. **Real-Time Updates**:
   - Do we need WebSocket connections for real-time task updates?
   - Or is polling every 30 seconds sufficient?

3. **Offline Support**:
   - Should Pomodoro timer work offline?
   - Local-first architecture with sync?

4. **AI/ML Integration**:
   - Use LLMs for smarter task suggestions?
   - Sentiment analysis on check-in notes?
   - Predictive modeling for task completion time?

---

## Appendix

### A. Glossary

- **Energy-Aware Matching**: Algorithm that recommends tasks based on user's current energy, time, and mental state
- **SMART Goals**: Specific, Measurable, Achievable, Relevant, Time-bound goal framework
- **Composite Score**: Average of 5 check-in dimensions (energy, clarity, emotion, time, environment)
- **Needle-Moving Task**: High-impact task that significantly advances a goal
- **Light Lift**: Low cognitive load task suitable for low-energy states
- **Deep Work**: High-focus, high-energy task requiring uninterrupted concentration
- **Timeblocking**: Scheduling specific tasks to calendar time slots

### B. References

- PRODUCT-ROADMAP.md - Detailed feature roadmap
- SESSION-SUMMARY.md - Recent implementation summary
- DATABASE-MIGRATION-INSTRUCTIONS.md - Database setup guide
- supabase-schema.sql - Complete database schema

### C. Change Log

- **v1.0** (Dec 28, 2025): Initial PRD created
  - Documented all completed MVP features
  - Detailed Phase 1-3 roadmap
  - Added technical architecture and success metrics

---

**Document Status**: ✅ Complete
**Next Review Date**: January 15, 2026
**Owner**: Product Team
**Contributors**: Development Team, User Research

---

*This PRD is a living document and will be updated as the product evolves based on user feedback and market needs.*
