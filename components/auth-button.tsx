'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface AuthButtonProps {
  redirectTo: string;
}

export default function AuthButton({ redirectTo }: AuthButtonProps) {
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
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      redirectTo
    )}`;
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

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="auth-email" className="sr-only">
          Email
        </label>
        <input
          id="auth-email"
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
