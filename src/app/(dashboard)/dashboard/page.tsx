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
    .single()

  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  // Fetch user's goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('display_order')

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Hey {firstName} 👋
        </h1>
        <p className="text-gray-600 mt-1">
          {hasCheckedInToday 
            ? "You've checked in today. Here's your progress."
            : "How's your energy today? Let's find the right tasks for you."}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link 
          href="/checkin"
          className={`card p-6 hover:border-primary-300 hover:shadow-md transition-all group ${
            !hasCheckedInToday ? 'ring-2 ring-primary-500 ring-offset-2' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900">
                {hasCheckedInToday ? 'Check in again' : 'Start your check-in'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {hasCheckedInToday 
                  ? 'Energy changed? Update your state.'
                  : '30 seconds to find your perfect tasks'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </Link>

        <Link 
          href="/tasks"
          className="card p-6 hover:border-primary-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">View all tasks</h3>
              <p className="text-sm text-gray-600 mt-1">
                {activeTasks || 0} active tasks across your goals
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{goals?.length || 0}</div>
          <div className="text-sm text-gray-600">Active Goals</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{activeTasks || 0}</div>
          <div className="text-sm text-gray-600">Active Tasks</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{completedThisWeek || 0}</div>
          <div className="text-sm text-gray-600">Done This Week</div>
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
            {goals.map((goal) => {
              const config = GOAL_CATEGORY_CONFIG[goal.category as keyof typeof GOAL_CATEGORY_CONFIG]
              return (
                <div key={goal.id} className="card p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config?.color || 'bg-gray-100'}`}>
                    <span className="text-lg">{config?.icon || '🎯'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{goal.title}</h3>
                    <p className="text-sm text-gray-500">{config?.label || goal.category}</p>
                  </div>
                  {goal.income_stream_name && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      💰 {goal.income_stream_name}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-1">No goals yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set up your goals to start matching tasks to your energy.
            </p>
            <Link href="/goals" className="btn-primary inline-flex">
              Add your first goal
            </Link>
          </div>
        )}
      </div>

      {/* Momentum message */}
      <div className="card p-6 bg-gradient-to-br from-primary-50 to-white border-primary-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">You're building momentum</h3>
            <p className="text-sm text-gray-600 mt-1">
              {completedThisWeek && completedThisWeek > 0
                ? `You've completed ${completedThisWeek} task${completedThisWeek === 1 ? '' : 's'} this week. Every small win counts.`
                : "Progress isn't about perfection. It's about showing up. Check in when you're ready."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
