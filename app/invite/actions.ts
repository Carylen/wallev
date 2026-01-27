'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface AcceptInviteState {
  error?: string;
  ledgerId?: string;
}

export async function acceptInvite(
  token: string,
  _prevState: AcceptInviteState
): Promise<AcceptInviteState> {
  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { error: 'Please log in first' };
  }

  const { data, error } = await supabase.rpc('accept_invitation', {
    p_token: token,
  });

  if (error) {
    return { error: error.message };
  }

  return { ledgerId: data as string };
}
