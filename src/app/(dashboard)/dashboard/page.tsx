import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: { onboarding_completed?: boolean; full_name?: string | null } | null }

  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  // Energy is the default entry point - redirect to check-in
  redirect('/checkin')
}
