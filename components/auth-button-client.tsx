'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

interface AuthButtonClientProps {
  isLoggedIn: boolean;
  redirectTo?: string;
}

export default function AuthButtonClient({ isLoggedIn, redirectTo }: AuthButtonClientProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;

    setLoading(true);
    setSent(false);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const nextPath = redirectTo ?? '/ledgers';
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    if (signInError) {
      setError(signInError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (isLoggedIn) {
    return (
      <button
        type="button"
        className="glass-button rounded-full px-4 py-2 text-sm shadow-lg backdrop-blur disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleLogout}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Logout'}
      </button>
    );
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="auth-email-client" className="sr-only">
          Email
        </label>
        <input
          id="auth-email-client"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@contoh.com"
          className="glass-input min-w-[220px] rounded-full px-4 py-2 text-sm placeholder:text-[color:var(--text-faint)]"
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="glass-button rounded-full px-4 py-2 text-sm shadow-lg backdrop-blur disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading || !email}
        >
          {loading ? 'Mengirim...' : 'Kirim link login'}
        </button>
      </div>
      {sent && (
        <p className="text-xs text-emerald-200">
          Link login sudah dikirim. Cek inbox email Anda.
        </p>
      )}
      {error && <p className="text-xs text-rose-200">{error}</p>}
    </form>
  );
}
