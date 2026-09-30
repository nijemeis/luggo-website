"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ActionState } from "@/app/admin/actions/catalog";

/** Button that runs a server action (optionally after a confirm) and refreshes the page. */
export function ActionButton({ action, children, confirmText, className = "btn btn-outline btn-xs" }: { action: () => Promise<ActionState | void>; children: React.ReactNode; confirmText?: string; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        className={className}
        disabled={pending}
        onClick={() => {
          if (confirmText && !confirm(confirmText)) return;
          start(async () => {
            const res = await action();
            if (res && "error" in res && res.error) setMsg(res.error);
            else { setMsg(""); router.refresh(); }
          });
        }}
      >
        {pending ? "…" : children}
      </button>
      {msg && <span className="field-error">{msg}</span>}
    </span>
  );
}
