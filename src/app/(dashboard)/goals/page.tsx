'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, X, MoreVertical, Trash2, Edit2, Rocket, Briefcase, Heart, DollarSign, Users, Home, CheckCircle2 } from 'lucide-react'
import { Goal, GoalCategory, GOAL_CATEGORY_CONFIG, CreateGoalInput } from '@/types/database'
import { getSmartTaskSuggestions, TaskSuggestion } from '@/lib/goalTaskSuggestions'
import clsx from 'clsx'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [saving, setSaving] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [goalProgress, setGoalProgress] = useState<Record<string, { completed: number, total: number }>>({})

  // Task suggestions modal state
  const [showTaskSuggestions, setShowTaskSuggestions] = useState(false)
  const [newlyCreatedGoal, setNewlyCreatedGoal] = useState<Goal | null>(null)
  const [selectedTaskIndices, setSelectedTaskIndices] = useState<number[]>([])
  const [addingTasks, setAddingTasks] = useState(false)

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null)
  const [deleteStats, setDeleteStats] = useState({ tasks: 0, habits: 0 })
  const [deleting, setDeleting] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<GoalCategory>('career')
  const [description, setDescription] = useState('')
  const [successMetric, setSuccessMetric] = useState('')
  const [incomeStream, setIncomeStream] = useState('')
  const [targetDate, setTargetDate] = useState('')

  // Icon mapping for different goal types
  const getGoalIcon = (category: GoalCategory, title: string) => {
    // Check title for keywords first
    const lowerTitle = title.toLowerCase()

    if (lowerTitle.includes('launch') || lowerTitle.includes('start') || lowerTitle.includes('hustle')) {
      return { icon: Rocket, color: 'bg-gradient-sunset', emoji: '🚀' }
    }
    if (lowerTitle.includes('promotion') || lowerTitle.includes('job') || lowerTitle.includes('career')) {
      return { icon: Briefcase, color: 'bg-gradient-ocean', emoji: '💼' }
    }
    if (lowerTitle.includes('health') || lowerTitle.includes('fitness') || lowerTitle.includes('marathon') || lowerTitle.includes('training')) {
      return { icon: Heart, color: 'bg-red-100', emoji: '❤️', textColor: 'text-red-600' }
    }
    if (lowerTitle.includes('save') || lowerTitle.includes('$') || lowerTitle.includes('money') || lowerTitle.includes('earn')) {
      return { icon: DollarSign, color: 'bg-emerald-100', emoji: '💰', textColor: 'text-emerald-600' }
    }
    if (lowerTitle.includes('family') || lowerTitle.includes('trip') || lowerTitle.includes('vacation')) {
      return { icon: Users, color: 'bg-orange-100', emoji: '👨‍👩‍👧‍👦', textColor: 'text-orange-600' }
    }

    // Fallback to category
    const config = GOAL_CATEGORY_CONFIG[category]
    return {
      icon: Home,
      color: config.color,
      emoji: config.icon,
      textColor: 'text-ocean-600'
    }
  }

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
      // Fetch progress for each goal
      await fetchAllGoalProgress(data, user.id)
    }
    setLoading(false)
  }

  const fetchAllGoalProgress = async (goals: Goal[], userId: string) => {
    const progressData: Record<string, { completed: number, total: number }> = {}

    for (const goal of goals) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status')
        .eq('user_id', userId)
        .eq('goal_id', goal.id)
        .in('status', ['active', 'completed'])

      const total = tasks?.length || 0
      const completed = tasks?.filter((t: any) => t.status === 'completed').length || 0
      progressData[goal.id] = { completed, total }
    }

    setGoalProgress(progressData)
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
        // Insert new goal and get the created goal back
        const { data: createdGoal, error } = await supabase
          .from('goals')
          .insert({ ...goalData, user_id: user.id, display_order: goals.length } as never)
          .select()
          .single()

        if (!error && createdGoal) {
          await fetchGoals()
          resetForm()

          // Show task suggestions modal
          setNewlyCreatedGoal(createdGoal as Goal)
          const suggestions = getSmartTaskSuggestions((createdGoal as Goal).title, (createdGoal as Goal).category)
          // Pre-select first 5 suggestions (we only display 5 in the modal)
          setSelectedTaskIndices(suggestions.slice(0, 5).map((_, index) => index))
          setShowTaskSuggestions(true)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  const promptDeleteGoal = async (goal: Goal) => {
    // Fetch counts of linked tasks and habits
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('goal_id', goal.id)
      .eq('status', 'active')

    const { data: habits } = await supabase
      .from('habits')
      .select('id')
      .eq('linked_goal_id', goal.id)
      .eq('is_active', true)

    setDeleteStats({
      tasks: tasks?.length || 0,
      habits: habits?.length || 0
    })
    setGoalToDelete(goal)
    setShowDeleteConfirm(true)
    setMenuOpen(null)
  }

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return

    setDeleting(true)
    try {
      // Delete all linked tasks
      await supabase
        .from('tasks')
        .delete()
        .eq('goal_id', goalToDelete.id)

      // Delete all linked habits
      await supabase
        .from('habits')
        .delete()
        .eq('linked_goal_id', goalToDelete.id)

      // Delete the goal
      await supabase
        .from('goals')
        .delete()
        .eq('id', goalToDelete.id)

      // Update local state
      setGoals(goals.filter(g => g.id !== goalToDelete.id))
      setShowDeleteConfirm(false)
      setGoalToDelete(null)
    } catch (error) {
      console.error('Error deleting goal:', error)
      alert('Failed to delete goal. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setGoalToDelete(null)
    setDeleteStats({ tasks: 0, habits: 0 })
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

      // Create tasks from selected suggestions
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

      // Refresh goals to update progress
      await fetchGoals()

      // Close modal
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

    // Store goal info in sessionStorage for tasks page to read
    sessionStorage.setItem('pendingGoalForTasks', JSON.stringify({
      id: newlyCreatedGoal.id,
      title: newlyCreatedGoal.title
    }))

    // Close modal and navigate to tasks page
    setShowTaskSuggestions(false)
    setNewlyCreatedGoal(null)
    setSelectedTaskIndices([])
    router.push('/tasks')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-ocean-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-1">Your Goals</h1>
          <p className="text-sm text-text-secondary">Stay in your rhythm</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-12 h-12 bg-gradient-ocean text-white rounded-full flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all shadow-md"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
              <button
                onClick={resetForm}
                className="text-text-muted hover:text-text-secondary p-2 hover:bg-surface-hover rounded-lg transition-colors"
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
                  placeholder="e.g., Launch Side Hustle, Get Promoted"
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
                          category === cat ? `${config.color} border-current` : 'border-surface-border hover:border-surface-border'
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
                <p className="text-xs text-text-muted mt-1">What does "done" look like?</p>
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
                <p className="text-xs text-text-muted mt-1">Add this if this goal generates income</p>
              </div>

              <div>
                <label className="label">Target date (optional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="input"
                />
                <p className="text-xs text-text-muted mt-1">When do you want to achieve this goal?</p>
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
      {showTaskSuggestions && newlyCreatedGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto relative">
            {/* Close button */}
            <button
              onClick={skipTaskSuggestions}
              className="absolute top-4 right-4 text-text-muted hover:text-text-secondary p-2 hover:bg-surface-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className={`w-16 h-16 ${getGoalIcon(newlyCreatedGoal.category, newlyCreatedGoal.title).color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                <span className="text-3xl">{getGoalIcon(newlyCreatedGoal.category, newlyCreatedGoal.title).emoji}</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Great! Let's break this down</h2>
              <p className="text-text-secondary text-sm">
                Here are some tasks to help you achieve <span className="font-semibold text-text-primary">"{newlyCreatedGoal.title}"</span>
              </p>
            </div>

            {/* Task Suggestions List */}
            <div className="space-y-3 mb-6">
              {getSmartTaskSuggestions(newlyCreatedGoal.title, newlyCreatedGoal.category).slice(0, 5).map((suggestion, index) => (
                <label
                  key={index}
                  className={clsx(
                    'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md',
                    selectedTaskIndices.includes(index)
                      ? 'border-primary bg-primary-50'
                      : 'border-surface-border bg-white hover:border-primary-200'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedTaskIndices.includes(index)}
                    onChange={() => toggleTaskSelection(index)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary text-sm leading-snug">{suggestion.title}</p>
                    {suggestion.description && (
                      <p className="text-xs text-text-muted mt-1">{suggestion.description}</p>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-ocean-100 text-ocean-700 rounded-full">
                        {suggestion.energy_required}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-surface-hover text-text-secondary rounded-full">
                        {suggestion.time_estimate}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={addTasksFromSuggestions}
                disabled={addingTasks || selectedTaskIndices.length === 0}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {addingTasks ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Add {selectedTaskIndices.length} {selectedTaskIndices.length === 1 ? 'Task' : 'Tasks'}
                  </>
                )}
              </button>
              <button
                onClick={addTasksManually}
                disabled={addingTasks}
                className="btn-secondary px-6"
              >
                Add manually
              </button>
            </div>

            {/* Helper text */}
            <p className="text-xs text-text-muted text-center mt-4">
              💡 <strong>Tip:</strong> Goals work best with tasks. We recommend adding at least 2-3 to get started.
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && goalToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Delete this goal?</h2>
              <p className="text-text-secondary text-sm">
                This will permanently delete <span className="font-semibold text-text-primary">"{goalToDelete.title}"</span> and everything linked to it.
              </p>
            </div>

            {/* Warning Stats */}
            {(deleteStats.tasks > 0 || deleteStats.habits > 0) && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-red-900 mb-2">⚠️ This will also delete:</p>
                <div className="space-y-1">
                  {deleteStats.tasks > 0 && (
                    <p className="text-sm text-red-800">
                      • <strong>{deleteStats.tasks}</strong> {deleteStats.tasks === 1 ? 'task' : 'tasks'}
                    </p>
                  )}
                  {deleteStats.habits > 0 && (
                    <p className="text-sm text-red-800">
                      • <strong>{deleteStats.habits}</strong> {deleteStats.habits === 1 ? 'habit' : 'habits'}
                    </p>
                  )}
                </div>
                <p className="text-xs text-red-700 mt-2">This action cannot be undone.</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteGoal}
                disabled={deleting}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
          {goals.map((goal, index) => {
            const progress = goalProgress[goal.id] || { completed: 0, total: 0 }
            const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0
            const iconConfig = getGoalIcon(goal.category, goal.title)

            return (
              <div
                key={goal.id}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all animate-fade-in relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Left side content */}
                <div className="flex-1 min-w-0">
                  {/* Icon */}
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${iconConfig.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-sm`}>
                    <span className="text-2xl sm:text-3xl">{iconConfig.emoji}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1 sm:mb-2 pr-8">{goal.title}</h3>

                  {/* Progress Text */}
                  <p className="text-xs sm:text-sm text-text-secondary">
                    {progress.completed} of {progress.total} tasks complete
                  </p>
                </div>

                {/* Right side: Circular Progress Indicator */}
                <div className="flex-shrink-0 self-center sm:self-auto">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                    <div
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full"
                      style={{
                        background: `conic-gradient(
                          #4FB3D4 ${percentage * 3.6}deg,
                          #E8E5E0 ${percentage * 3.6}deg
                        )`
                      }}
                    >
                      <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                        <span className="text-xl sm:text-2xl font-bold text-ocean-600">{percentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu button */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setMenuOpen(menuOpen === goal.id ? null : goal.id)}
                    className="p-2 text-text-muted hover:text-text-secondary rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {menuOpen === goal.id && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-surface-border rounded-xl shadow-xl py-1 z-10 w-36 animate-scale-in">
                      <button
                        onClick={() => openEditForm(goal)}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-text-secondary hover:bg-surface-hover flex items-center gap-2 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => promptDeleteGoal(goal)}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center shadow-md">
          <div className="w-20 h-20 bg-gradient-ocean rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-3">No goals yet</h3>
          <p className="text-text-secondary mb-8 text-base max-w-sm mx-auto">
            Goals give your tasks meaning. Add your first goal to get started.
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
