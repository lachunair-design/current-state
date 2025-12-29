'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Target, Loader2, X, MoreVertical, Trash2, Edit2, Sparkles, CheckSquare, ChevronDown, ChevronRight, Check } from 'lucide-react'
import { Goal, GoalCategory, GOAL_CATEGORY_CONFIG, CreateGoalInput, Task, ENERGY_LEVEL_CONFIG, PRIORITY_CONFIG } from '@/types/database'
import { getSmartTaskSuggestions, TaskSuggestion } from '@/lib/goalTaskSuggestions'
import clsx from 'clsx'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [saving, setSaving] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [showTaskSuggestions, setShowTaskSuggestions] = useState(false)
  const [suggestedTasks, setSuggestedTasks] = useState<TaskSuggestion[]>([])
  const [newGoalId, setNewGoalId] = useState<string | null>(null)
  const [addingTask, setAddingTask] = useState<string | null>(null)
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())
  const [goalTasks, setGoalTasks] = useState<Record<string, Task[]>>({})
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set())
  const [showAllGoals, setShowAllGoals] = useState(false)
  const supabase = createClient()

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

    setGoals(data || [])
    setLoading(false)
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

  const openEditForm = (goal: Goal) => {
    setEditingGoal(goal)
    setTitle(goal.title)
    setCategory(goal.category)
    setDescription(goal.description || '')
    setSuccessMetric(goal.success_metric || '')
    setIncomeStream(goal.income_stream_name || '')
    setTargetDate(goal.target_date || '')
    setShowForm(true)
    setMenuOpen(null)
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
        // Insert new goal and get the ID
        const { data: newGoalData } = await supabase
          .from('goals')
          .insert({ ...goalData, user_id: user.id, display_order: goals.length } as never)
          .select()
          .single() as { data: any }

        await fetchGoals()

        // Show task suggestions for new goals
        if (newGoalData) {
          const suggestions = getSmartTaskSuggestions(title.trim(), category)
          setSuggestedTasks(suggestions)
          setNewGoalId(newGoalData.id)
          setShowTaskSuggestions(true)
        }

        resetForm()
      }
    } finally {
      setSaving(false)
    }
  }

  const addSuggestedTask = async (suggestion: TaskSuggestion) => {
    if (!newGoalId) return
    setAddingTask(suggestion.title)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          goal_id: newGoalId,
          title: suggestion.title,
          description: suggestion.description,
          energy_required: suggestion.energy_required,
          work_type: suggestion.work_type,
          time_estimate: suggestion.time_estimate,
          priority: suggestion.priority,
          status: 'active',
        } as never)

      // Remove from suggestions list
      setSuggestedTasks(suggestedTasks.filter(t => t.title !== suggestion.title))
    } finally {
      setAddingTask(null)
    }
  }

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Delete this goal? Tasks linked to it will become unlinked.')) return

    await supabase.from('goals').update({ is_active: false } as never).eq('id', goalId)
    setGoals(goals.filter(g => g.id !== goalId))
    setMenuOpen(null)
  }

  const toggleGoalExpansion = async (goalId: string) => {
    const newExpanded = new Set(expandedGoals)

    if (expandedGoals.has(goalId)) {
      // Collapse
      newExpanded.delete(goalId)
      setExpandedGoals(newExpanded)
    } else {
      // Expand and fetch tasks if not already loaded
      newExpanded.add(goalId)
      setExpandedGoals(newExpanded)

      if (!goalTasks[goalId]) {
        await fetchGoalTasks(goalId)
      }
    }
  }

  const fetchGoalTasks = async (goalId: string) => {
    setLoadingTasks(new Set(loadingTasks).add(goalId))

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('goal_id', goalId)
      .in('status', ['active', 'completed'])
      .order('status')
      .order('created_at', { ascending: false })

    setGoalTasks(prev => ({ ...prev, [goalId]: data || [] }))
    setLoadingTasks(prev => {
      const newSet = new Set(prev)
      newSet.delete(goalId)
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Destinations</h1>
          <p className="text-lg text-gray-600">What you're working toward</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" /> Add Goal
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Goal title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input"
                  placeholder="e.g., Land a new job, Launch my business"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Category</label>
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
                          category === cat ? `${config.color} border-current` : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <span className="text-xl">{config.icon}</span>
                        <span className="block text-xs mt-1">{config.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="label">How will you measure success?</label>
                <input
                  type="text"
                  value={successMetric}
                  onChange={e => setSuccessMetric(e.target.value)}
                  className="input"
                  placeholder="e.g., Get promoted, Earn $50k, Lose 20 lbs"
                />
                <p className="text-xs text-gray-500 mt-1">What does "done" look like?</p>
              </div>

              <div>
                <label className="label">Why does this matter? (optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input"
                  placeholder="e.g., Financial freedom, career growth"
                />
              </div>

              <div>
                <label className="label">Income stream name (optional)</label>
                <input
                  type="text"
                  value={incomeStream}
                  onChange={e => setIncomeStream(e.target.value)}
                  className="input"
                  placeholder="e.g., Freelance clients, Consulting"
                />
                <p className="text-xs text-gray-500 mt-1">Add this if this goal generates income</p>
              </div>

              <div>
                <label className="label">Target date (optional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">When do you want to achieve this goal?</p>
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={saveGoal} disabled={saving || !title.trim()} className="btn-primary flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editingGoal ? 'Save Changes' : 'Add Goal')}
                </button>
                <button onClick={resetForm} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Suggestions Modal */}
      {showTaskSuggestions && suggestedTasks.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Suggested Tasks</h2>
                  <p className="text-sm text-gray-600">Get started faster with smart suggestions</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowTaskSuggestions(false)
                  setNewGoalId(null)
                  setSuggestedTasks([])
                }}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-700 mb-6">
              Based on your goal, here are some tasks to help you get started. Click to add any that are relevant:
            </p>

            <div className="space-y-3">
              {suggestedTasks.map((suggestion, index) => (
                <div
                  key={index}
                  className="card p-4 hover:shadow-md transition-all animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <CheckSquare className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h3>
                      {suggestion.description && (
                        <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                          {suggestion.energy_required} energy
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                          {suggestion.time_estimate}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                          {suggestion.priority.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => addSuggestedTask(suggestion)}
                      disabled={addingTask === suggestion.title}
                      className="btn-primary text-sm px-4 py-2 flex-shrink-0"
                    >
                      {addingTask === suggestion.title ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Add Task'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTaskSuggestions(false)
                  setNewGoalId(null)
                  setSuggestedTasks([])
                }}
                className="btn-secondary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="space-y-4">
          {goals.length > 3 && !showAllGoals && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1 text-sm text-yellow-900">
                  <p className="font-semibold mb-1">Focus mode: Showing 3 goals</p>
                  <p>Too many goals can overwhelm. We're showing your first 3 to help you stay focused.</p>
                </div>
                <button
                  onClick={() => setShowAllGoals(true)}
                  className="text-sm text-yellow-700 hover:text-yellow-900 font-medium underline whitespace-nowrap"
                >
                  Show all {goals.length}
                </button>
              </div>
            </div>
          )}
          {(showAllGoals ? goals : goals.slice(0, 3)).map((goal, index) => {
            const config = GOAL_CATEGORY_CONFIG[goal.category]
            const isExpanded = expandedGoals.has(goal.id)
            const tasks = goalTasks[goal.id] || []
            const activeTasks = tasks.filter(t => t.status === 'active')
            const completedTasks = tasks.filter(t => t.status === 'completed')

            return (
              <div
                key={goal.id}
                className="card overflow-hidden hover:shadow-lg transition-all animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Goal Header */}
                <div className="p-6 flex items-center gap-5 group">
                  <button
                    onClick={() => toggleGoalExpansion(goal.id)}
                    className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={isExpanded ? "Collapse tasks" : "Expand to see tasks"}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${config.color} group-hover:scale-110 transition-transform shadow-sm`}>
                    <span className="text-3xl">{config.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{goal.title}</h3>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-500">{config.label}</span>
                      {goal.income_stream_name && (
                        <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                          💰 {goal.income_stream_name}
                        </span>
                      )}
                      {goal.target_date && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                          🎯 {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      {tasks.length > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                          {activeTasks.length} active / {completedTasks.length} done
                        </span>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mt-2 italic">{goal.description}</p>
                    )}
                    {goal.success_metric && (
                      <div className="mt-2 inline-block">
                        <p className="text-sm text-purple-700 bg-purple-50 px-3 py-1 rounded-lg">
                          <span className="font-bold">Success:</span> {goal.success_metric}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === goal.id ? null : goal.id)}
                      className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-6 h-6" />
                    </button>
                    {menuOpen === goal.id && (
                      <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-10 w-36 animate-scale-in">
                        <button
                          onClick={() => openEditForm(goal)}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Tasks Section */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-6 animate-fade-in">
                    {loadingTasks.has(goal.id) ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                      </div>
                    ) : tasks.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">Linked Tasks ({tasks.length})</h4>
                          <a
                            href="/tasks"
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View all tasks →
                          </a>
                        </div>

                        {/* Active Tasks */}
                        {activeTasks.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Active ({activeTasks.length})
                            </h5>
                            {activeTasks.map(task => (
                              <div key={task.id} className="bg-white rounded-lg p-3 mb-2 flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${ENERGY_LEVEL_CONFIG[task.energy_required].color}`}>
                                      {ENERGY_LEVEL_CONFIG[task.energy_required].label}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_CONFIG[task.priority].color}`}>
                                      {PRIORITY_CONFIG[task.priority].label}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Completed Tasks */}
                        {completedTasks.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-4">
                              Completed ({completedTasks.length})
                            </h5>
                            {completedTasks.slice(0, 3).map(task => (
                              <div key={task.id} className="bg-white rounded-lg p-3 mb-2 flex items-start gap-3 opacity-60">
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check className="w-3 h-3 text-green-600" />
                                </div>
                                <p className="font-medium text-gray-600 text-sm line-through">{task.title}</p>
                              </div>
                            ))}
                            {completedTasks.length > 3 && (
                              <p className="text-xs text-gray-500 text-center mt-2">
                                + {completedTasks.length - 3} more completed
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium mb-1">No tasks linked to this goal yet</p>
                        <p className="text-sm text-gray-500">
                          <a href="/tasks" className="text-primary-600 hover:text-primary-700">
                            Add tasks
                          </a>{' '}
                          to start making progress
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-16 text-center shadow-md">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No goals yet</h3>
          <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
            Goals give your tasks meaning. Add 3-5 goals across different areas of your life.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" /> Add your first goal
          </button>
        </div>
      )}
    </div>
  )
}
