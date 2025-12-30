'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Sparkles, CheckSquare, Target, User } from 'lucide-react'
import clsx from 'clsx'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Check-in', href: '/checkin', icon: Sparkles },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-border shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[64px]',
                isActive
                  ? 'text-ocean-600'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <div className={clsx(
                'p-2 rounded-xl transition-all',
                isActive && 'bg-ocean-100'
              )}>
                <Icon className={clsx(
                  'w-5 h-5',
                  isActive && 'text-ocean-600'
                )} />
              </div>
              <span className={clsx(
                'text-xs font-medium',
                isActive && 'text-ocean-600'
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
