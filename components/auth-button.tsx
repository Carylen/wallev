'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface AuthButtonProps {
  redirectTo: string;
}

export default function AuthButton({ redirectTo }: AuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const redirectUrl = redirectTo.startsWith('http')
      ? redirectTo
      : `${window.location.origin}${redirectTo}`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    setLoading(false);
  };

  return (
    <button
      type="button"
      className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white shadow-lg backdrop-blur disabled:cursor-not-allowed disabled:opacity-50"
      onClick={handleLogin}
      disabled={loading}
    >
      {loading ? 'Redirecting...' : 'Login with Google'}
    </button>
  );
}
