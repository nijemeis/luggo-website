"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, className = "btn btn-ink btn-sm", pendingText = "Saving…", style }: { children: React.ReactNode; className?: string; pendingText?: string; style?: React.CSSProperties }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={className} disabled={pending} style={style}>{pending ? pendingText : children}</button>;
}
