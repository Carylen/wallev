import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AuthButton from '@/components/auth-button';
import ThemeToggle from '@/components/theme-toggle';

interface InvitePageProps {
  params: { token: string };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-semibold">Join shared ledger</h1>
              <ThemeToggle />
            </div>
            <p className="mt-2 text-sm text-muted">
              Login dengan email yang diundang untuk melanjutkan.
            </p>
            <div className="mt-6">
              <AuthButton redirectTo={`/invite/${params.token}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { data, error } = await supabase.rpc('accept_invitation', {
    p_token: params.token,
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="glass-card rounded-3xl p-8">
          {error ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-semibold">Invite gagal</h1>
                <ThemeToggle />
              </div>
              <p className="mt-2 text-sm text-rose-200">{error.message}</p>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-semibold">Berhasil bergabung</h1>
                <ThemeToggle />
              </div>
              <p className="mt-2 text-sm text-emerald-200">
                Anda telah bergabung ke ledger shared.
              </p>
              <Link
                href={`/ledgers/${data}`}
                className="glass-button mt-6 inline-flex rounded-full px-4 py-2 text-sm"
              >
                Buka ledger
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
