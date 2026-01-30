'use client';

import { useFormState } from 'react-dom';
import { updateProfile, type ProfileState } from './actions';

interface ProfileFormProps {
  defaultName?: string | null;
}

const initialState: ProfileState = {};

export default function ProfileForm({ defaultName }: ProfileFormProps) {
  const [state, formAction] = useFormState(updateProfile, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <label htmlFor="full_name" className="text-xs uppercase tracking-[0.2em] text-faint">
        Display Name
      </label>
      <input
        id="full_name"
        name="full_name"
        type="text"
        defaultValue={defaultName ?? ''}
        placeholder="Nama kamu"
        className="glass-input w-full rounded px-3 py-2 text-sm"
      />
      <div className="flex items-center gap-3">
        <button type="submit" className="glass-button rounded-full px-4 py-2 text-sm">
          Save
        </button>
        {state.success && <span className="text-xs text-emerald-200">Tersimpan</span>}
        {state.error && <span className="text-xs text-rose-200">{state.error}</span>}
      </div>
    </form>
  );
}
