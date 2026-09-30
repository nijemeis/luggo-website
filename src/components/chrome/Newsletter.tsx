"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/app/actions/newsletter";

/** Consent-based signup: nothing is stored unless the visitor submits the form. */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ ok?: boolean; error?: string }>({});
  const [pending, start] = useTransition();
  if (state.ok) return <div style={{ font: "700 15px var(--font-head)", color: "var(--success)" }}>Thanks — you’re on the list.</div>;
  return (
    <form
      style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: "1 1 320px", maxWidth: 440 }}
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setState(await subscribeNewsletter(email)));
      }}
    >
      <label className="sr-only" htmlFor="nl-email">Email address</label>
      <input id="nl-email" className="input" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, minWidth: 180 }} aria-invalid={!!state.error} />
      <button type="submit" className="btn btn-primary" style={{ padding: "13px 20px", fontSize: 15 }} disabled={pending}>{pending ? "…" : "Sign up"}</button>
      {state.error && <div className="field-error" style={{ width: "100%" }}>{state.error}</div>}
    </form>
  );
}
