'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

interface AuthButtonClientProps {
  isLoggedIn: boolean;
  redirectTo?: string;
}

export default function AuthButtonClient({ isLoggedIn, redirectTo }: AuthButtonClientProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const nextPath = redirectTo ?? '/ledgers';
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      nextPath
    )}`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <button
      type="button"
      className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white shadow-lg backdrop-blur disabled:cursor-not-allowed disabled:opacity-50"
      onClick={isLoggedIn ? handleLogout : handleLogin}
      disabled={loading}
    >
      {loading ? 'Loading...' : isLoggedIn ? 'Logout' : 'Login dengan Google'}
    </button>
  );
}
