'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, X } from 'lucide-react'
import { Goal, GoalCategory, GOAL_CATEGORY_CONFIG, CreateGoalInput } from '@/types/database'
import { getSmartTaskSuggestions, TaskSuggestion } from '@/lib/goalTaskSuggestions'
import clsx from 'clsx'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  status: string
  goal_id: string | null
}

// Icon and color mapping for goal categories
const getGoalIconAndColor = (category: GoalCategory, title: string) => {
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes('launch') || lowerTitle.includes('start') || lowerTitle.includes('hustle')) {
    return { icon: 'rocket_launch', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', textColor: 'text-emerald-600 dark:text-emerald-400' }
  }
  if (lowerTitle.includes('promotion') || lowerTitle.includes('job') || lowerTitle.includes('career')) {
    return { icon: 'work_outline', bgColor: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-600 dark:text-amber-400' }
  }
  if (lowerTitle.includes('health') || lowerTitle.includes('fitness') || lowerTitle.includes('marathon') || lowerTitle.includes('training')) {
    return { icon: 'favorite', bgColor: 'bg-rose-100 dark:bg-rose-900/30', textColor: 'text-rose-600 dark:text-rose-400' }
  }
  if (lowerTitle.includes('save') || lowerTitle.includes('$') || lowerTitle.includes('money') || lowerTitle.includes('earn')) {
    return { icon: 'savings', bgColor: 'bg-teal-100 dark:bg-teal-900/30', textColor: 'text-teal-600 dark:text-teal-400' }
  }
  if (lowerTitle.includes('family') || lowerTitle.includes('trip') || lowerTitle.includes('vacation')) {
    return { icon: 'flight', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400' }
  }

  // Fallback based on category
  const categoryMap: Record<GoalCategory, any> = {
    career: { icon: 'work_outline', bgColor: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-600 dark:text-amber-400' },
    health: { icon: 'favorite', bgColor: 'bg-rose-100 dark:bg-rose-900/30', textColor: 'text-rose-600 dark:text-rose-400' },
    financial: { icon: 'savings', bgColor: 'bg-teal-100 dark:bg-teal-900/30', textColor: 'text-teal-600 dark:text-teal-400' },
    personal: { icon: 'spa', bgColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-600 dark:text-purple-400' },
    relationships: { icon: 'favorite', bgColor: 'bg-pink-100 dark:bg-pink-900/30', textColor: 'text-pink-600 dark:text-pink-400' },
    learning: { icon: 'school', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400' },
  }

  return categoryMap[category] || { icon: 'flag', bgColor: 'bg-stone-100 dark:bg-stone-800', textColor: 'text-stone-600 dark:text-stone-400' }
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [saving, setSaving] = useState(false)
  const [goalProgress, setGoalProgress] = useState<Record<string, { completed: number, total: number }>>({})
  const [goalTasks, setGoalTasks] = useState<Record<string, Task[]>>({})
  const [expandedGoals, setExpandedGoals] = useState<string[]>([])
  const [filterTab, setFilterTab] = useState<'active' | 'completed' | 'paused'>('active')

  // Task suggestions modal state
  const [showTaskSuggestions, setShowTaskSuggestions] = useState(false)
  const [newlyCreatedGoal, setNewlyCreatedGoal] = useState<Goal | null>(null)
  const [selectedTaskIndices, setSelectedTaskIndices] = useState<number[]>([])
  const [addingTasks, setAddingTasks] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<GoalCategory>('career')
  const [description, setDescription] = useState('')
  const [successMetric, setSuccessMetric] = useState('')
  const [incomeStream, setIncomeStream] = useState('')
  const [targetDate, setTargetDate] = useState('')

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('display_order')

    if (data) {
      setGoals(data)
      await fetchAllGoalProgress(data, user.id)
    }
    setLoading(false)
  }

  const fetchAllGoalProgress = async (goals: Goal[], userId: string) => {
    const progressData: Record<string, { completed: number, total: number }> = {}
    const tasksData: Record<string, Task[]> = {}

    for (const goal of goals) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, status, goal_id')
        .eq('user_id', userId)
        .eq('goal_id', goal.id)
        .in('status', ['active', 'completed', 'deferred'])
        .order('created_at', { ascending: true })

      const total = tasks?.length || 0
      const completed = tasks?.filter((t: any) => t.status === 'completed').length || 0
      progressData[goal.id] = { completed, total }
      tasksData[goal.id] = tasks || []
    }

    setGoalProgress(progressData)
    setGoalTasks(tasksData)
  }

  const resetForm = () => {
    setTitle('')
    setCategory('career')
    setDescription('')
    setSuccessMetric('')
    setIncomeStream('')
    setTargetDate('')
    setShowForm(false)
    setEditingGoal(null)
  }

  const saveGoal = async () => {
    if (!title.trim()) return
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const goalData: CreateGoalInput = {
        title: title.trim(),
        category,
        description: description.trim() || undefined,
        success_metric: successMetric.trim() || undefined,
        income_stream_name: incomeStream.trim() || undefined,
        target_date: targetDate || undefined,
      }

      if (editingGoal) {
        await supabase
          .from('goals')
          .update(goalData as never)
          .eq('id', editingGoal.id)
        await fetchGoals()
        resetForm()
      } else {
        const { data: createdGoal, error } = await supabase
          .from('goals')
          .insert({ ...goalData, user_id: user.id, display_order: goals.length } as never)
          .select()
          .single()

        if (!error && createdGoal) {
          await fetchGoals()
          resetForm()

          setNewlyCreatedGoal(createdGoal as Goal)
          const suggestions = getSmartTaskSuggestions((createdGoal as Goal).title, (createdGoal as Goal).category)
          setSelectedTaskIndices(suggestions.slice(0, 5).map((_, index) => index))
          setShowTaskSuggestions(true)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleGoalExpanded = (goalId: string) => {
    setExpandedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  const toggleTaskCompletion = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'active' : 'completed'
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null

    await supabase
      .from('tasks')
      .update({
        status: newStatus,
        completed_at: completedAt
      } as never)
      .eq('id', task.id)

    await fetchGoals()
  }

  const toggleTaskSelection = (index: number) => {
    if (selectedTaskIndices.includes(index)) {
      setSelectedTaskIndices(selectedTaskIndices.filter(i => i !== index))
    } else {
      setSelectedTaskIndices([...selectedTaskIndices, index])
    }
  }

  const addTasksFromSuggestions = async () => {
    if (!newlyCreatedGoal || selectedTaskIndices.length === 0) return

    setAddingTasks(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const suggestions = getSmartTaskSuggestions(newlyCreatedGoal.title, newlyCreatedGoal.category).slice(0, 5)
      const selectedSuggestions = selectedTaskIndices.map(i => suggestions[i]).filter(Boolean)

      const tasksToInsert = selectedSuggestions.map((suggestion: TaskSuggestion) => ({
        user_id: user.id,
        goal_id: newlyCreatedGoal.id,
        title: suggestion.title,
        description: suggestion.description || null,
        energy_required: suggestion.energy_required,
        work_type: suggestion.work_type,
        time_estimate: suggestion.time_estimate,
        priority: suggestion.priority,
        status: 'active',
      }))

      await supabase.from('tasks').insert(tasksToInsert as never)
      await fetchGoals()

      setShowTaskSuggestions(false)
      setNewlyCreatedGoal(null)
      setSelectedTaskIndices([])
    } finally {
      setAddingTasks(false)
    }
  }

  const skipTaskSuggestions = () => {
    setShowTaskSuggestions(false)
    setNewlyCreatedGoal(null)
    setSelectedTaskIndices([])
  }

  const addTasksManually = () => {
    if (!newlyCreatedGoal) return

    sessionStorage.setItem('pendingGoalForTasks', JSON.stringify({
      id: newlyCreatedGoal.id,
      title: newlyCreatedGoal.title
    }))

    setShowTaskSuggestions(false)
    setNewlyCreatedGoal(null)
    setSelectedTaskIndices([])
    router.push('/tasks')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-[#fafaf9] dark:bg-[#1c1917] min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-stone-600 dark:text-stone-400" />
      </div>
    )
  }

  const filteredGoals = goals.filter(g => {
    if (filterTab === 'active') return g.is_active
    if (filterTab === 'completed') return !g.is_active && g.completed_at
    if (filterTab === 'paused') return !g.is_active && !g.completed_at
    return true
  })

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#1c1917] transition-colors duration-300 antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />

      <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="font-['Playfair_Display'] text-4xl text-stone-900 dark:text-white mb-2">Your Goals</h1>
            <p className="text-stone-500 dark:text-stone-400 text-lg">Stay in your rhythm and focus on what matters.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-white px-5 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <span className="material-symbols-rounded text-xl">add</span>
            <span>New Goal</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-6 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterTab('active')}
            className={clsx(
              'whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-colors',
              filterTab === 'active'
                ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-white'
                : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            )}
          >
            Active ({goals.filter(g => g.is_active).length})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={clsx(
              'whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-colors',
              filterTab === 'completed'
                ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-white'
                : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            )}
          >
            Completed ({goals.filter(g => !g.is_active && g.completed_at).length})
          </button>
          <button
            onClick={() => setFilterTab('paused')}
            className={clsx(
              'whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-colors',
              filterTab === 'paused'
                ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-white'
                : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            )}
          >
            Paused ({goals.filter(g => !g.is_active && !g.completed_at).length})
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => {
            const progress = goalProgress[goal.id] || { completed: 0, total: 0 }
            const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0
            const iconConfig = getGoalIconAndColor(goal.category, goal.title)
            const isExpanded = expandedGoals.includes(goal.id)
            const tasks = goalTasks[goal.id] || []
            const strokeDashoffset = 100 - percentage

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-[#292524] border border-stone-200 dark:border-stone-700 rounded-3xl p-1 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <button
                    onClick={() => toggleGoalExpanded(goal.id)}
                    className="cursor-pointer p-5 flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${iconConfig.bgColor} ${iconConfig.textColor} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-rounded text-2xl">{iconConfig.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-['Playfair_Display'] font-semibold text-lg text-stone-900 dark:text-white">{goal.title}</h3>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          {GOAL_CATEGORY_CONFIG[goal.category].label} • {progress.completed} of {progress.total} tasks
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="relative w-10 h-10 flex items-center justify-center">
                        <svg className="transform -rotate-90 w-10 h-10">
                          <circle
                            className="text-stone-200 dark:text-stone-700"
                            cx="20"
                            cy="20"
                            fill="transparent"
                            r="16"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <circle
                            className={iconConfig.textColor}
                            cx="20"
                            cy="20"
                            fill="transparent"
                            r="16"
                            stroke="currentColor"
                            strokeDasharray="100"
                            strokeDashoffset={strokeDashoffset}
                            strokeWidth="3"
                          />
                        </svg>
                        <span
                          className={clsx(
                            "material-symbols-rounded absolute text-stone-400 dark:text-stone-500 transition-transform text-xl",
                            isExpanded && "rotate-180"
                          )}
                        >
                          expand_more
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Task List */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-stone-100 dark:border-stone-700/50 animate-sweep">
                      <div className="mt-4 mb-2 flex justify-between items-end">
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Next Steps</span>
                        <span className={clsx("text-xs font-medium", iconConfig.textColor)}>
                          {progress.completed} of {progress.total} complete
                        </span>
                      </div>

                      {tasks.length > 0 ? (
                        <ul className="space-y-3">
                          {tasks.map((task) => (
                            <li key={task.id} className="flex items-start gap-3 group/item">
                              <div className="mt-0.5 relative flex items-center justify-center w-5 h-5">
                                <input
                                  type="checkbox"
                                  checked={task.status === 'completed'}
                                  onChange={() => toggleTaskCompletion(task)}
                                  className="peer appearance-none w-5 h-5 border-2 border-stone-300 dark:border-stone-600 rounded-full checked:bg-emerald-500 checked:border-emerald-500 cursor-pointer transition-colors"
                                />
                                <span className="material-symbols-rounded text-white text-[14px] absolute pointer-events-none opacity-0 peer-checked:opacity-100">
                                  check
                                </span>
                              </div>
                              <span
                                className={clsx(
                                  'text-sm',
                                  task.status === 'completed'
                                    ? 'text-stone-400 dark:text-stone-500 line-through decoration-stone-400'
                                    : 'text-stone-700 dark:text-stone-300 group-hover/item:text-stone-900 dark:group-hover/item:text-white transition-colors'
                                )}
                              >
                                {task.title}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-stone-500">No tasks yet</p>
                      )}

                      <button
                        onClick={() => {
                          sessionStorage.setItem('pendingGoalForTasks', JSON.stringify({
                            id: goal.id,
                            title: goal.title
                          }))
                          router.push('/tasks')
                        }}
                        className="mt-4 w-full py-2 text-xs font-medium text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 border border-dashed border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                      >
                        + Add another task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Add New Goal Card */}
          <div
            onClick={() => setShowForm(true)}
            className="border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer min-h-[120px]"
          >
            <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-3 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
              <span className="material-symbols-rounded text-stone-400 dark:text-stone-500 text-2xl">add</span>
            </div>
            <span className="font-medium text-stone-500 dark:text-stone-400">Add a new goal</span>
          </div>
        </div>
      </div>

      {/* Add/Edit Goal Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#292524] rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-stone-900 dark:text-white">
                {editingGoal ? 'Edit Goal' : 'Add New Goal'}
              </h2>
              <button
                onClick={resetForm}
                className="text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Goal title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 transition-colors"
                  placeholder="e.g., Launch Side Hustle, Get Promoted"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(GOAL_CATEGORY_CONFIG) as GoalCategory[]).map((cat) => {
                    const config = GOAL_CATEGORY_CONFIG[cat]
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={clsx(
                          'p-3 rounded-lg border text-center transition-all',
                          category === cat
                            ? 'border-stone-900 dark:border-stone-100 bg-stone-100 dark:bg-stone-800'
                            : 'border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500'
                        )}
                      >
                        <span className="text-xl">{config.icon}</span>
                        <span className="block text-xs mt-1 text-stone-700 dark:text-stone-300">{config.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">How will you measure success?</label>
                <input
                  type="text"
                  value={successMetric}
                  onChange={e => setSuccessMetric(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 transition-colors"
                  placeholder="e.g., Get promoted, Earn $50k, Lose 20 lbs"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={saveGoal}
                  disabled={saving || !title.trim()}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingGoal ? 'Save Changes' : 'Add Goal')}
                </button>
                <button
                  onClick={resetForm}
                  className="px-5 py-3 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Suggestions Modal */}
      {showTaskSuggestions && newlyCreatedGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#292524] rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={skipTaskSuggestions}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className={`w-16 h-16 ${getGoalIconAndColor(newlyCreatedGoal.category, newlyCreatedGoal.title).bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                <span className={`material-symbols-rounded text-3xl ${getGoalIconAndColor(newlyCreatedGoal.category, newlyCreatedGoal.title).textColor}`}>
                  {getGoalIconAndColor(newlyCreatedGoal.category, newlyCreatedGoal.title).icon}
                </span>
              </div>
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-stone-900 dark:text-white mb-2">Great! Let's break this down</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm">
                Here are some tasks to help you achieve <span className="font-semibold text-stone-900 dark:text-white">"{newlyCreatedGoal.title}"</span>
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {getSmartTaskSuggestions(newlyCreatedGoal.title, newlyCreatedGoal.category).slice(0, 5).map((suggestion, index) => (
                <label
                  key={index}
                  className={clsx(
                    'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md',
                    selectedTaskIndices.includes(index)
                      ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-800'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-400 dark:hover:border-stone-500'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedTaskIndices.includes(index)}
                    onChange={() => toggleTaskSelection(index)}
                    className="mt-1 w-5 h-5 rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 dark:text-white text-sm leading-snug">{suggestion.title}</p>
                    {suggestion.description && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{suggestion.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={addTasksFromSuggestions}
                disabled={addingTasks || selectedTaskIndices.length === 0}
                className="flex-1 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingTasks ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Add {selectedTaskIndices.length} {selectedTaskIndices.length === 1 ? 'Task' : 'Tasks'}</>
                )}
              </button>
              <button
                onClick={addTasksManually}
                disabled={addingTasks}
                className="px-5 py-3 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Add manually
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes sweep {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-sweep {
          animation: sweep 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}
