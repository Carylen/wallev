import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import InviteForm from './invite-form';
import { revokeInvitation } from '../actions';
import AuthButton from '@/components/auth-button';

interface LedgerPageProps {
  params: { id: string };
}

export default async function LedgerPage({ params }: LedgerPageProps) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
            <h1 className="text-2xl font-semibold">Ledger</h1>
            <p className="mt-2 text-sm text-white/60">
              Silakan login untuk melihat ledger.
            </p>
            <div className="mt-4">
              <AuthButton redirectTo={`/ledgers/${params.id}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { data: ledger } = await supabase
    .from('ledgers')
    .select('id, name, type, owner_id, created_at')
    .eq('id', params.id)
    .single();

  if (!ledger) {
    notFound();
  }

  const { data: members } = await supabase
    .from('ledger_members')
    .select('user_id, role, created_at')
    .eq('ledger_id', params.id)
    .order('created_at', { ascending: true });

  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, occurred_at, kind, amount, category, note')
    .eq('ledger_id', params.id)
    .order('occurred_at', { ascending: false })
    .limit(5);

  const { data: invitations } = await supabase
    .from('invitations_safe')
    .select('id, invited_email, status, expires_at, token')
    .eq('ledger_id', params.id)
    .order('created_at', { ascending: false });

  const isOwner = ledger.owner_id === user.id;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <Link href="/ledgers" className="text-sm text-white/50 hover:text-white">
            ← Back to ledgers
          </Link>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">{ledger.name}</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                {ledger.type} ledger
              </p>
            </div>
            {isOwner && ledger.type === 'shared' && (
              <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">
                Owner
              </span>
            )}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold text-white">Members</h2>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                  {members?.map((member) => (
                    <li key={member.user_id} className="flex items-center justify-between">
                      <span className="font-mono text-xs">
                        {member.user_id.slice(0, 8)}…
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                        {member.role}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold text-white">Latest transactions</h2>
                <ul className="mt-3 space-y-3 text-sm text-white/70">
                  {transactions && transactions.length > 0 ? (
                    transactions.map((trx) => (
                      <li key={trx.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">
                            {trx.kind === 'income' ? '+' : '-'}{trx.amount}
                          </p>
                          <p className="text-xs text-white/50">
                            {trx.category || 'Uncategorized'} • {trx.occurred_at}
                          </p>
                        </div>
                        <span className="text-xs text-white/40">{trx.note ?? ''}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-white/50">Belum ada transaksi.</li>
                  )}
                </ul>
              </section>
            </div>

            <div className="space-y-6">
              {isOwner && ledger.type === 'shared' ? (
                <InviteForm ledgerId={params.id} />
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                  Anda tidak memiliki akses untuk mengundang anggota.
                </div>
              )}

              <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold text-white">Invitations</h2>
                <ul className="mt-3 space-y-3 text-sm text-white/70">
                  {invitations && invitations.length > 0 ? (
                    invitations.map((invite) => (
                      <li key={invite.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>{invite.invited_email}</span>
                          <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                            {invite.status}
                          </span>
                        </div>
                        {invite.token && (
                          <p className="text-xs text-emerald-200">
                            Link: <span className="font-mono">/invite/{invite.token}</span>
                          </p>
                        )}
                        <p className="text-xs text-white/40">
                          Expires {new Date(invite.expires_at).toLocaleString()}
                        </p>
                        {isOwner && invite.status === 'pending' && (
                          <form
                            action={revokeInvitation.bind(null, invite.id, params.id)}
                          >
                            <button
                              type="submit"
                              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/70"
                            >
                              Revoke
                            </button>
                          </form>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-white/50">Belum ada undangan.</li>
                  )}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
