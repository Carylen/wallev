import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AuthButton from '@/components/auth-button';
import ThemeToggle from '@/components/theme-toggle';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <div className="glass-card rounded-3xl p-10">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xs uppercase tracking-[0.3em] text-faint">Wallev</h1>
            <ThemeToggle />
          </div>
          <p className="mt-4 text-4xl font-semibold">Kelola bersama.</p>
          <p className="mt-3 text-sm text-muted">
            Wallev membantu mencatat transaksi harian dan berbagi ledger dengan tim atau keluarga
            secara aman.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {user ? (
              <>
                <Link
                  href="/ledgers"
                  className="glass-button rounded-full px-5 py-2 text-sm font-medium"
                >
                  Buka Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="glass-button-muted rounded-full px-5 py-2 text-sm"
                >
                  Profile
                </Link>
              </>
            ) : (
              <AuthButton redirectTo="/ledgers" />
            )}
            <Link
              href="/login"
              className="glass-button-muted rounded-full px-5 py-2 text-sm"
            >
              Info login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
