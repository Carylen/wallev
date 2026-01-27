'use client';

import { useFormState } from 'react-dom';
import { inviteByEmail, type InviteState } from '../actions';

interface InviteFormProps {
  ledgerId: string;
}

const initialState: InviteState = {};

export default function InviteForm({ ledgerId }: InviteFormProps) {
  const inviteByEmailWithId = inviteByEmail.bind(null, ledgerId);
  const [state, formAction] = useFormState(inviteByEmailWithId, initialState);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">Invite by email</h3>
      <form action={formAction} className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          name="email"
          placeholder="email@domain.com"
          className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/50"
          required
        />
        <button
          type="submit"
          className="rounded-full border border-white/20 bg-white/20 px-5 py-2 text-sm font-medium text-white"
        >
          Send Invite
        </button>
      </form>
      {state.error && (
        <p className="mt-2 text-sm text-rose-200">{state.error}</p>
      )}
      {state.token && (
        <p className="mt-2 text-sm text-emerald-200">
          Link undangan: <span className="font-mono">/invite/{state.token}</span>
        </p>
      )}
    </div>
  );
}
