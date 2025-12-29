import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Target, CheckSquare, TrendingUp, ArrowRight } from 'lucide-react'
import { GOAL_CATEGORY_CONFIG } from '@/types/database'

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

  // Energy is the default entry point - redirect to check-in
  redirect('/checkin')

  // Fetch user's goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('display_order') as { data: any[] | null }

  // Fetch active tasks count
  const { count: activeTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active')

  // Fetch today's check-ins
  const today = new Date().toISOString().split('T')[0]
  const { data: todayCheckins } = await supabase
    .from('daily_responses')
    .select('*')
    .eq('user_id', user.id)
    .gte('responded_at', `${today}T00:00:00`)
    .order('responded_at', { ascending: false })
    .limit(1)

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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Hey {firstName} 👋
        </h1>
        <p className="text-lg text-gray-600">
          {hasCheckedInToday
            ? "You've checked in today. Here's your progress."
            : "How's your energy today? Let's find the right tasks for you."}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8 animate-slide-in">
        <Link
          href="/checkin"
          className={`card p-6 hover:border-primary-300 hover:shadow-lg transition-all group relative overflow-hidden ${
            !hasCheckedInToday ? 'ring-2 ring-primary-500 ring-offset-2 shadow-md' : ''
          }`}
        >
          {!hasCheckedInToday && (
            <div className="absolute top-2 right-2">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
              </span>
            </div>
          )}
          <div className="flex items-start justify-between">
            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {hasCheckedInToday ? 'Check in again' : 'Start your check-in'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {hasCheckedInToday
                  ? 'Energy changed? Update your state.'
                  : '30 seconds to find your perfect tasks'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          href="/tasks"
          className="card p-6 hover:border-green-300 hover:shadow-lg transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">View all tasks</h3>
              <p className="text-sm text-gray-600 mt-1">
                {activeTasks || 0} active tasks across your goals
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 animate-scale-in">
        <div className="card p-5 text-center hover:shadow-md transition-all hover:border-primary-200 group">
          <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
            {goals?.length || 0}
          </div>
          <div className="text-sm text-gray-600 font-medium">Active Goals</div>
        </div>
        <div className="card p-5 text-center hover:shadow-md transition-all hover:border-blue-200 group">
          <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {activeTasks || 0}
          </div>
          <div className="text-sm text-gray-600 font-medium">Active Tasks</div>
        </div>
        <div className="card p-5 text-center hover:shadow-md transition-all hover:border-green-200 bg-gradient-to-br from-green-50 to-white group">
          <div className="text-3xl font-bold text-green-600 mb-1 group-hover:scale-110 transition-transform">
            {completedThisWeek || 0}
          </div>
          <div className="text-sm text-gray-700 font-medium">Done This Week</div>
        </div>
      </div>

      {/* Goals Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Goals</h2>
          <Link href="/goals" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Manage goals →
          </Link>
        </div>
        
        {goals && goals.length > 0 ? (
          <div className="space-y-3">
            {goals.map((goal, index) => {
              const config = GOAL_CATEGORY_CONFIG[goal.category as keyof typeof GOAL_CATEGORY_CONFIG]
              return (
                <div
                  key={goal.id}
                  className="card p-5 flex items-center gap-4 hover:shadow-md hover:border-primary-200 transition-all group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config?.color || 'bg-gray-100'} group-hover:scale-110 transition-transform`}>
                    <span className="text-xl">{config?.icon || '🎯'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-lg">{goal.title}</h3>
                    <p className="text-sm text-gray-500 font-medium">{config?.label || goal.category}</p>
                  </div>
                  {goal.income_stream_name && (
                    <span className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-medium">
                      💰 {goal.income_stream_name}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card p-12 text-center hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">No goals yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Set up your goals to start matching tasks to your energy.
            </p>
            <Link href="/goals" className="btn-primary inline-flex items-center gap-2 shadow-md hover:shadow-lg">
              <Target className="w-4 h-4" />
              Add your first goal
            </Link>
          </div>
        )}
      </div>

      {/* Momentum message */}
      <div className="card p-8 bg-gradient-to-br from-primary-50 via-white to-purple-50 border-primary-200 hover:shadow-md transition-all">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <TrendingUp className="w-7 h-7 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-xl mb-2">You're building momentum</h3>
            <p className="text-gray-700 leading-relaxed">
              {completedThisWeek && completedThisWeek > 0
                ? `You've completed ${completedThisWeek} task${completedThisWeek === 1 ? '' : 's'} this week. Every small win counts. 🎉`
                : "Progress isn't about perfection. It's about showing up. Check in when you're ready. 💪"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
