import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AuthButton from '@/components/auth-button';
import Sidebar from '@/components/sidebar';
import Avatar from '@/components/avatar';
import ProfileForm from './profile-form';

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 lg:grid-cols-[240px_1fr]">
          <Sidebar />
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-semibold">Profile</h1>
            </div>
            <p className="mt-2 text-sm text-muted">
              Silakan login untuk melihat profil Anda.
            </p>
            <div className="mt-4">
              <AuthButton redirectTo="/profile" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const displayName = profile?.full_name ?? user.email?.split('@')[0] ?? 'User';

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 lg:grid-cols-[240px_1fr]">
        <Sidebar />
        <div className="glass-card rounded-3xl p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={displayName} seed={user.id} size={56} />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-faint">
                  Account
                </p>
                <h1 className="text-3xl font-semibold">Profile</h1>
                <p className="text-sm text-muted">{displayName}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-faint">Email</p>
              <p className="mt-2 text-sm">{user.email}</p>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-faint">User ID</p>
              <p className="mt-2 font-mono text-xs">{user.id}</p>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-faint">Created</p>
              <p className="mt-2 text-sm">
                {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-faint">Last Sign In</p>
              <p className="mt-2 text-sm">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : '-'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="glass-panel rounded-2xl p-4">
              <ProfileForm defaultName={profile?.full_name} />
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-faint">
                Quick Links
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href={`/profile/${user.id}`}
                  className="glass-button rounded-full px-4 py-2 text-sm"
                >
                  View Detail
                </Link>
                <Link
                  href="/ledgers"
                  className="glass-button-muted rounded-full px-4 py-2 text-sm"
                >
                  Back to Ledgers
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
