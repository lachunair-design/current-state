# Current State – Product Requirements Document (PRD)

**Version**: 3.0
**Date**: December 31, 2025
**Product Type**: Web App (PWA-ready)
**Status**: Active Build

---

## 1. Product Overview

### 1.1 Product Vision

**A calm, intelligent productivity system that helps people plan realistically, protect their energy, and make progress on what actually matters—without guilt, overload, or burnout.**

**This is not a discipline tool.**
**It is a capacity-aware planning system.**

### 1.2 Positioning (Updated)

**Removed entirely:**
- ADHD-first framing
- "Multi-income" positioning
- "Free forever" messaging

**New positioning:**

> A planning system for people who want to work sustainably, not constantly.

This makes the product:
- **Broader**
- **More professional**
- **Easier to sell**
- **Less niche-constraining**

---

## 2. Core Problems We Solve

1. People plan based on **time, not energy**
2. Calendars fill up with meetings but **ignore life**
3. To-do lists grow **without realism**
4. Mental health and recovery **are not protected**
5. Important work gets **buried under admin**
6. Users **cannot see** if their week is actually doable

---

## 3. Key Principles (Non-Negotiables)

- **Energy > time**
- **Fewer tasks > more tasks**
- **Planning must feel humane**
- **Mental health is a first-class constraint**
- **The app should push back when the plan is unrealistic**

---

## 4. Primary User Personas (Landing Page)

**Replace ADHD language with role-based clarity.**

### 4.1 Who It's For (Landing Page Section)

Examples (final copy TBD):
- **Professionals juggling demanding schedules**
- **Founders and operators managing cognitive load**
- **Knowledge workers balancing deep work and admin**
- **Anyone tired of planning days they cannot execute**

Each persona card includes:
- One-liner
- Key pain
- How Current State helps

---

## 5. Core Features (Updated & Expanded)

### 5.1 Onboarding & First-Time Experience (CRITICAL FIX)

**New Required Flow:**

1. **Sign up**
2. **Question**: "Do you want to set a goal?"
   - **Yes** → Goal flow
   - **Skip** → Empty dashboard with guidance
3. **After goal creation:**
   - User is immediately guided to add tasks/habits
   - App suggests relevant tasks/habits
   - User edits, accepts, or removes suggestions
   - Dashboard unlocks

**Goal setting without task follow-through is not allowed.**

---

### 5.2 Goal System (Fixes + Enhancements)

#### Required Fixes
- Goal creation flow currently broken
- Must redirect users to task/habit creation
- Goals dashboard must support:
  - Expand goal → view all linked tasks
  - Clear progress visibility

#### Enhancements

**Insight view:**
- Highlight "needle-moving" tasks
- Deprioritise low-impact busywork

**Weekly alignment indicator:**
- "This week supports this goal: Yes / No"

---

### 5.3 Tasks System (Major Upgrade)

#### Task Types (Mandatory)

Each task must be categorised as:
- **Light lift**
- **Steady focus**
- **Deep work**
- **Admin**

#### New Task Controls

**Start / Pause button**
- Triggers focus mode (Pomodoro-style)

**Restore completed tasks**
- Undo accidental completion

**Filters**
- Status (active, completed)
- Task type
- Goal

#### Admin Tasks (Explicit Support)

Examples:
- Call electrician
- Call mom
- Book appointment

**These must be first-class citizens, not hacks.**

---

### 5.4 Calendar Integration (Foundational)

#### Required
- Link Google / Apple Calendar
- Side-by-side view:
  - Tasks on one side
  - Calendar availability on the other

#### Behaviour
- Timeboxing made visual
- App must detect:
  - No available time
  - Overloaded days

---

### 5.5 Overload Detection & Pushback (Key Differentiator)

#### Alerts

Trigger when:
- Tasks + calendar exceed realistic capacity
- No time allocated for:
  - Exercise
  - Recovery
  - Mental health

#### App Response
- Warn the user
- Suggest:
  - Moving tasks
  - Pushing non-essential work
  - Scheduling breaks

---

### 5.6 Break & Recovery System

#### Features
- Suggest break times
- Explain why breaks improve output
- Encourage spacing between cognitive tasks

**Breaks are not optional suggestions.**
**They are structural.**

---

### 5.7 Daily Check-In (Expanded)

#### Add Question

**"Is anything affecting you today?"**

Selectable tags:
- Bloated
- Anxious
- Angry
- Nervous
- Headache
- Low energy
- Other (free text)

**This feeds task recommendations and pacing.**

---

### 5.8 Evening Planning Cue

#### Feature
Gentle nudge in the evening:
**"Want to plan tomorrow realistically?"**

#### Purpose
- Prevent chaotic mornings
- Encourage proactive pacing

---

### 5.9 Weekly Planning & Review Dashboard

#### Weekly Planning
- Capacity overview
- Goal alignment check
- Time availability snapshot

#### Weekly Review
- What got done
- Where time actually went
- Energy vs outcomes
- Goal progress delta

**This becomes the retention engine.**

---

### 5.10 Profile & Settings (Expanded)

#### Required
- Profile image upload
- Country dropdown
- Timezone auto-updates based on country
- Feature request form
- Feedback questionnaire ("Have an idea?")

