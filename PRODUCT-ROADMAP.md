# Product Roadmap - Current State

Organized feedback and feature requests with implementation priority.

---

## 🚀 Quick Wins (Can implement soon)

### Profile Enhancements
- ✅ **Image uploads** - Backend ready (avatar_url field exists), need to add file upload UI
- 🔄 **Country dropdown** - Replace text input with country selector
- 🔄 **Auto-timezone from country** - Set timezone based on country selection
- **Status**: Profile page exists, just needs these enhancements

### Task Management
- ✅ **Undo completed tasks** - Allow moving tasks back to active from completed
  - Add "Restore" button in completed tasks view
  - Update task status from 'completed' back to 'active'

- ✅ **Task filters** - Add filtering options to Tasks page
  - Status filter: Active / Completed / Deferred / All
  - Type filter: By work_type (Deep Work, Admin, Creative, etc.)
  - Priority filter: Must Do / Should Do / Could Do / Someday
  - Implementation: Dropdown filters + URL query params

### Goals Dashboard
- ✅ **Expandable goals** - Show all linked tasks when goal is expanded
  - Accordion-style expansion on goals page
  - Shows all active/completed tasks for that goal
  - Quick task completion from expanded view

---

## 🔥 High Priority (Next sprint)

### Check-in Enhancements
- **Additional question: "Anything affecting you today?"**
  - Checkbox/multi-select options:
    - 😤 Bloated
    - 😡 Angry
    - 😰 Anxious
    - 😬 Nervous
    - 🤕 Headache
    - 😴 Tired
    - 🤒 Sick
    - Other (text input)
  - Store in daily_responses table (new column: physical_mental_state)
  - Use this data to recommend lighter tasks when user is struggling

### Task Categorization
- **Work intensity levels** (beyond current work_type):
  - 🪶 **Light Lift** - Low cognitive load, can do when tired (e.g., responding to emails)
  - 🧠 **Deep Work** - Requires full focus and high energy (e.g., writing, coding)
  - ⚖️ **Steady Focus** - Medium intensity, sustained attention (e.g., research, planning)

  Implementation:
  - Add `intensity_level` field to tasks table
  - UI: Badge/tag on task cards
  - Matching: Check-in algorithm factors this in with energy levels

### Evening Planning Reminder
- **Daily planning prompt (evening)**
  - Notification/reminder at user-specified time (e.g., 7 PM)
  - Quick review: "Plan tomorrow's tasks"
  - Interface to:
    - Review today's completions
    - Select 3-5 priority tasks for tomorrow
    - Check calendar availability
  - Implementation: Browser notifications API + optional email reminder

---

## 🎯 Medium Priority (Future sprints)

### Pomodoro Timer Integration
- **Start/Park button on each task**
  - Launches focused work session
  - Built-in Pomodoro timer (25 min work / 5 min break)
  - Tracks actual time spent vs estimated time
  - Features:
    - Visual timer countdown
    - Browser notification on break/work cycle
    - Pause/resume/skip break options
    - Session history (how many pomodoros completed)

- **Break Time Suggestions**
  - Algorithm detects when user has scheduled too many back-to-back tasks
  - Suggests 15-minute breaks between intensive sessions
  - Educational: "Scheduled breaks improve focus and prevent burnout"

### Calendar Integration
- **Side-by-side view: Tasks + Calendar**
  - Left pane: Task list with time estimates
  - Right pane: Calendar (Google Calendar / Outlook / Apple Calendar)
  - Drag-and-drop tasks onto calendar to timeblock

- **Smart scheduling assistant**
  - Analyzes calendar availability
  - Suggests optimal time slots for tasks based on:
    - Task energy requirements
    - Calendar free slots
    - User's typical energy patterns

- **Overload detection**
  - Alerts when calendar + tasks exceed realistic capacity
  - Example: "You have 8 hours of tasks but only 4 hours free. Consider:"
    - Deferring non-essential tasks
    - Rescheduling lower priority items
    - Blocking time for workout/mental health activities

### Weekly Planning & Review
- **Weekly Planning Dashboard**
  - Set weekly goals
  - Allocate tasks across the week
  - Preview: Weekly calendar with task distribution

- **Weekly Review Dashboard**
  - **What got done**: Completed tasks count + list
  - **Time breakdown**: Pie chart of how time was spent
    - Deep work: X hours
    - Admin: Y hours
    - Meetings: Z hours
  - **Goal progress**: % progress on each active goal
  - **Insights**:
    - "You completed 85% of high-priority tasks"
    - "You spent 12 hours on deep work this week (+20% vs last week)"
    - "Goal 'Launch business' moved from 40% → 55% complete"
  - **Energy patterns**: When are you most productive?
    - Chart: Energy levels by time of day
    - "You're most productive Tuesday/Wednesday mornings"

