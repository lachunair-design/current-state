import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Target, TrendingUp, Calendar, Sparkles } from 'lucide-react'
import { GOAL_CATEGORY_CONFIG, GoalCategory } from '@/types/database'

// Helper to get Monday of current week
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

// Helper to get Sunday of current week
function getSunday(date: Date): Date {
  const monday = getMonday(date)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return sunday
}

export default async function ReviewPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get current week bounds
  const now = new Date()
  const weekStart = getMonday(now)
  const weekEnd = getSunday(now)
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  // Fetch weekly plan
  const { data: weeklyPlan } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start_date', weekStartStr)
    .single() as { data: any | null }

  // Fetch completed tasks this week
  const { data: completedTasks } = await supabase
    .from('tasks')
    .select('*, goals(*)')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('completed_at', `${weekStartStr}T00:00:00`)
    .lte('completed_at', `${weekEndStr}T23:59:59`)
    .order('completed_at', { ascending: false }) as { data: any[] | null }

  // Fetch daily commitments for the week
  const { data: weekCommitments } = await supabase
    .from('daily_commitments')
    .select('*')
    .eq('user_id', user.id)
    .gte('commitment_date', weekStartStr)
    .lte('commitment_date', weekEndStr) as { data: any[] | null }

  // Fetch focus goals if planned
  let focusGoals: any[] = []
  if (weeklyPlan?.focus_goal_ids?.length) {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .in('id', weeklyPlan.focus_goal_ids) as { data: any[] | null }
    focusGoals = data || []
  }

  // Calculate metrics
  const totalCompleted = completedTasks?.length || 0
  const estimatedCapacity = weeklyPlan?.estimated_capacity || 0
  const completionRate = estimatedCapacity > 0
    ? Math.round((totalCompleted / estimatedCapacity) * 100)
    : 0

  const totalCommitments = weekCommitments?.length || 0
  const fulfilledCommitments = weekCommitments?.filter(c => c.completed).length || 0
  const commitmentRate = totalCommitments > 0
    ? Math.round((fulfilledCommitments / totalCommitments) * 100)
    : 0

  // Group completed tasks by goal
  const tasksByGoal = completedTasks?.reduce((acc: any, task: any) => {
    const goalId = task.goal_id || 'unlinked'
    if (!acc[goalId]) {
      acc[goalId] = {
        goal: task.goals || null,
        tasks: []
      }
    }
    acc[goalId].tasks.push(task)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-7 h-7 text-sunset-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Weekly Review
          </h1>
        </div>
        <p className="text-base text-text-secondary">
          Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Celebration Banner */}
      {totalCompleted > 0 && (
        <div className="mb-6 bg-gradient-to-br from-sunset-50 to-orange-50 border-2 border-sunset-300 rounded-2xl p-6 text-center animate-scale-in">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            You completed {totalCompleted} task{totalCompleted !== 1 ? 's' : ''} this week!
          </h2>
          <p className="text-text-secondary">
            That's real progress. Celebrate it!
          </p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-surface-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-text-primary">Capacity</h3>
          </div>
          <div className="text-3xl font-bold text-text-primary mb-1">
            {completionRate}%
          </div>
          <p className="text-sm text-text-secondary">
            {totalCompleted} of {estimatedCapacity || '?'} estimated tasks
          </p>
        </div>

        <div className="bg-white border border-surface-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-accent-green" />
            <h3 className="font-semibold text-text-primary">Commitments</h3>
          </div>
          <div className="text-3xl font-bold text-text-primary mb-1">
            {commitmentRate}%
          </div>
          <p className="text-sm text-text-secondary">
            {fulfilledCommitments} of {totalCommitments} fulfilled
          </p>
        </div>
      </div>

      {/* Focus Goals Progress */}
      {focusGoals.length > 0 && (
        <div className="mb-6 bg-white border border-surface-border rounded-xl p-5">
          <h3 className="text-lg font-bold text-text-primary mb-4">Focus Goals Progress</h3>
          <div className="space-y-3">
            {focusGoals.map((goal: any) => {
              const config = GOAL_CATEGORY_CONFIG[goal.category as GoalCategory]
              const goalTasks = completedTasks?.filter(t => t.goal_id === goal.id) || []

              return (
                <div key={goal.id} className="p-3 bg-surface-hover rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{config.icon}</span>
                    <span className="font-semibold text-text-primary">{goal.title}</span>
                  </div>
                  <div className="text-sm text-text-secondary">
                    <strong>{goalTasks.length} tasks completed</strong>
                    {goalTasks.length > 0 && (
                      <ul className="mt-2 space-y-1 ml-4">
                        {goalTasks.slice(0, 3).map((task: any) => (
                          <li key={task.id} className="truncate">• {task.title}</li>
                        ))}
                        {goalTasks.length > 3 && (
                          <li className="text-text-muted">+ {goalTasks.length - 3} more</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All Completed Tasks */}
      {totalCompleted > 0 && (
        <div className="mb-6 bg-white border border-surface-border rounded-xl p-5">
          <h3 className="text-lg font-bold text-text-primary mb-4">What You Accomplished</h3>
          <div className="space-y-3">
            {Object.entries(tasksByGoal || {}).map(([goalId, data]: [string, any]) => (
              <div key={goalId}>
                {data.goal && (
                  <div className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2">
                    {data.goal.title}
                  </div>
                )}
                <ul className="space-y-1 ml-4">
                  {data.tasks.map((task: any) => (
                    <li key={task.id} className="text-sm text-text-secondary">
                      <span className="text-accent-green mr-2">✓</span>
                      {task.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="mb-6 bg-gradient-to-br from-ocean-50 to-white border border-ocean-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-text-primary mb-3">Insights</h3>
        <div className="space-y-3 text-sm text-text-secondary">
          {completionRate >= 80 && (
            <p className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-text-primary">Great capacity planning!</strong> You hit {completionRate}% of your estimate. This suggests you're getting better at predicting your bandwidth.
              </span>
            </p>
          )}
          {completionRate < 50 && estimatedCapacity > 0 && (
            <p className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-sunset-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-text-primary">Consider lowering your capacity estimate.</strong> You completed {totalCompleted} of {estimatedCapacity} tasks. Setting a more realistic target helps you feel accomplished rather than behind.
              </span>
            </p>
          )}
          {commitmentRate >= 80 && totalCommitments > 0 && (
            <p className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-text-primary">Strong commitment follow-through!</strong> You completed {commitmentRate}% of what you committed to daily. This builds trust with yourself.
              </span>
            </p>
          )}
          {totalCompleted === 0 && (
            <p className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
              <span>
                No tasks completed this week. That's okay—sometimes rest and planning matter more than execution. Consider what blocked you and how next week could be different.
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-5">
        <h3 className="text-lg font-bold text-text-primary mb-3">What's Next?</h3>
        <p className="text-sm text-text-secondary mb-4">
          Use these insights to plan a better week ahead.
        </p>
        <Link
          href="/planning"
          className="inline-flex items-center gap-2 btn-primary"
        >
          <Calendar className="w-4 h-4" />
          Plan Next Week
        </Link>
      </div>
    </div>
  )
}
