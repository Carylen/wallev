'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  updateTransaction,
  deleteTransaction,
  type TransactionState,
} from '../actions';
import CategoryInput from './category-input';

interface UpdateTransactionFormProps {
  transactionId: string;
  occurredAt: string;
  kind: 'income' | 'expense';
  amount: number;
  category: string | null;
  note: string | null;
}

const initialState: TransactionState = {};

export function UpdateTransactionForm({
  transactionId,
  occurredAt,
  kind,
  amount,
  category,
  note,
}: UpdateTransactionFormProps) {
  const [state, formAction] = useFormState(updateTransaction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
  }, [state.success, router]);

  return (
    <form action={formAction} className="mt-2 grid gap-2">
      <input type="hidden" name="transactionId" value={transactionId} />
      <input
        name="occurred_at"
        type="date"
        defaultValue={occurredAt}
        className="glass-input rounded px-3 py-2 text-sm"
        required
      />
      <select
        name="kind"
        defaultValue={kind}
        className="glass-input rounded px-3 py-2 text-sm"
        required
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <input
        name="amount"
        type="number"
        step="0.01"
        defaultValue={amount}
        className="glass-input rounded px-3 py-2 text-sm"
        required
      />
      <CategoryInput
        defaultValue={category}
        className="glass-input rounded px-3 py-2 text-sm"
        placeholder="Category"
      />
      <textarea
        name="note"
        rows={2}
        defaultValue={note ?? ''}
        className="glass-input resize-none rounded px-3 py-2 text-sm"
        placeholder="Notes"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="glass-button rounded-full px-3 py-1 text-sm"
        >
          Save
        </button>
      </div>
      {state.error && <p className="text-xs text-rose-200">{state.error}</p>}
    </form>
  );
}

interface DeleteTransactionFormProps {
  transactionId: string;
}

export function DeleteTransactionForm({ transactionId }: DeleteTransactionFormProps) {
  const [state, formAction] = useFormState(deleteTransaction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
  }, [state.success, router]);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="transactionId" value={transactionId} />
      <button
        type="submit"
        className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-sm text-rose-200"
      >
        Delete
      </button>
      {state.error && <p className="text-xs text-rose-200">{state.error}</p>}
    </form>
  );
}
