'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, X, MoreVertical, Trash2, Edit2, CheckCircle, Heart, Check } from 'lucide-react'
import {
  Habit,
  HabitType,
  HabitVersion,
  FrequencyType,
  TimeOfDay,
  CreateHabitInput,
  HABIT_TYPE_CONFIG,
  FREQUENCY_CONFIG,
  TIME_OF_DAY_CONFIG,
  Goal,
  GOAL_CATEGORY_CONFIG
} from '@/types/database'
import { useCelebration } from '@/components/Celebration'
import { TaskVsHabitGuide } from '@/components/TaskVsHabitGuide'
import clsx from 'clsx'

interface HabitStats {
  totalCompletions: number
  currentStreak: number
  bestStreak: number
  lastCompleted: Date | null
  last7Days: boolean[] // true = completed, false = missed
  weeklyRate: number // percentage
  completedToday: boolean
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [habitStats, setHabitStats] = useState<Record<string, HabitStats>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [saving, setSaving] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [completingHabit, setCompletingHabit] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<HabitVersion>('full')
  const supabase = createClient()
  const { celebrate, CelebrationComponent } = useCelebration()

  // Form state
  const [title, setTitle] = useState('')
  const [habitType, setHabitType] = useState<HabitType>('foundational')
  const [targetFrequency, setTargetFrequency] = useState<FrequencyType>('daily')
  const [linkedGoalId, setLinkedGoalId] = useState('')
  const [whyThisHelps, setWhyThisHelps] = useState('')
  const [bestTimeOfDay, setBestTimeOfDay] = useState<TimeOfDay | ''>('')

  useEffect(() => {
    fetchHabits()
    fetchGoals()
  }, [])

  useEffect(() => {
    if (habits.length > 0) {
      fetchHabitStats()
    }
  }, [habits])

  const fetchHabits = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('display_order')

