import { createBrowserClient as supabaseCreateBrowserClient } from '@supabase/ssr'

// Re-export for components that need it
export { supabaseCreateBrowserClient as createBrowserClient }

export function createClient() {
  return supabaseCreateBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
