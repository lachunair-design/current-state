'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, CheckSquare, Loader2, X, MoreVertical, Trash2, Edit2, Check } from 'lucide-react'
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
  }, [filter])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [tasksRes, goalsRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*, goals(*)')
        .eq('user_id', user.id)
        .eq('status', filter === 'active' ? 'active' : 'completed')
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

  const resetForm = () => {
    setTitle('')
    setGoalId('')
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

    setTasks(tasks.filter(t => t.id !== taskId))
    setMenuOpen(null)
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return
    await supabase.from('tasks').update({ status: 'archived' } as never).eq('id', taskId)
    setTasks(tasks.filter(t => t.id !== taskId))
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Your work, tagged for energy matching</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('active')}
          className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            filter === 'active' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            filter === 'completed' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          Completed
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Task title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="What needs to be done?" autoFocus />
                {title && <TaskVsHabitGuide title={title} />}
              </div>

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
                        energy === e ? `${ENERGY_LEVEL_CONFIG[e].color} border-current` : 'border-gray-200 hover:border-gray-300'
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
                        workType === w ? 'bg-primary-100 text-primary-700 border-primary-300' : 'border-gray-200 hover:border-gray-300'
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
                        timeEstimate === t ? 'bg-primary-100 text-primary-700 border-primary-300' : 'border-gray-200 hover:border-gray-300'
                      )}>
                      {TIME_ESTIMATE_CONFIG[t].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(PRIORITY_CONFIG) as PriorityLevel[]).map(p => (
                    <button key={p} type="button" onClick={() => setPriority(p)}
                      className={clsx('p-2 rounded-lg border text-xs transition-all',
                        priority === p ? `${PRIORITY_CONFIG[p].color} border-current` : 'border-gray-200 hover:border-gray-300'
                      )}>
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Estimated value $ (optional)</label>
                <input type="number" value={value} onChange={e => setValue(e.target.value)} className="input" placeholder="e.g., 500" />
                <p className="text-xs text-gray-500 mt-1">How much is completing this task worth?</p>
              </div>

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
      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => {
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
                      className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-50 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors"
                    >
                      <Check className="w-3 h-3 text-transparent group-hover:text-primary-500" />
                    </button>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={clsx('font-medium', filter === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900')}>
                      {task.title}
                    </h3>
                    {task.goals && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {GOAL_CATEGORY_CONFIG[task.goals.category].icon} {task.goals.title}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${energyConfig.color}`}>{energyConfig.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{workConfig.icon} {workConfig.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">⏱️ {timeConfig.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig.color}`}>{priorityConfig.label}</span>
                      {task.estimated_value && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">${task.estimated_value}</span>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <button onClick={() => setMenuOpen(menuOpen === task.id ? null : task.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {menuOpen === task.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 w-32">
                        {filter === 'active' && (
                          <>
                            <button onClick={() => openEditForm(task)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => completeTask(task.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Check className="w-4 h-4" /> Complete
                            </button>
                          </>
                        )}
                        <button onClick={() => deleteTask(task.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
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
          <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'active' ? 'No active tasks' : 'No completed tasks yet'}
          </h3>
          <p className="text-gray-600 mb-6">
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
