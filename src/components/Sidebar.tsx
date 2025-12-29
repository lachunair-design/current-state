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
  User as UserIcon
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
        <div className="w-8 h-8 bg-accent-green rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-black" />
        </div>
        <span className="font-semibold text-lg text-text-primary">Current State</span>
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
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'text-text-secondary hover:bg-dark-hover hover:text-text-primary'
              )}
            >
              <item.icon className={clsx(
                'w-5 h-5',
                isActive ? 'text-accent-green' : 'text-text-muted'
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-dark-border p-4">
        <Link
          href="/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-dark-hover transition-colors group"
        >
          <div className="w-8 h-8 bg-dark-hover rounded-full flex items-center justify-center group-hover:bg-accent-green/10 transition-colors">
            <UserIcon className="w-4 h-4 text-text-muted group-hover:text-accent-green transition-colors" />
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
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary w-full px-2 py-1 rounded hover:bg-dark-hover transition-colors"
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-dark-card border-b border-dark-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-green rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="font-semibold text-lg text-text-primary">Current State</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-dark-hover text-text-primary"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-64 bg-dark-card flex flex-col pt-16"
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-dark-card border-r border-dark-border">
          <NavContent />
        </div>
      </div>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  )
}