    setHabits(data || [])
    setLoading(false)
  }

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
  }

  const fetchHabitStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch fresh habits data to avoid stale closure
    const { data: freshHabits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('display_order') as { data: Habit[] | null }

    if (!freshHabits || freshHabits.length === 0) return

    const stats: Record<string, HabitStats> = {}

    for (const habit of freshHabits) {
      // Fetch all completions for this habit
      const { data: completions } = await supabase
        .from('habit_completions')
        .select('completed_at')
        .eq('habit_id', habit.id)
        .order('completed_at', { ascending: false }) as { data: Array<{ completed_at: string }> | null }

      if (!completions || completions.length === 0) {
        stats[habit.id] = {
          totalCompletions: 0,
          currentStreak: 0,
          bestStreak: 0,
          lastCompleted: null,
          last7Days: [false, false, false, false, false, false, false],
          weeklyRate: 0,
          completedToday: false,
        }
        continue
      }

      // Calculate stats
      const totalCompletions = completions.length
      const lastCompleted = new Date(completions[0].completed_at)

      // Check if completed today (use local timezone not UTC)
      const getLocalDateString = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      const today = new Date()
      const todayStr = getLocalDateString(today)
      const completedToday = completions.some(c => {
        const compDate = new Date(c.completed_at)
        return getLocalDateString(compDate) === todayStr
      })

      // Calculate streaks and last 7 days
      const { currentStreak, bestStreak, last7Days } = calculateStreaks(
        completions.map(c => new Date(c.completed_at))
      )

      // Calculate weekly completion rate
      const completedDays = last7Days.filter(d => d).length
      const weeklyRate = Math.round((completedDays / 7) * 100)

      stats[habit.id] = {
        totalCompletions,
        currentStreak,
        bestStreak,
        lastCompleted,
        last7Days,
        weeklyRate,
        completedToday,
      }
    }

    setHabitStats(stats)
  }

  const calculateStreaks = (completionDates: Date[]) => {
    if (completionDates.length === 0) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        last7Days: [false, false, false, false, false, false, false],
      }
    }

    // Helper to get date string in local timezone (not UTC)
    const getLocalDateString = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Sort dates ascending
    const dates = Array.from(completionDates).sort((a, b) => a.getTime() - b.getTime())

    // Get dates only (ignore time) - use LOCAL timezone not UTC
    const dateStrings = dates.map(d => getLocalDateString(d))
    const uniqueDates = Array.from(new Set(dateStrings))

    // Calculate current streak (working backwards from today)
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 100; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = getLocalDateString(checkDate)

      if (uniqueDates.includes(dateStr)) {
        currentStreak++
      } else if (i > 0) {
        // Only break if we're past today (allow today to be incomplete)
        break
      }
    }

    // Calculate best streak
    let bestStreak = 0
    let tempStreak = 1

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1] + 'T00:00:00')
      const currDate = new Date(uniqueDates[i] + 'T00:00:00')
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        tempStreak++
        bestStreak = Math.max(bestStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak)

    // Calculate last 7 days
    const last7Days: boolean[] = []
    for (let i = 6; i >= 0; i--) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = getLocalDateString(checkDate)
      last7Days.push(uniqueDates.includes(dateStr))
    }

    return { currentStreak, bestStreak, last7Days }
  }

  const resetForm = () => {
    setTitle('')
    setHabitType('foundational')
    setTargetFrequency('daily')
    setLinkedGoalId('')
    setWhyThisHelps('')
    setBestTimeOfDay('')
    setShowForm(false)
    setEditingHabit(null)
  }

  const openEditForm = (habit: Habit) => {
    setEditingHabit(habit)
    setTitle(habit.title)
    setHabitType(habit.habit_type)
    setTargetFrequency(habit.target_frequency)
    setLinkedGoalId(habit.linked_goal_id || '')
    setWhyThisHelps(habit.why_this_helps || '')
    setBestTimeOfDay(habit.best_time_of_day || '')
    setShowForm(true)
    setMenuOpen(null)
  }

  const saveHabit = async () => {
    if (!title.trim()) return
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const habitData: CreateHabitInput = {
        title: title.trim(),
        habit_type: habitType,
        full_version: title.trim(), // Use title as full version
        scaled_version: undefined, // Will be auto-generated by app
        minimal_version: undefined, // Will be auto-generated by app
        target_frequency: targetFrequency,
        linked_goal_id: linkedGoalId || undefined,
        why_this_helps: whyThisHelps.trim() || undefined,
        best_time_of_day: bestTimeOfDay || undefined,
      }

      let result
      if (editingHabit) {
        result = await supabase
          .from('habits')
          .update(habitData as never)
          .eq('id', editingHabit.id)
      } else {
        result = await supabase
          .from('habits')
          .insert({ ...habitData, user_id: user.id, display_order: habits.length } as never)
      }

      if (result.error) {
        console.error('Error saving habit:', result.error)
        alert(`Error saving habit: ${result.error.message}`)
        return
      }

      await fetchHabits()
      resetForm()
    } catch (error) {
      console.error('Error saving habit:', error)
      alert(`Error saving habit: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const deleteHabit = async (habitId: string) => {
    if (!confirm('Delete this habit? All completion history will remain.')) return

    await supabase.from('habits').update({ is_active: false } as never).eq('id', habitId)
    setHabits(habits.filter(h => h.id !== habitId))
    setMenuOpen(null)
  }

  const completeHabit = async (habitId: string) => {
    // Check if already completed today
    if (habitStats[habitId]?.completedToday) {
      alert('You already completed this habit today! 🎉')
      return
    }

    setCompletingHabit(habitId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const habit = habits.find(h => h.id === habitId)

      await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          version_completed: 'full', // Always record as full for simplicity
        } as never)

      // Manually refresh stats immediately after completion
      await fetchHabitStats()

      // Simple completion celebration (no streak pressure)
      if (habit) {
        celebrate(`${habit.title} ✓ ${habit.why_this_helps ? habit.why_this_helps + ' 💚' : ''}`)
      }
    } finally {
      setCompletingHabit(null)
    }
  }

  const getHabitStatsForId = async (habitId: string): Promise<HabitStats | null> => {
    const { data: completions } = await supabase
      .from('habit_completions')
      .select('completed_at')
      .eq('habit_id', habitId)
      .order('completed_at', { ascending: false }) as { data: Array<{ completed_at: string }> | null }

    if (!completions || completions.length === 0) return null

    const { currentStreak } = calculateStreaks(
      completions.map(c => new Date(c.completed_at))
    )

    return { currentStreak } as HabitStats
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">Rituals</h1>
          <p className="text-lg text-text-secondary">Build routines that work with your energy</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" /> Add Habit
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-dark-card rounded-2xl max-w-2xl w-full p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                {editingHabit ? 'Edit Habit' : 'Add New Habit'}
              </h2>
              <button
                onClick={resetForm}
                className="text-text-muted hover:text-text-secondary p-2 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Habit Type Selection */}
              <div>
                <label className="label">Habit Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(HABIT_TYPE_CONFIG) as HabitType[]).map((type) => {
                    const config = HABIT_TYPE_CONFIG[type]
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setHabitType(type)}
                        className={clsx(
                          'p-4 rounded-xl border-2 text-center transition-all',
                          habitType === type
                            ? `${config.color} border-current shadow-md scale-105`
                            : 'border-dark-border hover:border-dark-border hover:shadow-sm'
                        )}
                      >
                        <span className="text-3xl block mb-2">{config.icon}</span>
                        <span className="block text-sm font-semibold">{config.label}</span>
                        <span className="block text-xs text-text-secondary mt-1">{config.description}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="label">Habit Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input"
                  placeholder="e.g., Morning meditation, Workout, Take vitamins"
                  autoFocus
                />
                {title && <TaskVsHabitGuide title={title} />}
                <p className="text-xs text-text-muted mt-1">
                  💡 The app will automatically suggest easier versions when your energy is low
                </p>
              </div>

              {/* Frequency */}
              <div>
                <label className="label">How often?</label>
                <select
                  value={targetFrequency}
                  onChange={e => setTargetFrequency(e.target.value as FrequencyType)}
                  className="input"
                >
                  {(Object.keys(FREQUENCY_CONFIG) as FrequencyType[]).map(freq => (
                    <option key={freq} value={freq}>
                      {FREQUENCY_CONFIG[freq].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Linked Goal */}
              <div>
                <label className="label">Link to Goal (optional)</label>
                <select
                  value={linkedGoalId}
                  onChange={e => setLinkedGoalId(e.target.value)}
                  className="input"
                >
                  <option value="">No linked goal</option>
                  {goals.map(goal => {
                    const config = GOAL_CATEGORY_CONFIG[goal.category]
                    return (
                      <option key={goal.id} value={goal.id}>
                        {config.icon} {goal.title}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Why This Helps */}
              <div>
                <label className="label">Why does this habit help you? (optional)</label>
                <input
                  type="text"
                  value={whyThisHelps}
                  onChange={e => setWhyThisHelps(e.target.value)}
                  className="input"
                  placeholder="e.g., Helps me sleep better, Reduces stress, Gives me energy"
                />
                <p className="text-xs text-text-muted mt-1">Personal reminder of the benefit</p>
              </div>

              {/* Best Time of Day */}
              <div>
                <label className="label">Best time of day (optional)</label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(TIME_OF_DAY_CONFIG) as (TimeOfDay | 'anytime')[]).map(time => {
                    const config = TIME_OF_DAY_CONFIG[time as TimeOfDay]
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setBestTimeOfDay(time as TimeOfDay)}
                        className={clsx(
                          'p-3 rounded-lg border text-center transition-all text-sm',
                          bestTimeOfDay === time
                            ? 'bg-primary-100 text-primary-800 border-primary-300 font-semibold'
                            : 'border-dark-border hover:border-dark-border'
                        )}
                      >
                        <div className="text-lg mb-1">{config.icon}</div>
                        <div className="text-xs">{config.label}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveHabit}
                  disabled={saving || !title.trim()}
                  className="btn-primary flex-1 shadow-md"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    editingHabit ? 'Save Changes' : 'Add Habit'
                  )}
                </button>
                <button onClick={resetForm} className="btn-secondary px-6">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Habits List */}
      {habits.length > 0 ? (
        <div className="space-y-4">
          {habits.map((habit, index) => {
            const config = HABIT_TYPE_CONFIG[habit.habit_type]
            const linkedGoal = goals.find(g => g.id === habit.linked_goal_id)

            return (
              <div
                key={habit.id}
                className="card p-6 hover:shadow-lg transition-all animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color} shadow-sm`}>
                        <span className="text-2xl">{config.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-text-primary text-lg">{habit.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-text-muted font-medium">{config.label}</span>
                          {linkedGoal && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs bg-dark-hover text-text-secondary px-2 py-0.5 rounded-full">
                                🎯 {linkedGoal.title}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Versions */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 text-sm">✅</span>
                        <span className="text-sm text-text-secondary font-medium">{habit.full_version}</span>
                      </div>
                      {habit.scaled_version && (
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 text-sm">⚡</span>
                          <span className="text-sm text-text-secondary">{habit.scaled_version}</span>
                        </div>
                      )}
                      {habit.minimal_version && (
                        <div className="flex items-start gap-2">
                          <span className="text-amber-600 text-sm">💫</span>
                          <span className="text-sm text-text-secondary">{habit.minimal_version}</span>
                        </div>
                      )}
                    </div>

                    {habit.why_this_helps && (
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-3">
                        <p className="text-sm text-purple-900">
                          <Heart className="w-4 h-4 inline mr-1 text-purple-600" />
                          <span className="font-semibold">Why:</span> {habit.why_this_helps}
                        </p>
                      </div>
                    )}

                    {/* Habit Stats - Neutral Pattern View */}
                    {habitStats[habit.id] && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-3">
                          {/* 7-Day Pattern - No judgment */}
                          <div className="flex-1">
                            <div className="text-xs text-text-secondary mb-1.5">Last 7 days</div>
                            <div className="flex gap-0.5">
                              {habitStats[habit.id].last7Days.map((completed, i) => (
                                <div
                                  key={i}
                                  className={clsx(
                                    'flex-1 h-6 rounded transition-all',
                                    completed ? 'bg-green-500' : 'bg-gray-200'
                                  )}
                                  title={`${7 - i} days ago`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Simple Stats */}
                          <div className="text-right">
                            <div className="text-xs text-text-muted">Completions</div>
                            <div className="text-sm font-bold text-text-secondary">
                              {habitStats[habit.id].totalCompletions}
                            </div>
                            {habitStats[habit.id].lastCompleted && (
                              <div className="text-xs text-text-muted mt-1">
                                {new Date(habitStats[habit.id].lastCompleted!).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Complete Button */}
                    {habitStats[habit.id]?.completedToday ? (
                      <button
                        disabled
                        className="btn-secondary text-sm px-6 py-2 flex items-center gap-2 opacity-70 cursor-not-allowed"
                      >
                        <Check className="w-4 h-4" />
                        Completed Today ✓
                      </button>
                    ) : (
                      <button
                        onClick={() => completeHabit(habit.id)}
                        disabled={completingHabit === habit.id}
                        className="btn-primary text-sm px-6 py-2 flex items-center gap-2 shadow-sm"
                      >
                        {completingHabit === habit.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Done
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === habit.id ? null : habit.id)}
                      className="p-2 text-text-muted hover:text-text-secondary rounded-lg hover:bg-dark-hover transition-colors"
                    >
                      <MoreVertical className="w-6 h-6" />
                    </button>
                    {menuOpen === habit.id && (
                      <div className="absolute right-0 top-full mt-2 bg-dark-card border border-dark-border rounded-xl shadow-xl py-1 z-10 w-36 animate-scale-in">
                        <button
                          onClick={() => openEditForm(habit)}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium text-text-secondary hover:bg-dark-hover flex items-center gap-2 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
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
        <div className="card p-16 text-center shadow-md">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-3">No habits yet</h3>
          <p className="text-text-secondary mb-8 text-lg max-w-lg mx-auto">
            Build energy-aware routines with habits that adapt to how you're feeling.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" /> Add your first habit
          </button>
        </div>
      )}

      {/* Celebration Component */}
      {CelebrationComponent}
    </div>
  )
}
