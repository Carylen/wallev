import { createSupabaseServerClient } from '@/lib/supabase/server';
import AuthButtonClient from './auth-button-client';

interface AuthButtonProps {
  redirectTo?: string;
}

export default async function AuthButton({ redirectTo }: AuthButtonProps) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  return <AuthButtonClient isLoggedIn={Boolean(data.user)} redirectTo={redirectTo} />;
}
