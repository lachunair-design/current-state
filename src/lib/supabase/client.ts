import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie.split(';').map(c => {
            const [name, ...v] = c.trim().split('=')
            return { name, value: v.join('=') }
          })
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = {
              ...options,
              // Persist for 1 year instead of session only
              maxAge: options?.maxAge ?? 365 * 24 * 60 * 60,
              // Ensure cookies work across the site
              path: '/',
              // Use secure cookies in production
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax' as const,
            }

            let cookie = `${name}=${value}`
            if (cookieOptions.maxAge) cookie += `; max-age=${cookieOptions.maxAge}`
            if (cookieOptions.path) cookie += `; path=${cookieOptions.path}`
            if (cookieOptions.secure) cookie += '; secure'
            if (cookieOptions.sameSite) cookie += `; samesite=${cookieOptions.sameSite}`

            document.cookie = cookie
          })
        },
      },
    }
  )
}
