'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, X, ThumbsUp } from 'lucide-react'

// Sean Ellis PMF Question: "How would you feel if you could no longer use this product?"
const SEAN_ELLIS_QUESTION = "How would you feel if you could no longer use Current State?"

const OPTIONS = [
  { value: 'very-disappointed', label: 'Very disappointed', emoji: '😢' },
  { value: 'somewhat-disappointed', label: 'Somewhat disappointed', emoji: '😕' },
  { value: 'not-disappointed', label: 'Not disappointed', emoji: '😐' },
]

export function FeedbackCard() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasResponded, setHasResponded] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  useEffect(() => {
    // Check if user has already responded today
    const lastResponseDate = localStorage.getItem('feedbackLastResponse')
    const today = new Date().toISOString().split('T')[0]

    if (lastResponseDate !== today) {
      // Show feedback after user has been using the app for at least 3 days
      const firstUseDate = localStorage.getItem('firstUseDate')
      if (!firstUseDate) {
        localStorage.setItem('firstUseDate', today)
        return
      }

      const daysSinceFirstUse = Math.floor((new Date().getTime() - new Date(firstUseDate).getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceFirstUse >= 3) {
        // Show once per day
        const dismissedToday = localStorage.getItem('feedbackDismissedToday')
        if (dismissedToday !== today) {
          setIsVisible(true)
        }
      }
    }
  }, [])

  const handleResponse = (option: string) => {
    setSelectedOption(option)
    setHasResponded(true)

    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem('feedbackLastResponse', today)
    localStorage.setItem('feedbackResponse', option)

    // Track in console for now (you can add analytics later)
    console.log('Sean Ellis Feedback:', option)

    // Hide after 3 seconds
    setTimeout(() => {
      setIsVisible(false)
    }, 3000)
  }

  const handleDismiss = () => {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem('feedbackDismissedToday', today)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="mb-6 bg-gradient-to-br from-ocean-100 to-sunset-50 border-2 border-ocean-300 rounded-2xl p-6 animate-fade-in shadow-md">
      {!hasResponded ? (
        <>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-ocean-600" />
              <h3 className="font-semibold text-text-primary">Quick feedback</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-text-secondary mb-4 text-sm">
            {SEAN_ELLIS_QUESTION}
          </p>

          <div className="space-y-2">
            {OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleResponse(option.value)}
                className="w-full text-left px-4 py-3 bg-white border-2 border-surface-border rounded-lg hover:border-ocean-400 hover:shadow-md transition-all group"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{option.emoji}</span>
                  <span className="text-sm text-text-primary group-hover:text-ocean-600 transition-colors">
                    {option.label}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <p className="text-xs text-text-muted mt-4">
            Your feedback helps us improve. Asked once daily.
          </p>
        </>
      ) : (
        <div className="text-center py-2 animate-fade-in">
          <div className="inline-flex items-center gap-2 text-ocean-600">
            <ThumbsUp className="w-5 h-5" />
            <span className="font-semibold">Thank you for your feedback!</span>
          </div>
        </div>
      )}
    </div>
  )
}
