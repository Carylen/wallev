import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AuthButton from '@/components/auth-button';

interface InvitePageProps {
  params: { token: string };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
            <h1 className="text-2xl font-semibold">Join shared ledger</h1>
            <p className="mt-2 text-sm text-white/60">
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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          {error ? (
            <>
              <h1 className="text-2xl font-semibold">Invite gagal</h1>
              <p className="mt-2 text-sm text-rose-200">{error.message}</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold">Berhasil bergabung</h1>
              <p className="mt-2 text-sm text-emerald-200">
                Anda telah bergabung ke ledger shared.
              </p>
              <Link
                href={`/ledgers/${data}`}
                className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white"
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
