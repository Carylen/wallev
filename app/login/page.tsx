import AuthButton from '@/components/auth-button';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur">
          <h1 className="text-3xl font-semibold">Login ke Wallev</h1>
          <p className="mt-3 text-sm text-white/70">
            Gunakan akun Google yang sudah diundang untuk bergabung ke shared ledger.
          </p>
          <div className="mt-6">
            <AuthButton redirectTo="/ledgers" />
          </div>
        </div>
      </div>
    </div>
  );
}
