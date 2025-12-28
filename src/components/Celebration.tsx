'use client'

import { useEffect, useState } from 'react'
import { Sparkles, PartyPopper } from 'lucide-react'

interface CelebrationProps {
  message: string
  onClose?: () => void
  duration?: number
}

export function Celebration({ message, onClose, duration = 3000 }: CelebrationProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!show) return null

  return (
    <>
      {/* Confetti Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="confetti-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      </div>

      {/* Celebration Message */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md animate-scale-in border-4 border-primary-500">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <PartyPopper className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Amazing!</h2>
            <p className="text-lg text-gray-700">{message}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: confetti-fall 3s linear forwards;
        }

        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}

// Hook for triggering celebrations
export function useCelebration() {
  const [celebration, setCelebration] = useState<{ message: string } | null>(null)

  const celebrate = (message: string) => {
    setCelebration({ message })
  }

  const clear = () => {
    setCelebration(null)
  }

  return {
    celebration,
    celebrate,
    clear,
    CelebrationComponent: celebration ? (
      <Celebration message={celebration.message} onClose={clear} />
    ) : null
  }
}
