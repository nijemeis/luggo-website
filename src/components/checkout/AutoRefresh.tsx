"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-renders the server page a few times while a payment confirmation is on its way. */
export function AutoRefresh({ seconds, times }: { seconds: number; times: number }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      if (++n > times) clearInterval(t);
      else router.refresh();
    }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds, times]);
  return null;
}
