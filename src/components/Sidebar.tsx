'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Zap,
  LayoutDashboard,
  Target,
  CheckSquare,
  Sparkles,
  Heart,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  HelpCircle
} from 'lucide-react'
import { User } from '@supabase/supabase-js'
import clsx from 'clsx'

interface SidebarProps {
  user: User
}

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Current State', href: '/checkin', icon: Sparkles },
  { name: 'Destinations', href: '/goals', icon: Target },
  { name: 'Steps', href: '/tasks', icon: CheckSquare },
  { name: 'Rituals', href: '/habits', icon: Heart },
  { name: 'How It Works', href: '/how-it-works', icon: HelpCircle },
]

export function Sidebar({ user }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-6">
        <div className="w-8 h-8 bg-gradient-flow rounded-lg flex items-center justify-center shadow-md">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="font-accent font-semibold text-lg text-text-primary">Current State</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-gradient-ocean text-white shadow-md'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              )}
            >
              <item.icon className={clsx(
                'w-5 h-5',
                isActive ? 'text-white' : 'text-text-muted'
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-surface-border p-4">
        <Link
          href="/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-surface-hover transition-colors group"
        >
          <div className="w-8 h-8 bg-gradient-sunset rounded-full flex items-center justify-center shadow-sm">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-ocean-600 w-full px-2 py-1.5 rounded hover:bg-surface-hover transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-surface-border px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-flow rounded-lg flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-accent font-semibold text-lg text-text-primary">Current State</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-surface-hover text-text-primary"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl flex flex-col pt-16"
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-surface-border shadow-sm">
          <NavContent />
        </div>
      </div>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  )
}
