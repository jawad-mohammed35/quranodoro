"use client";

import { useEffect, useState } from "react";

/**
 * True after the first client render, false during SSR and hydration.
 * Used to gate values read from persisted (localStorage) stores so the
 * hydration pass always matches the server-rendered markup.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Canonical hydration-gate: this single post-hydration re-render is
    // intentional and required for correctness with persisted stores.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  return mounted;
}
