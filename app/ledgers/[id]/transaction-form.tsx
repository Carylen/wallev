'use client';

import { useEffect, useRef } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createTransaction, type TransactionState } from '../actions';
import CategoryInput from './category-input';

interface TransactionFormProps {
  ledgerId: string;
  defaultDate: string;
}

const initialState: TransactionState = {};

export default function TransactionForm({ ledgerId, defaultDate }: TransactionFormProps) {
  const [state, formAction] = useFormState(createTransaction, initialState);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
    router.refresh();
  }, [state.success, router]);

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        className="mt-3 mb-4 grid gap-2 sm:grid-cols-6"
      >
        <input type="hidden" name="ledgerId" value={ledgerId} />
        <input
          name="occurred_at"
          type="date"
          defaultValue={defaultDate}
          className="glass-input col-span-2 rounded px-3 py-2 text-sm"
          required
        />
        <select
          name="kind"
          defaultValue="expense"
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
          placeholder="0.00"
          className="glass-input rounded px-3 py-2 text-sm"
          required
        />
        <CategoryInput
          className="glass-input col-span-2 rounded px-3 py-2 text-sm"
          placeholder="Category"
        />
        <textarea
          name="note"
          rows={2}
          placeholder="Notes"
          className="glass-input col-span-6 resize-none rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="glass-button col-span-6 rounded-full px-4 py-2 text-sm font-medium sm:col-span-2 sm:justify-self-end"
        >
          Add
        </button>
      </form>
      {state.error && <p className="text-sm text-rose-200">{state.error}</p>}
    </>
  );
}
