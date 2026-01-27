import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSharedLedger } from './actions';
import AuthButton from '@/components/auth-button';

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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/50">
                Shared Ledger
              </p>
              <h1 className="text-3xl font-semibold">Ledger Anda</h1>
            </div>
            {!user && <AuthButton redirectTo="/ledgers" />}
          </div>

          {user ? (
            <div className="mt-8 space-y-6">
              <form action={createSharedLedger} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  name="name"
                  placeholder="Nama shared ledger"
                  className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/50"
                  required
                />
                <button
                  type="submit"
                  className="rounded-full border border-white/20 bg-white/20 px-5 py-2 text-sm font-medium text-white"
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
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-medium">{ledger.name}</p>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                            {ledger.type}
                          </p>
                        </div>
                        <span className="text-xs text-white/60">Open →</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-white/60">
                    Belum ada ledger. Buat shared ledger pertama Anda.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-white/60">
              Silakan login untuk melihat ledger Anda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