### Task Intelligence
- **Needle-moving insights**
  - AI/algorithm highlights tasks with highest impact
  - Factors:
    - Links to goals with tight deadlines
    - High estimated value ($)
    - Blocks other tasks (dependencies)
    - User marked as "must do"
  - UI: ⚡ "High Impact" badge
  - Dedicated filter: "Show needle-movers"

- **Smart task deferral**
  - Automatically pushes back non-essential tasks when:
    - Calendar shows you're overbooked
    - Similar tasks haven't been touched in 2+ weeks (maybe not important?)
    - User consistently defers certain tasks
  - Asks: "You keep deferring 'X'. Delete it or reschedule?"

---

## 🔮 Long-term Vision (3-6 months)

### Authentication Enhancements
- **Social login providers**
  - ✅ Gmail (Google OAuth)
  - ✅ Apple Sign-In
  - ✅ Microsoft Account
  - Implementation: NextAuth.js or Supabase Auth
  - Benefits: Faster signup, lower friction

### Integration Ecosystem
- **Import from existing tools**
  - Todoist import
  - Notion tasks import
  - Apple Reminders sync
  - Google Tasks sync
  - Trello import
  - Implementation: API integrations + one-time import wizard

### Financial Clarity Module
**Separate tab/section for financial planning and tracking**

Ideas to explore:
- Link goals with revenue streams (already have income_stream_name field)
- Track actual earnings vs projections
- Budget allocation across goals
- ROI calculator for business tasks
- Monthly financial review
- Expense tracking integration?
- Goal-based savings tracker

**To discuss more** - What specific financial features are most important?
- Revenue tracking?
- Expense management?
- Cash flow forecasting?
- Invoice tracking?
- Tax planning?

---

## 🐛 Bug Fixes & Performance

### Signup Page Lag
- **Issue**: User reports lag on signup page
- **Investigation needed**:
  - Check for slow database queries
  - Profile creation might be slow
  - Network request waterfalls?
  - Large JavaScript bundle?
- **Action**: Add performance monitoring, optimize critical path

### Celebration System
- Already fixed with debug logging
- Monitor for any remaining issues

---

## ✅ Recently Completed

- ✅ SMART Goals wizard with real-time validation
- ✅ Smart task suggestions based on goal keywords
- ✅ Task vs Habit guidance with keyword detection
- ✅ Celebration system with confetti animation
- ✅ Habit tracker with 3 energy-aware versions
- ✅ User profile page (basic info, settings, notifications)
- ✅ Onboarding migration fix for existing users
- ✅ Energy-aware task matching system
- ✅ Daily check-in with tailored questions

---

## Implementation Priority

### Phase 1 (Next 2 weeks)
1. Task filters (status, type, priority)
2. Undo completed tasks
3. Expandable goals with linked tasks
4. Profile image upload + country dropdown + auto-timezone
5. Fix signup page lag

### Phase 2 (Weeks 3-4)
1. Check-in enhancement: "Anything affecting you?"
2. Task intensity levels (Light Lift, Deep Work, Steady Focus)
3. Evening planning reminder
4. Pomodoro timer MVP

### Phase 3 (Month 2)
1. Calendar integration (Google Calendar first)
2. Side-by-side task + calendar view
3. Smart scheduling assistant
4. Weekly planning dashboard
5. Weekly review dashboard

### Phase 4 (Month 3)
1. Social login (Google, Apple, Microsoft)
2. Task intelligence & needle-moving insights
3. Break time suggestions
4. Overload detection alerts
5. Import from other apps

### Phase 5 (Future)
1. Financial clarity module (design & scope first)
2. Advanced analytics & insights
3. Mobile app (React Native?)
4. Team collaboration features?

---

## Questions to Resolve

1. **Financial Clarity**: What specific features are most valuable?
   - Revenue tracking? Expense management? Both?
   - Connection to business goals?
   - Budgeting tools?

2. **Calendar Integration**: Which calendar provider to prioritize?
   - Google Calendar (most users?)
   - Outlook
   - Apple Calendar
   - All three?

3. **Notifications**: Preference for reminder delivery?
   - Browser notifications only?
   - Email reminders?
   - SMS? (would require Twilio integration)
   - In-app only?

4. **Task Import**: Which tools do users currently use?
   - Todoist? Notion? Google Tasks? Trello?
   - Prioritize based on user demand

---

## Notes

- All features should maintain the core philosophy: **Energy-aware productivity**
- Don't overwhelm users with complexity
- Each feature should reduce friction, not add it
- Mobile-responsive is critical (many features involve on-the-go usage)
- Offline support for pomodoro timer?
- Privacy-first: User data stays secure, no selling data

---

**Last Updated**: December 28, 2025
**Status**: Living document - will update as priorities shift
