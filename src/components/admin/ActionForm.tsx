"use client";

import { useActionState, useEffect, useState } from "react";
import type { ActionState } from "@/app/admin/actions/catalog";

type Action = (prev: ActionState, form: FormData) => Promise<ActionState>;

/**
 * Form bound to a server action returning {ok|error}; shows the result inline.
 * After a successful save the children are remounted so uncontrolled inputs pick up
 * the freshly revalidated server values.
 */
export function ActionForm({ action, children, className, style, encType, confirmText }: { action: Action; children: React.ReactNode; className?: string; style?: React.CSSProperties; encType?: string; confirmText?: string }) {
  const [state, formAction, pending] = useActionState(action, null);
  const [version, setVersion] = useState(0);
  useEffect(() => { if (state?.ok) setVersion((v) => v + 1); }, [state]);
  return (
    <form action={formAction} className={className} style={style} encType={encType} onSubmit={(e) => { if (confirmText && !confirm(confirmText)) e.preventDefault(); }} data-pending={pending || undefined}>
      {state?.error && <div className="flash flash-err" role="alert">{state.error}</div>}
      {state?.ok && <div className="flash flash-ok" role="status">{state.ok}</div>}
      <div key={version} className="contents">{children}</div>
    </form>
  );
}
