import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import InviteForm from './invite-form';
import TransactionForm from './transaction-form';
import { DeleteTransactionForm, UpdateTransactionForm } from './transaction-actions';
import { revokeInvitation } from '../actions';
import AuthButton from '@/components/auth-button';
import LedgerAnalyticsFilters from '@/components/ledger-analytics-filters';
import LedgerAnalytics from '@/components/ledger-analytics';
import Sidebar from '@/components/sidebar';
import Avatar from '@/components/avatar';

interface LedgerPageProps {
  params: { id: string };
  searchParams?: {
    from?: string;
    to?: string;
    bucket?: string;
    kind?: string;
  };
}

export default async function LedgerPage({ params, searchParams }: LedgerPageProps) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  // Determine default filters
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const from = (searchParams?.from as string) || thirtyDaysAgo;
  const to = (searchParams?.to as string) || today;
  const bucket = (searchParams?.bucket as 'daily' | 'weekly' | 'monthly') || 'daily';
  const kind = (searchParams?.kind as 'income' | 'expense' | 'both') || 'both';

  const filterValues = { from, to, bucket, kind };

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 lg:grid-cols-[240px_1fr]">
          <Sidebar />
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-semibold">Ledger</h1>
            </div>
            <p className="mt-2 text-sm text-muted">
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

  // Check membership for analytics (defense-in-depth)
  const { data: isMember } = await supabase.rpc('is_ledger_member', {
    p_ledger_id: params.id,
  });

  // Fetch analytics data if user is member
  let timeseriesData: any[] = [];
  let categoryData: any[] = [];

  if (isMember) {
    const [{ data: timeseries, error: tsError }, { data: categories, error: catError }] =
      await Promise.all([
        supabase.rpc('get_ledger_timeseries', {
          p_ledger_id: params.id,
          p_from: from,
          p_to: to,
          p_bucket: bucket,
        }),
        supabase.rpc('get_ledger_category_breakdown', {
          p_ledger_id: params.id,
          p_from: from,
          p_to: to,
          p_kind: kind === 'income' ? 'income' : 'expense',
        }),
      ]);

    timeseriesData = timeseries || [];
    categoryData = categories || [];
  }

  const { data: members } = await supabase
    .from('ledger_members_view')
    .select('user_id, role, created_at, full_name, avatar_url')
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
    <div className="min-h-screen">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 lg:grid-cols-[240px_1fr]">
        <Sidebar />
        <div className="glass-card rounded-3xl p-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/ledgers" className="text-sm text-muted hover:underline">
              ...�� Back to ledgers
            </Link>
            <Link
              href="/profile"
              className="glass-button-muted rounded-full px-4 py-2 text-sm"
            >
              Profile
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">{ledger.name}</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-faint">
                {ledger.type} ledger
              </p>
              {members && members.length > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {members.slice(0, 5).map((member) => (
                      <Avatar
                        key={member.user_id}
                        name={member.full_name ?? member.user_id.slice(0, 8)}
                        seed={member.user_id}
                        size={28}
                        className="avatar-ring"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-faint">
                    {members.length} members
                  </span>
                </div>
              )}
            </div>
            {isOwner && ledger.type === 'shared' && (
              <span className="glass-chip-success rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]">
                Owner
              </span>
            )}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Analytics Section */}
            {isMember && (
              <div className="col-span-full space-y-6">
                <LedgerAnalyticsFilters
                  initialValues={filterValues}
                  ledgerId={params.id}
                />
                <LedgerAnalytics
                  timeseries={timeseriesData}
                  categories={categoryData}
                  meta={filterValues}
                />
              </div>
            )}

            <div className="space-y-6">
              <section className="glass-panel rounded-2xl p-4">
                <h2 className="text-sm font-semibold">Members</h2>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {members?.map((member) => (
                    <li key={member.user_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={member.full_name ?? member.user_id.slice(0, 8)}
                          seed={member.user_id}
                          size={28}
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {member.full_name ?? member.user_id.slice(0, 8)}
                          </p>
                          <p className="font-mono text-xs text-faint">
                            {member.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <span className="text-xs uppercase tracking-[0.2em] text-faint">
                        {member.role}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="glass-panel rounded-2xl p-4">
                <h2 className="text-sm font-semibold">Latest transactions</h2>

                <TransactionForm
                  ledgerId={params.id}
                  defaultDate={filterValues.from}
                />

                <ul className="mt-3 space-y-3 text-sm text-muted">
                  {transactions && transactions.length > 0 ? (
                    transactions.map((trx) => (
                      <li key={trx.id} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {trx.kind === 'income' ? '+' : '-'}{trx.amount}
                            </p>
                            <p className="text-xs text-faint">
                              {trx.category || 'Uncategorized'} ...�� {trx.occurred_at}
                            </p>
                            <p className="text-xs text-faint">{trx.note ?? ''}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <details className="text-sm">
                              <summary className="cursor-pointer text-muted">Edit</summary>
                              <UpdateTransactionForm
                                transactionId={trx.id}
                                occurredAt={trx.occurred_at}
                                kind={trx.kind}
                                amount={trx.amount}
                                category={trx.category}
                                note={trx.note}
                              />
                            </details>

                            <DeleteTransactionForm transactionId={trx.id} />
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-faint">Belum ada transaksi.</li>
                  )}
                </ul>
              </section>
            </div>

            <div className="space-y-6">
              {isOwner && ledger.type === 'shared' ? (
                <InviteForm ledgerId={params.id} />
              ) : (
                <div className="glass-panel rounded-2xl p-4 text-sm text-muted">
                  Anda tidak memiliki akses untuk mengundang anggota.
                </div>
              )}

              <section className="glass-panel rounded-2xl p-4">
                <h2 className="text-sm font-semibold">Invitations</h2>
                <ul className="mt-3 space-y-3 text-sm text-muted">
                  {invitations && invitations.length > 0 ? (
                    invitations.map((invite) => (
                      <li key={invite.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>{invite.invited_email}</span>
                          <span className="text-xs uppercase tracking-[0.2em] text-faint">
                            {invite.status}
                          </span>
                        </div>
                        {invite.token && (
                          <p className="text-xs text-emerald-200">
                            Link: <span className="font-mono">/invite/{invite.token}</span>
                          </p>
                        )}
                        <p className="text-xs text-faint">
                          Expires {new Date(invite.expires_at).toLocaleString()}
                        </p>
                        {isOwner && invite.status === 'pending' && (
                          <form
                            action={revokeInvitation.bind(null, invite.id, params.id)}
                          >
                            <button
                              type="submit"
                              className="glass-button rounded-full px-3 py-1 text-xs"
                            >
                              Revoke
                            </button>
                          </form>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-faint">There is no invitation.</li>
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



