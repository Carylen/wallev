'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function createSharedLedger(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();

  if (!name) {
    throw new Error('Ledger name is required');
  }

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('You must be logged in');
  }

  const { data: ledger, error } = await supabase
    .from('ledgers')
    .insert({
      name,
      type: 'shared',
      owner_id: userData.user.id,
    })
    .select('id')
    .single();

  if (error || !ledger) {
    throw new Error(error?.message ?? 'Failed to create ledger');
  }

  const { error: memberError } = await supabase.from('ledger_members').insert({
    ledger_id: ledger.id,
    user_id: userData.user.id,
    role: 'owner',
  });

  if (memberError) {
    throw new Error(memberError.message);
  }

  revalidatePath('/ledgers');
}

export interface InviteState {
  error?: string;
  token?: string;
  invitationId?: string;
}

export interface TransactionState {
  error?: string;
  success?: boolean;
}

export async function inviteByEmail(
  ledgerId: string,
  _prevState: InviteState,
  formData: FormData
): Promise<InviteState> {
  const rawEmail = String(formData.get('email') ?? '');
  const email = normalizeEmail(rawEmail);

  if (!email || !email.includes('@')) {
    return { error: 'Email tidak valid' };
  }

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { error: 'You must be logged in' };
  }

  const { data: ledger, error: ledgerError } = await supabase
    .from('ledgers')
    .select('id, type, owner_id')
    .eq('id', ledgerId)
    .single();

  if (ledgerError || !ledger) {
    return { error: 'Ledger tidak ditemukan' };
  }

  if (ledger.type !== 'shared') {
    return { error: 'Invitations only allowed for shared ledger' };
  }

  if (ledger.owner_id !== userData.user.id) {
    return { error: 'Only owner can invite' };
  }

  const { data: lookupData } = await supabase.rpc('lookup_user_id_by_email', {
    p_email: email,
  });

  if (lookupData) {
    const { data: existingMember } = await supabase
      .from('ledger_members')
      .select('user_id')
      .eq('ledger_id', ledgerId)
      .eq('user_id', lookupData)
      .maybeSingle();

    if (existingMember) {
      return { error: 'User sudah menjadi member' };
    }
  }

  const token = crypto.randomBytes(32).toString('hex');

  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      ledger_id: ledgerId,
      invited_email: email,
      invited_user_id: lookupData ?? null,
      inviter_user_id: userData.user.id,
      token,
    })
    .select('id')
    .single();

  if (error || !invitation) {
    return { error: error?.message ?? 'Gagal membuat undangan' };
  }

  revalidatePath(`/ledgers/${ledgerId}`);
  return { token, invitationId: invitation.id };
}

export async function revokeInvitation(invitationId: string, ledgerId: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.rpc('revoke_invitation', {
    p_invitation_id: invitationId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/ledgers/${ledgerId}`);
}

// Transaction CRUD server actions
export async function createTransaction(
  _prevState: TransactionState,
  formData: FormData
): Promise<TransactionState> {
  const ledgerId = String(formData.get('ledgerId') ?? '').trim();
  const occurred_at = String(formData.get('occurred_at') ?? '').trim();
  const kind = String(formData.get('kind') ?? '').trim();
  const amountRaw = String(formData.get('amount') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim() || null;
  const note = String(formData.get('note') ?? '').trim() || null;

  if (!ledgerId || !occurred_at || !kind || !amountRaw) {
    return { error: 'Missing transaction fields' };
  }

  const amount = Number(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) {
    return { error: 'Amount must be > 0' };
  }

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: 'You must be logged in' };
  }

  // Double-check ledger exists
  const { data: ledger, error: ledgerError } = await supabase
    .from('ledgers')
    .select('id, type, owner_id')
    .eq('id', ledgerId)
    .single();

  if (ledgerError || !ledger) {
    return { error: ledgerError?.message ?? 'Ledger not found' };
  }

  const { error } = await supabase.from('transactions').insert({
    ledger_id: ledgerId,
    created_by: userData.user.id,
    occurred_at: occurred_at,
    kind,
    amount,
    category,
    note,
  });

  console.log('Transaction data:', { ledgerId, occurred_at, kind, amount, category, note });
  console.log('User ID:', userData.user.id);
  console.log('Ledger:', ledger);
  if (error) {
    const msg = typeof error.message === 'string' ? error.message : 'Failed to create transaction';
    console.error('Error creating transaction:', error);
    return { error: msg };
  }

  revalidatePath(`/ledgers/${ledgerId}`);
  return { success: true };
}

export async function updateTransaction(
  _prevState: TransactionState,
  formData: FormData
): Promise<TransactionState> {
  const transactionId = String(formData.get('transactionId') ?? '').trim();
  const occurred_at = String(formData.get('occurred_at') ?? '').trim();
  const kind = String(formData.get('kind') ?? '').trim();
  const amountRaw = String(formData.get('amount') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim() || null;
  const note = String(formData.get('note') ?? '').trim() || null;

  if (!transactionId) {
    return { error: 'Missing transaction id' };
  }

  const amount = Number(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) {
    return { error: 'Amount must be > 0' };
  }

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: 'You must be logged in' };
  }


  const { error } = await supabase
    .from('transactions')
    .update({ occurred_at, kind, amount, category, note })
    .eq('id', transactionId);

  if (error) {
    const msg = typeof error.message === 'string' ? error.message : 'Failed to update transaction';
    return { error: msg };
  }

  return { success: true };
}

export async function deleteTransaction(
  _prevState: TransactionState,
  formData: FormData
): Promise<TransactionState> {
  const transactionId = String(formData.get('transactionId') ?? '').trim();
  if (!transactionId) {
    return { error: 'Missing transaction id' };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
  if (error) {
    const msg = typeof error.message === 'string' ? error.message : 'Failed to delete transaction';
    return { error: msg };
  }

  return { success: true };
}
