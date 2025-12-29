'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, CheckSquare, Loader2, X, MoreVertical, Trash2, Edit2, Check, RotateCcw } from 'lucide-react'
import {
  Task, Goal, EnergyLevel, WorkType, TimeEstimate, PriorityLevel,
  ENERGY_LEVEL_CONFIG, WORK_TYPE_CONFIG, TIME_ESTIMATE_CONFIG, PRIORITY_CONFIG, GOAL_CATEGORY_CONFIG
} from '@/types/database'
import { TaskVsHabitGuide } from '@/components/TaskVsHabitGuide'
import { useCelebration } from '@/components/Celebration'
import clsx from 'clsx'

interface TaskWithGoal extends Task {
  goals?: Goal
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithGoal[]>([])
  const [filteredTasks, setFilteredTasks] = useState<TaskWithGoal[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active')
  const [workTypeFilter, setWorkTypeFilter] = useState<WorkType | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'all'>('all')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const supabase = createClient()
  const { celebrate, CelebrationComponent } = useCelebration()

  // Form state
  const [title, setTitle] = useState('')
  const [goalId, setGoalId] = useState<string>('')
  const [energy, setEnergy] = useState<EnergyLevel>('medium')
  const [workType, setWorkType] = useState<WorkType>('admin')
  const [timeEstimate, setTimeEstimate] = useState<TimeEstimate>('medium')
  const [priority, setPriority] = useState<PriorityLevel>('should_do')
  const [value, setValue] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Apply filters whenever tasks or filter settings change
    applyFilters()
  }, [tasks, filter, workTypeFilter, priorityFilter])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [tasksRes, goalsRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*, goals(*)')
        .eq('user_id', user.id)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false }),
      supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
    ])

    setTasks(tasksRes.data || [])
    setGoals(goalsRes.data || [])
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...tasks]

    // Status filter
    if (filter === 'active') {
      filtered = filtered.filter(t => t.status === 'active')
    } else if (filter === 'completed') {
      filtered = filtered.filter(t => t.status === 'completed')
    }
    // 'all' shows everything

    // Work type filter
    if (workTypeFilter !== 'all') {
      filtered = filtered.filter(t => t.work_type === workTypeFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter)
    }

    setFilteredTasks(filtered)
  }

  const resetForm = () => {
    setTitle('')
    setGoalId('')
    setShowAdvanced(false)
    setEnergy('medium')
    setWorkType('admin')
    setTimeEstimate('medium')
    setPriority('should_do')
    setValue('')
    setShowForm(false)
    setEditingTask(null)
  }

  const openEditForm = (task: Task) => {
    setEditingTask(task)
    setTitle(task.title)
    setGoalId(task.goal_id || '')
    setEnergy(task.energy_required)
    setWorkType(task.work_type)
    setTimeEstimate(task.time_estimate)
    setPriority(task.priority)
    setValue(task.estimated_value?.toString() || '')
    setShowForm(true)
    setMenuOpen(null)
  }

  const saveTask = async () => {
    if (!title.trim()) return
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const taskData = {
        title: title.trim(),
        goal_id: goalId || null,
        energy_required: energy,
        work_type: workType,
        time_estimate: timeEstimate,
        priority,
        estimated_value: value ? parseFloat(value) : null,
      }

      if (editingTask) {
        await supabase.from('tasks').update(taskData as never).eq('id', editingTask.id)
      } else {
        await supabase.from('tasks').insert({ ...taskData, user_id: user.id } as never)
      }

      await fetchData()
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const completeTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)

    await supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString() } as never).eq('id', taskId)

    // Celebrate completion!
    if (task) {
      celebrate(`You completed "${task.title}"! Keep up the great work! 💪`)
    }

    await fetchData()
    setMenuOpen(null)
  }

  const restoreTask = async (taskId: string) => {
    await supabase.from('tasks').update({ status: 'active', completed_at: null } as never).eq('id', taskId)
    await fetchData()
    setMenuOpen(null)
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return
    await supabase.from('tasks').update({ status: 'archived' } as never).eq('id', taskId)
    await fetchData()
    setMenuOpen(null)
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold font-accent text-text-primary">Steps</h1>
          <p className="text-text-secondary mt-1">Your task parking lot—not a to-do list</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Mental Model Explainer */}
      <div className="bg-white border border-surface-border rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <div className="text-2xl flex-shrink-0">💡</div>
          <div className="text-sm text-text-primary">
            <p className="font-semibold mb-1">How to use this page:</p>
            <p className="mb-2">This is your <strong>parking lot</strong>—dump tasks here without overthinking. The app will recommend what to work on based on your energy during check-ins.</p>
            <p className="text-xs text-text-secondary">
              ✨ <strong>Use Energy Check-In</strong> to let the app guide you → <strong>Use this page</strong> to capture tasks manually
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status filter */}
          <div className="flex-1">
            <label className="label text-xs">Status</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('active')}
                className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-1',
                  filter === 'active' ? 'bg-accent-ocean/10 text-accent-ocean' : 'text-text-secondary hover:bg-surface-hover'
                )}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-1',
                  filter === 'completed' ? 'bg-accent-ocean/10 text-accent-ocean' : 'text-text-secondary hover:bg-surface-hover'
                )}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('all')}
                className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-1',
                  filter === 'all' ? 'bg-accent-ocean/10 text-accent-ocean' : 'text-text-secondary hover:bg-surface-hover'
                )}
              >
                All
              </button>
            </div>
          </div>

          {/* Work type filter */}
          <div className="flex-1">
            <label className="label text-xs">Work Type</label>
            <select
              value={workTypeFilter}
              onChange={(e) => setWorkTypeFilter(e.target.value as WorkType | 'all')}
              className="input text-sm py-1.5"
            >
              <option value="all">All Types</option>
              {(Object.keys(WORK_TYPE_CONFIG) as WorkType[]).map((type) => (
                <option key={type} value={type}>
                  {WORK_TYPE_CONFIG[type].icon} {WORK_TYPE_CONFIG[type].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
              <button onClick={resetForm} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Primary field: Title only */}
              <div>
                <label className="label">What needs to be done?</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input"
                  placeholder="Just dump it here—we'll help you match it to your energy"
                  autoFocus
                />
                {title && <TaskVsHabitGuide title={title} />}
                <p className="text-xs text-text-muted mt-1">💡 Don't overthink it. Add details later if needed.</p>
              </div>

              {/* Expandable details */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-accent-ocean hover:text-primary-500 font-medium flex items-center gap-1"
              >
                {showAdvanced ? '▼' : '▶'} More details (optional)
              </button>

              {showAdvanced && (
                <div className="space-y-4 pl-4 border-l-2 border-surface-border">
                  <div>
                    <label className="label">Linked goal (optional)</label>
                    <select value={goalId} onChange={e => setGoalId(e.target.value)} className="input">
                      <option value="">No goal</option>
                      {goals.map(g => (
                        <option key={g.id} value={g.id}>{GOAL_CATEGORY_CONFIG[g.category].icon} {g.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Energy required</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(ENERGY_LEVEL_CONFIG) as EnergyLevel[]).map(e => (
                        <button key={e} type="button" onClick={() => setEnergy(e)}
                          className={clsx('p-2 rounded-lg border text-sm transition-all',
                            energy === e ? `${ENERGY_LEVEL_CONFIG[e].color} border-current` : 'border-surface-border hover:border-surface-hover text-text-secondary'
                          )}>
                          {ENERGY_LEVEL_CONFIG[e].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Work type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(WORK_TYPE_CONFIG) as WorkType[]).map(w => (
                        <button key={w} type="button" onClick={() => setWorkType(w)}
                          className={clsx('p-2 rounded-lg border text-sm transition-all',
                            workType === w ? 'bg-accent-ocean/10 text-accent-ocean border-accent-ocean' : 'border-surface-border hover:border-surface-hover text-text-secondary'
                          )}>
                          {WORK_TYPE_CONFIG[w].icon} {WORK_TYPE_CONFIG[w].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Time estimate</label>
                    <div className="grid grid-cols-5 gap-2">
                      {(Object.keys(TIME_ESTIMATE_CONFIG) as TimeEstimate[]).map(t => (
                        <button key={t} type="button" onClick={() => setTimeEstimate(t)}
                          className={clsx('p-2 rounded-lg border text-xs transition-all',
                            timeEstimate === t ? 'bg-accent-ocean/10 text-accent-ocean border-accent-ocean' : 'border-surface-border hover:border-surface-hover text-text-secondary'
                          )}>
                          {TIME_ESTIMATE_CONFIG[t].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Estimated value $ (optional)</label>
                    <input type="number" value={value} onChange={e => setValue(e.target.value)} className="input" placeholder="e.g., 500" />
                    <p className="text-xs text-text-muted mt-1">How much is completing this task worth?</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button onClick={saveTask} disabled={saving || !title.trim()} className="btn-primary flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editingTask ? 'Save Changes' : 'Add Task')}
                </button>
                <button onClick={resetForm} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const energyConfig = ENERGY_LEVEL_CONFIG[task.energy_required]
            const workConfig = WORK_TYPE_CONFIG[task.work_type]
            const timeConfig = TIME_ESTIMATE_CONFIG[task.time_estimate]
            const priorityConfig = PRIORITY_CONFIG[task.priority]
            
            return (
              <div key={task.id} className="card p-4 group">
                <div className="flex items-start gap-3">
                  {filter === 'active' ? (
                    <button
                      onClick={() => completeTask(task.id)}
                      className="w-6 h-6 rounded-full border-2 border-surface-border hover:border-accent-ocean hover:bg-accent-ocean/10 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors"
                    >
                      <Check className="w-3 h-3 text-transparent group-hover:text-accent-ocean" />
                    </button>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-accent-ocean/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-accent-ocean" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className={clsx('font-medium', filter === 'completed' ? 'text-text-muted line-through' : 'text-text-primary')}>
                      {task.title}
                    </h3>
                    {task.goals && (
                      <p className="text-sm text-text-secondary mt-0.5">
                        {GOAL_CATEGORY_CONFIG[task.goals.category].icon} {task.goals.title}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${energyConfig.color}`}>{energyConfig.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-hover text-text-secondary">{workConfig.icon} {workConfig.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-hover text-text-secondary">⏱️ {timeConfig.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig.color}`}>{priorityConfig.label}</span>
                      {task.estimated_value && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent-ocean/20 text-accent-ocean">${task.estimated_value}</span>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <button onClick={() => setMenuOpen(menuOpen === task.id ? null : task.id)}
                      className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-hover">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {menuOpen === task.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-surface-border rounded-lg shadow-lg py-1 z-10 w-36">
                        {task.status === 'active' ? (
                          <>
                            <button onClick={() => openEditForm(task)}
                              className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2">
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => completeTask(task.id)}
                              className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2">
                              <Check className="w-4 h-4" /> Complete
                            </button>
                          </>
                        ) : (
                          <button onClick={() => restoreTask(task.id)}
                            className="w-full px-4 py-2 text-left text-sm text-accent-ocean hover:bg-accent-ocean/10 flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" /> Restore
                          </button>
                        )}
                        <button onClick={() => deleteTask(task.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <CheckSquare className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold font-accent text-text-primary mb-2">
            {filter === 'active' ? 'No active tasks' : 'No completed tasks yet'}
          </h3>
          <p className="text-text-secondary mb-6">
            {filter === 'active'
              ? 'Add tasks and tag them with energy levels for smart matching.'
              : 'Complete some tasks and they\'ll show up here.'}
          </p>
          {filter === 'active' && (
            <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add your first task
            </button>
          )}
        </div>
      )}

      {/* Celebration Component */}
      {CelebrationComponent}
    </div>
  )
}
