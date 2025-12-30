import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { BottomNav } from '@/components/BottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  // Redirect to onboarding if not completed (except if already on onboarding page)
  // This check happens in individual pages now

  return (
    <div className="min-h-screen page-gradient">
      <Sidebar user={user} />
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
