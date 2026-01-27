import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AuthButton from '@/components/auth-button';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Wallev</p>
          <h1 className="mt-4 text-4xl font-semibold">Kelola pemasukan & pengeluaran bersama.</h1>
          <p className="mt-3 text-sm text-white/70">
            Wallev membantu mencatat transaksi harian dan berbagi ledger dengan tim atau keluarga
            secara aman.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {user ? (
              <Link
                href="/ledgers"
                className="rounded-full border border-white/20 bg-white/20 px-5 py-2 text-sm font-medium text-white"
              >
                Buka Dashboard
              </Link>
            ) : (
              <AuthButton redirectTo="/ledgers" />
            )}
            <Link
              href="/login"
              className="rounded-full border border-white/10 bg-transparent px-5 py-2 text-sm text-white/70"
            >
              Info login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
