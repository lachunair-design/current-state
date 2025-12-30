'use client'

import { HelpCircle, Lightbulb, CheckSquare, Heart } from 'lucide-react'
import { useState } from 'react'

interface TaskVsHabitGuideProps {
  title: string
}

export function TaskVsHabitGuide({ title }: TaskVsHabitGuideProps) {
  const [showHelp, setShowHelp] = useState(false)

  // Analyze the title to determine if it's likely a habit
  const analyzeTitle = (text: string): { isHabit: boolean; confidence: number; reason: string } => {
    const lower = text.toLowerCase()

    // Strong habit indicators
    const habitKeywords = [
      'daily', 'every day', 'everyday',
      'weekly', 'every week',
      'morning', 'evening', 'night',
      '3x', '5x', 'times a', 'times per',
      'routine', 'practice', 'habit',
      'meditate', 'exercise', 'workout', 'run', 'walk',
      'journal', 'read', 'write',
      'drink water', 'take vitamins', 'stretch'
    ]

    // Task indicators
    const taskKeywords = [
      'complete', 'finish', 'submit', 'send',
      'call', 'email', 'contact',
      'buy', 'purchase', 'order',
      'schedule', 'book', 'register',
      'apply', 'sign up', 'enroll',
      'create', 'build', 'design',
      'review', 'check', 'verify'
    ]

    // Check for habit patterns
    const hasHabitKeyword = habitKeywords.some(keyword => lower.includes(keyword))
    const hasTaskKeyword = taskKeywords.some(keyword => lower.includes(keyword))

    // Number patterns like "3 jobs" or "5 applications"
    const hasNumberPattern = /\d+\s*(times|x|jobs|applications|clients|calls)/i.test(text)

    if (hasHabitKeyword || (hasNumberPattern && !hasTaskKeyword)) {
      return {
        isHabit: true,
        confidence: 0.8,
        reason: hasHabitKeyword
          ? `Contains habit keywords like "${habitKeywords.find(k => lower.includes(k))}"`
          : 'Mentions a specific number of repetitions'
      }
    }

    if (hasTaskKeyword) {
      return {
        isHabit: false,
        confidence: 0.7,
        reason: `Contains task-oriented words like "${taskKeywords.find(k => lower.includes(k))}"`
      }
    }

    return {
      isHabit: false,
      confidence: 0.5,
      reason: 'No clear indicators - could be either'
    }
  }

  if (!title || title.length < 3) return null

  const analysis = analyzeTitle(title)

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-2 font-medium"
      >
        <HelpCircle className="w-4 h-4" />
        Is this a task or a habit?
      </button>

      {showHelp && (
        <div className="mt-3 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 space-y-3 animate-scale-in">
          {/* Analysis Result */}
          {analysis.confidence > 0.6 && (
            <div className={`flex items-start gap-3 p-3 rounded-lg ${
              analysis.isHabit
                ? 'bg-green-100 border border-green-200'
                : 'bg-blue-100 border border-blue-200'
            }`}>
              {analysis.isHabit ? (
                <Heart className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <CheckSquare className="w-5 h-5 text-blue-600 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">
                  💡 This looks like a {analysis.isHabit ? 'Habit' : 'Task'}
                </div>
                <div className="text-sm text-gray-700">{analysis.reason}</div>
              </div>
            </div>
          )}

          {/* Educational Content */}
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <div className="font-bold text-gray-900">Tasks</div>
              </div>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>✓ One-time actions</li>
                <li>✓ Specific deliverable</li>
                <li>✓ Has a clear endpoint</li>
                <li className="text-blue-700 font-medium mt-2">
                  Example: "Apply to Google"
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-green-600" />
                <div className="font-bold text-gray-900">Habits</div>
              </div>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>✓ Repeated regularly</li>
                <li>✓ Ongoing routine</li>
                <li>✓ No end date</li>
                <li className="text-green-700 font-medium mt-2">
                  Example: "Apply to 3 jobs daily"
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-purple-600 mt-0.5" />
              <div className="text-xs text-purple-900">
                <span className="font-bold">Pro tip:</span> If it has "daily", "weekly", or a number like "3x/week", it's probably a habit. If it's a one-off action, it's a task.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Example usage in forms:
export function TaskHabitExamples() {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-sm">
      <div className="font-semibold text-gray-900 mb-3">Quick Examples:</div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <div className="text-blue-600 font-medium mb-1">✓ Tasks</div>
          <ul className="text-gray-600 space-y-1 text-xs">
            <li>• "Complete project proposal"</li>
            <li>• "Call dentist for appointment"</li>
            <li>• "Buy birthday gift for mom"</li>
            <li>• "Submit tax documents"</li>
          </ul>
        </div>
        <div>
          <div className="text-green-600 font-medium mb-1">💚 Habits</div>
          <ul className="text-gray-600 space-y-1 text-xs">
            <li>• "Morning meditation (10 min)"</li>
            <li>• "Apply to 3 jobs daily"</li>
            <li>• "Workout 5x/week"</li>
            <li>• "Read before bed"</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
