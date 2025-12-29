import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, CheckSquare } from 'lucide-react'
import { GOAL_CATEGORY_CONFIG, ENERGY_LEVEL_CONFIG, TIME_ESTIMATE_CONFIG, TimeEstimate, EnergyLevel } from '@/types/database'
import { TodaysFocusCard } from '@/components/TodaysFocusCard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: { onboarding_completed?: boolean; full_name?: string | null } | null }

  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  // Fetch user's goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('display_order') as { data: any[] | null }

  // Fetch active tasks with goal info
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, goals(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(4) as { data: any[] | null }

  // Fetch today's check-in
  const today = new Date().toISOString().split('T')[0]
  const { data: todayCheckins } = await supabase
    .from('daily_responses')
    .select('*')
    .eq('user_id', user.id)
    .gte('responded_at', `${today}T00:00:00`)
    .order('responded_at', { ascending: false })
    .limit(1) as { data: Array<{ energy_level: number }> | null }

  // Fetch completed tasks this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { count: completedThisWeek } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('completed_at', weekAgo.toISOString())

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const hasCheckedInToday = todayCheckins && todayCheckins.length > 0
  const latestCheckin = todayCheckins?.[0]

  // Get energy emoji and message
  const getEnergyDisplay = () => {
    if (!hasCheckedInToday || !latestCheckin) {
      return { emoji: '🤔', message: "Haven't checked in yet", suggestion: "Start with a quick energy check" }
    }
    const level = latestCheckin.energy_level
    if (level <= 2) return { emoji: '😴', message: 'Low energy today', suggestion: 'Easy tasks are waiting' }
    if (level <= 4) return { emoji: '😊', message: 'Good energy today', suggestion: 'Ready for steady work' }
    return { emoji: '⚡', message: 'High energy today', suggestion: 'Great time for deep work' }
  }

  const energyDisplay = getEnergyDisplay()
  const topTask = tasks?.[0]

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Compact Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-accent text-text-primary mb-1">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {firstName}
        </h1>
        <p className="text-base text-accent-green font-semibold flex items-center gap-2">
          <span className="text-xl">{energyDisplay.emoji}</span>
          {energyDisplay.message}
        </p>
      </div>

      {/* Energy State Card - Compact */}
      <Link
        href="/checkin"
        className="block mb-6 rounded-xl bg-dark-card border border-dark-border p-4 hover:bg-dark-hover hover:shadow-lg transition-all group"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent-green text-black text-xs font-bold uppercase tracking-wider mb-2">
              {hasCheckedInToday ? 'Checked In' : 'Not Yet'}
            </span>
            <h2 className="text-lg font-bold font-accent text-text-primary leading-tight">
              {energyDisplay.suggestion}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {hasCheckedInToday ? 'Tap to update' : 'Quick 30-second check-in'}
            </p>
          </div>
          <div className="text-4xl group-hover:scale-110 transition-transform">
            {energyDisplay.emoji}
          </div>
        </div>
      </Link>

      {/* Top Task Card - Single Focus */}
      {topTask && <TodaysFocusCard task={topTask} />}

      {/* Simple Stats - No Pressure */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-card border border-dark-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-text-primary">{completedThisWeek || 0}</div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Done This Week</div>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-text-primary">{tasks?.length || 0}</div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">In Parking Lot</div>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-text-primary">{goals?.length || 0}</div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Goals Active</div>
          </div>
        </div>
      </div>

      {/* Up Next - Compact List */}
      {tasks && tasks.length > 1 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold font-accent text-text-primary">Up Next</h3>
            <Link href="/tasks" className="text-sm font-medium text-accent-green hover:text-primary-500">
              See All
            </Link>
          </div>
          <div className="space-y-2">
            {tasks.slice(1, 4).map((task) => (
              <div
                key={task.id}
                className="bg-dark-card hover:bg-dark-hover border border-dark-border rounded-lg p-3 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary leading-tight truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {task.goals?.title || 'No goal'} • {TIME_ESTIMATE_CONFIG[task.time_estimate as TimeEstimate]?.label || 'Unknown time'}
                    </p>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ml-3 ${
                      ENERGY_LEVEL_CONFIG[task.energy_required as EnergyLevel]?.color || 'bg-gray-400'
                    }`}
                    title={ENERGY_LEVEL_CONFIG[task.energy_required as EnergyLevel]?.label}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!tasks || tasks.length === 0) && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center">
          <div className="text-5xl mb-3">😊</div>
          <h3 className="font-bold font-accent text-text-primary mb-2">No tasks yet?</h3>
          <p className="text-text-secondary mb-4 text-sm">
            Check in first, or add tasks to your parking lot
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/checkin" className="btn-primary text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Check In
            </Link>
            <Link href="/tasks" className="btn-secondary text-sm px-4 py-2">
              <CheckSquare className="w-4 h-4 inline mr-1" />
              Add Task
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
