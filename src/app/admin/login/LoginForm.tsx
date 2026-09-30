"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} style={{ display: "grid", gap: 14, marginTop: 22 }}>
      <input type="hidden" name="next" value={next} />
      <label className="field">
        <span>Password</span>
        <input className="input" type="password" name="password" autoComplete="current-password" autoFocus required />
      </label>
      {state?.error && <div className="field-error" role="alert">{state.error}</div>}
      <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Checking…" : "Log in"}</button>
      <p className="help">Set the password with ADMIN_PASSWORD in .env</p>
    </form>
  );
}