---

### 5.11 Authentication & Performance

#### Required Fixes
- Remove login/signup lag
- Enable:
  - Google
  - Apple
  - Email magic links

---

### 5.12 Habits System (Bug Fix)

- Habits currently not saving
- Must persist reliably
- Habits must link to goals where relevant

---

### 5.13 Financial Clarity Tab (Phase 2)

#### Status
- Placeholder tab
- No implementation yet

#### Purpose
- Future visibility into effort vs payoff
- To be defined separately

---

### 5.14 Analytics & Instrumentation

#### Must Track
- Activation funnel
- Task completion rates
- Weekly planning usage
- Overload alert triggers
- Feature drop-offs

**Tools:**
- PostHog / Amplitude (TBD)

---

### 5.15 Education & Support

#### Required
- Setup guide
- "How this works" walkthrough
- Welcome email after signup

**No one should feel lost.**

---

### 5.16 PWA & Mobile

#### Required
- Enable "Add to Home Screen"
- Fix current mobile limitation

---

## 6. Landing Page Requirements

### Sections (In Order)
1. Clear value proposition
2. Who it's for (personas)
3. How it works
4. Founder story (yes, include)
5. Key benefits
6. CTA

---

## 7. Monetisation (Updated)

**Remove "Free forever"**

- Pricing TBD
- Trial-based or soft paywall recommended

---

## 8. Success Metrics

### Activation
- % users setting a goal
- % users adding tasks

### Engagement
- Weekly planning usage
- Check-ins per week

### Retention
- Week 4 retention
- Weekly review completion

---

## 9. Out of Scope (For Now)

- Native mobile apps
- Advanced AI
- Financial integrations
- Team features

---

## 10. Risks & Constraints

- Overbuilding before core flows stabilise
- Poor onboarding = churn
- Lag undermines trust immediately

---

## 11. Definition of "Good"

The app:
- Pushes back when plans are unrealistic
- Makes users feel calmer after planning
- Helps them do less, better
- Protects energy by design

**If it becomes another task dump, it has failed.**

---

## 12. Next Execution Priorities (Blunt)

1. **Fix onboarding + goal flow**
2. **Kill lag on auth**
3. **Calendar + task side-by-side**
4. **Overload detection**
5. **Weekly planning/review**
6. **Landing page rewrite**
7. **Analytics**

**Everything else waits.**

---

## Appendix A: Current Implementation Status (V2.0)

### Completed Features
- Soft sage theme design system
- Single-page check-in with custom visualizations
- Task suggestions modal after goal creation
- Responsive layouts across all pages
- Bottom navigation bar
- Energy-first dashboard
- Basic goal/task/habit management

### Design System
- **Color palette**: Soft sage #88B09D + pastels
- **Typography**: Manrope display font + Material Symbols
- **Components**: Glass panels, custom shadows, animations
- **Responsive**: Mobile-first with desktop optimization

### Known Issues (To Address in V3.0)
- Onboarding flow incomplete (no task/habit enforcement)
- No calendar integration
- No overload detection
- No weekly planning/review dashboard
- Habits not saving reliably
- Auth lag present
- Missing task type categorization
- No break/recovery system
- Check-in lacks "anything affecting you?" question

---

## Appendix B: Technical Architecture (Current)

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS 3.4, Google Fonts (Manrope)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel

### Database Schema (Core Tables)
1. `profiles` - User profiles and settings
2. `daily_responses` - Check-in data
3. `goals` - User goals with categories
4. `tasks` - Tasks with energy/time/priority metadata
5. `habits` - Recurring rituals
6. `habit_completions` - Habit logs

### File Structure
```
src/
├── app/
│   ├── (auth)/              # Auth pages
│   ├── (dashboard)/         # Main app
│   │   ├── page.tsx         # Dashboard
│   │   ├── checkin/         # Check-in
│   │   ├── tasks/           # Tasks
│   │   ├── goals/           # Goals
│   │   ├── habits/          # Habits
│   │   └── profile/         # Settings
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── lib/
│   └── supabase.ts          # Supabase client
└── types/                   # TypeScript types
```

---

## Appendix C: Version History

### Version 3.0 (December 31, 2025) - STRATEGIC REPOSITION
- Removed ADHD-first framing
- Removed "multi-income" positioning
- New positioning: capacity-aware planning system
- Defined 12 execution priorities
- Calendar integration now foundational
- Overload detection as key differentiator
- Weekly planning/review as retention engine
- Break & recovery system structural
- Task types mandatory
- Admin tasks first-class citizens

### Version 2.0 (December 31, 2025) - DESIGN REDESIGN
- Soft sage theme implementation
- Custom check-in visualizations
- Task suggestions modal
- Responsive improvements
- Bottom navigation
- Energy-first dashboard

### Version 1.0 (December 28, 2025) - MVP
- Basic authentication
- SMART goals framework
- Energy-aware task management
- Multi-step check-in
- Habit tracking
- Dashboard with navigation

---

**Document Status**: Strategic Reposition Complete
**Next Review**: After execution priorities 1-7 complete
**Owner**: Product Team

---

*This PRD is a living document and will be updated as the product evolves based on user feedback and execution learnings.*
