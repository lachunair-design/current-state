# Current State

**Work with your energy, not against it.**

An energy-aware productivity app for multi-income professionals. Match tasks to your actual capacity, see which work pays, and stop feeling guilty about being human.

## Features

- 🧠 **Daily Check-in** - 5 quick questions about your current state (30 seconds)
- ⚡ **Energy Matching** - Get 2-3 tasks that match your energy, time, and focus
- 🎯 **Goal Tracking** - Organize tasks under meaningful goals
- 💰 **Financial ROI** - See the dollar value of your tasks
- 🚫 **Anti-Guilt Design** - No "overdue" badges, just momentum

## Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/current-state.git
cd current-state
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase-schema.sql`
3. Go to **Settings → API** and copy your:
   - Project URL
   - Anon public key

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/current-state.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### 3. Configure Supabase Auth

In Supabase Dashboard → Authentication → URL Configuration:

1. Set **Site URL** to your Vercel domain (e.g., `https://current-state.vercel.app`)
2. Add to **Redirect URLs**: `https://your-domain.vercel.app/auth/callback`

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/      # Protected routes
│   │   ├── dashboard/    # Main dashboard
│   │   ├── checkin/      # Daily questionnaire
│   │   ├── goals/        # Goal management
│   │   ├── tasks/        # Task management
│   │   └── onboarding/   # New user setup
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── page.tsx          # Landing page
├── components/
│   └── Sidebar.tsx       # Navigation sidebar
├── lib/
│   └── supabase/         # Supabase clients
└── types/
    └── database.ts       # TypeScript types
```

## Key Design Decisions

Based on market research of 70.4M US gig workers:

1. **No "overdue" concept** - Tasks recirculate based on capacity, not guilt
2. **Energy-first matching** - Algorithm prioritizes energy level over deadline
3. **Financial visibility** - Show ROI per task to answer "which work actually pays?"
4. **Decision reduction** - Show 2-3 matched tasks, not 47 overwhelming items
5. **ADHD-friendly** - 30-second check-in, minimal cognitive load

## License

MIT

---

Built for humans with fluctuating everything.
