import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const createSupabaseServerClient = () => {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      // NOTE:
      // Modifying cookies is not allowed during normal Server Component
      // rendering in Next.js (only Server Actions or Route Handlers may
      // modify cookies). To avoid runtime errors like:
      // "Cookies can only be modified in a Server Action or Route Handler",
      // we provide no-op implementations for `set` and `remove` here.
      // This means server-side code won't persist new cookies via this
      // helper; token refresh flows that attempt to set cookies should
      // be handled in Server Actions or Route Handlers instead.
      set() {
        // no-op in server component context
      },
      remove() {
        // no-op in server component context
      },
    },
  });
};
