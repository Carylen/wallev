import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSharedLedger } from './actions';
import AuthButton from '@/components/auth-button';
import Sidebar from '@/components/sidebar';

export default async function LedgersPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: ledgers } = user
    ? await supabase
        .from('ledgers')
        .select('id, name, type, owner_id, created_at')
        .order('created_at', { ascending: false })
    : { data: [] };

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 lg:grid-cols-[240px_1fr]">
        <Sidebar />
        <div className="glass-card rounded-3xl p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-faint">
                Shared Ledger
              </p>
              <h1 className="text-3xl font-semibold">Ledger Anda</h1>
            </div>
            <div className="flex items-center gap-3">
              {!user && <AuthButton redirectTo="/ledgers" />}
              {user && (
                <Link
                  href="/profile"
                  className="glass-button-muted rounded-full px-4 py-2 text-sm"
                >
                  Profile
                </Link>
              )}
            </div>
          </div>

          {user ? (
            <div className="mt-8 space-y-6">
              <form action={createSharedLedger} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  name="name"
                  placeholder="Nama shared ledger"
                  className="glass-input flex-1 rounded-full px-4 py-2 text-sm placeholder:text-[color:var(--text-faint)]"
                  required
                />
                <button
                  type="submit"
                  className="glass-button rounded-full px-5 py-2 text-sm font-medium"
                >
                  Create Shared Ledger
                </button>
              </form>

              <div className="grid gap-4">
                {ledgers && ledgers.length > 0 ? (
                  ledgers.map((ledger) => (
                    <Link
                      key={ledger.id}
                      href={`/ledgers/${ledger.id}`}
                      className="glass-panel rounded-2xl p-4 transition hover:scale-[1.01]"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-medium">{ledger.name}</p>
                          <p className="text-xs uppercase tracking-[0.2em] text-faint">
                            {ledger.type}
                          </p>
                        </div>
                        <span className="text-xs text-muted">Open →</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted">
                    Belum ada ledger. Buat shared ledger pertama Anda.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">
              Silakan login untuk melihat ledger Anda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
