import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, CheckSquare } from 'lucide-react'
import { GOAL_CATEGORY_CONFIG, ENERGY_LEVEL_CONFIG, TIME_ESTIMATE_CONFIG, TimeEstimate, EnergyLevel } from '@/types/database'
import { TodaysFocusCard } from '@/components/TodaysFocusCard'
import { FeedbackCard } from '@/components/FeedbackCard'
import { FeatureRequestCTA } from '@/components/FeatureRequestCTA'
import { EveningCues } from '@/components/EveningCues'
import { CommittedTasksCard } from '@/components/CommittedTasksCard'
import { WeeklyPlanningCue } from '@/components/WeeklyPlanningCue'

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
    .in('status', ['active', 'deferred'])
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

  // Fetch today's committed tasks
  const { data: committedTasks } = await supabase
    .from('daily_commitments')
    .select(`
      *,
      tasks:task_id (
        *,
        goals (*)
      )
    `)
    .eq('user_id', user.id)
    .eq('commitment_date', today)
    .eq('completed', false)
    .eq('abandoned', false) as { data: any[] | null }

  // Fetch count of tasks in parking lot (active + deferred)
  const { count: parkingLotCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['active', 'deferred'])

  // Fetch completed tasks this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { count: completedThisWeek } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('completed_at', weekAgo.toISOString())

  // Check if user has planned this week
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  const diff = monday.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  monday.setDate(diff)
  const weekStart = monday.toISOString().split('T')[0]

  const { data: weeklyPlan } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start_date', weekStart)
    .single() as { data: any | null }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const hasCheckedInToday = todayCheckins && todayCheckins.length > 0
  const latestCheckin = todayCheckins?.[0]

  // Get energy emoji and message
  const getEnergyDisplay = () => {
    if (!hasCheckedInToday || !latestCheckin) {
      return {
        emoji: '🤔',
        message: "Haven't checked in yet",
        suggestion: "Start with a quick energy check",
        readyFor: "Check your rhythm",
        color: 'bg-gray-100 text-gray-800',
        gradientFrom: 'from-gray-100',
        gradientTo: 'to-gray-50'
      }
    }
    const level = latestCheckin.energy_level
    if (level <= 2) {
      return {
        emoji: '😴',
        message: 'Your energy is low right now',
        suggestion: 'Easy tasks are waiting',
        readyFor: 'Light tasks',
        color: 'bg-orange-100 text-orange-800',
        gradientFrom: 'from-orange-50',
        gradientTo: 'to-sunset-50'
      }
    }
    if (level <= 4) {
      return {
        emoji: '😊',
        message: 'Your energy is good',
        suggestion: 'Ready for steady work',
        readyFor: 'Steady work',
        color: 'bg-ocean-100 text-ocean-800',
        gradientFrom: 'from-ocean-50',
        gradientTo: 'to-white'
      }
    }
    return {
      emoji: '⚡',
      message: 'Your energy is high today',
      suggestion: 'Great time for deep work',
      readyFor: 'Deep work',
      color: 'bg-sunset-100 text-sunset-800',
      gradientFrom: 'from-sunset-50',
      gradientTo: 'to-ocean-50'
    }
  }

  const energyDisplay = getEnergyDisplay()
  const topTask = tasks?.[0]

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Energy-First Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {firstName}
        </h1>
        <p className="text-base sm:text-lg text-text-secondary flex items-center gap-2">
          <span className="text-xl sm:text-2xl">{energyDisplay.emoji}</span>
          <span className="font-semibold">{energyDisplay.message}</span>
        </p>
      </div>

      {/* Hero Energy Card */}
      <div className={`mb-6 rounded-2xl bg-gradient-to-br ${energyDisplay.gradientFrom} ${energyDisplay.gradientTo} border-2 border-ocean-200 p-6 shadow-md animate-slide-in`}>
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full ${energyDisplay.color} text-sm font-bold uppercase tracking-wider`}>
            {hasCheckedInToday ? 'Daily Rhythm' : 'Check In'}
          </span>
          <Link
            href="/checkin"
            className="text-sm font-semibold text-ocean-600 hover:text-ocean-700 underline"
          >
            {hasCheckedInToday ? 'Update' : 'Check In Now'}
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-4xl sm:text-5xl">{energyDisplay.emoji}</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              Ready for<br />{energyDisplay.readyFor}
            </h2>
            <p className="text-sm text-text-secondary">
              {hasCheckedInToday ? energyDisplay.suggestion : 'Check in to see personalized task recommendations'}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Planning Cue */}
      <WeeklyPlanningCue hasPlanThisWeek={!!weeklyPlan} />

      {/* Evening Planning & Reflection Cues */}
      <EveningCues />

      {/* Today's Committed Tasks */}
      <CommittedTasksCard commitments={committedTasks || []} />

      {/* Today's Top Task - Energy Matched */}
      {topTask && hasCheckedInToday && !committedTasks?.length && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="w-5 h-5 text-ocean-600" />
            <h3 className="text-lg font-bold text-text-primary">Today's Top Task</h3>
          </div>
          <TodaysFocusCard task={topTask} />
        </div>
      )}

      {/* Feedback & Feature Request */}
      <FeedbackCard />
      <FeatureRequestCTA />

      {/* Simple Stats - No Pressure */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-surface-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-text-primary">{completedThisWeek || 0}</div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Done This Week</div>
          </div>
          <div className="bg-white border border-surface-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-text-primary">{parkingLotCount || 0}</div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">In Parking Lot</div>
          </div>
          <div className="bg-white border border-surface-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-text-primary">{goals?.length || 0}</div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Goals Active</div>
          </div>
        </div>
      </div>

      {/* Up Next - Compact List */}
      {tasks && tasks.length > 1 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold font-semibold text-text-primary">Up Next</h3>
            <Link href="/tasks" className="text-sm font-medium text-accent-ocean hover:text-primary-500">
              See All
            </Link>
          </div>
          <div className="space-y-2">
            {tasks.slice(1, 4).map((task) => (
              <div
                key={task.id}
                className="bg-white hover:bg-surface-hover border border-surface-border rounded-lg p-3 transition-colors"
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
        <div className="bg-white border border-surface-border rounded-xl p-8 text-center">
          <div className="text-5xl mb-3">😊</div>
          <h3 className="font-bold font-semibold text-text-primary mb-2">No tasks yet?</h3>
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
