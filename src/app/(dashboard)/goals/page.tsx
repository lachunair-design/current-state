'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Target, Loader2, X, MoreVertical, Trash2, Edit2 } from 'lucide-react'
import { Goal, GoalCategory, GOAL_CATEGORY_CONFIG, CreateGoalInput } from '@/types/database'
import clsx from 'clsx'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [saving, setSaving] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const supabase = createClient()

  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<GoalCategory>('career')
  const [description, setDescription] = useState('')
  const [incomeStream, setIncomeStream] = useState('')

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
    setIncomeStream('')
    setShowForm(false)
    setEditingGoal(null)
  }

  const openEditForm = (goal: Goal) => {
    setEditingGoal(goal)
    setTitle(goal.title)
    setCategory(goal.category)
    setDescription(goal.description || '')
    setIncomeStream(goal.income_stream_name || '')
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
        income_stream_name: incomeStream.trim() || undefined,
      }

      if (editingGoal) {
        await supabase
          .from('goals')
          .update(goalData)
          .eq('id', editingGoal.id)
      } else {
        await supabase
          .from('goals')
          .insert({ ...goalData, user_id: user.id, display_order: goals.length })
      }

      await fetchGoals()
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Delete this goal? Tasks linked to it will become unlinked.')) return

    await supabase.from('goals').update({ is_active: false }).eq('id', goalId)
    setGoals(goals.filter(g => g.id !== goalId))
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
          <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600 mt-1">What you're working toward</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
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

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map((goal) => {
            const config = GOAL_CATEGORY_CONFIG[goal.category]
            return (
              <div key={goal.id} className="card p-4 flex items-center gap-4 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
                  <span className="text-2xl">{config.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">{config.label}</span>
                    {goal.income_stream_name && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        💰 {goal.income_stream_name}
                      </span>
                    )}
                  </div>
                  {goal.description && (
                    <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === goal.id ? null : goal.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {menuOpen === goal.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 w-32">
                      <button
                        onClick={() => openEditForm(goal)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
        <div className="card p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600 mb-6">
            Goals give your tasks meaning. Add 3-5 goals across different areas of your life.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add your first goal
          </button>
        </div>
      )}
    </div>
  )
}
