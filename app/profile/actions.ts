'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface ProfileState {
  error?: string;
  success?: boolean;
}

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const fullNameRaw = String(formData.get('full_name') ?? '').trim();
  const full_name = fullNameRaw.length > 0 ? fullNameRaw : null;

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return { error: 'You must be logged in' };
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      full_name,
    },
    { onConflict: 'id' }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/profile');
  revalidatePath(`/profile/${user.id}`);
  return { success: true };
}
