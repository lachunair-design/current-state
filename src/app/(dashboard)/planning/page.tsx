import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlanningForm } from '@/components/PlanningForm'

// Helper to get Monday of current week
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

// Helper to get Sunday of current week
function getSunday(date: Date): Date {
  const monday = getMonday(date)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return sunday
}

export default async function PlanningPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get current week bounds
  const now = new Date()
  const weekStart = getMonday(now)
  const weekEnd = getSunday(now)
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  // Check if already planned this week
  const { data: existingPlan } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start_date', weekStartStr)
    .single() as { data: any | null }

  // Fetch user's active goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('display_order') as { data: any[] | null }

  // Fetch active tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, goals(*)')
    .eq('user_id', user.id)
    .in('status', ['active', 'deferred']) as { data: any[] | null }

  // Fetch tasks completed this week
  const { count: completedThisWeek } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('completed_at', `${weekStartStr}T00:00:00`)
    .lte('completed_at', `${weekEndStr}T23:59:59`)

  return (
    <div className="max-w-3xl mx-auto pb-8">
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📅</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Weekly Planning
          </h1>
        </div>
        <p className="text-base text-text-secondary">
          {existingPlan
            ? 'Update your plan for the week ahead'
            : 'Plan your week to stay focused and realistic about what you can accomplish'}
        </p>
      </div>

      {/* Week Overview */}
      <div className="mb-6 bg-gradient-to-br from-ocean-50 to-white border-2 border-ocean-200 rounded-2xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-text-primary">
            Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </h2>
          {existingPlan && (
            <span className="text-xs bg-accent-green/20 text-accent-green px-3 py-1 rounded-full font-semibold">
              ✓ Planned
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 text-center border border-surface-border">
            <div className="text-xl font-bold text-text-primary">{completedThisWeek || 0}</div>
            <div className="text-xs text-text-secondary mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-surface-border">
            <div className="text-xl font-bold text-text-primary">{tasks?.length || 0}</div>
            <div className="text-xs text-text-secondary mt-1">In Queue</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-surface-border">
            <div className="text-xl font-bold text-text-primary">{goals?.length || 0}</div>
            <div className="text-xs text-text-secondary mt-1">Active Goals</div>
          </div>
        </div>
      </div>

      {/* Planning Form */}
      <PlanningForm
        goals={goals || []}
        tasks={tasks || []}
        existingPlan={existingPlan}
        weekStart={weekStartStr}
        weekEnd={weekEndStr}
      />
    </div>
  )
}
