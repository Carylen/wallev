import AuthButton from '@/components/auth-button';
import ThemeToggle from '@/components/theme-toggle';

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <div className="glass-card rounded-3xl p-10">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-semibold">Login ke Wallev</h1>
            <ThemeToggle />
          </div>
          <p className="mt-3 text-sm text-muted">
            Gunakan email yang sudah diundang untuk bergabung ke shared ledger.
          </p>
          <div className="mt-6">
            <AuthButton redirectTo="/ledgers" />
          </div>
        </div>
      </div>
    </div>
  );
}
