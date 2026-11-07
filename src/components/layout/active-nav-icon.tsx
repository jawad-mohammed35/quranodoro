/** Filled counterparts keep recognizable details instead of filling outline strokes. */
export function ActiveNavIcon({ href }: { href: string }) {
  const details: Record<string, React.ReactNode> = {
    "/": (
      <>
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="5" rx="2" />
        <rect x="13" y="10" width="8" height="11" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
      </>
    ),
    "/pomodoro": (
      <>
        <rect x="9" y="1" width="6" height="3" rx="1" />
        <circle cx="12" cy="14" r="9" />
        <path
          d="M12 8v6l3 2"
          stroke="var(--card)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
    "/quran": (
      <>
        <path d="M2 4c4-2 7-1 9 1v17c-3-2-6-3-9-1zm20 0c-4-2-7-1-9 1v17c3-2 6-3 9-1z" />
      </>
    ),
    "/tasbih": (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="5" fill="var(--card)" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    "/farm": (
      <>
        <path d="M10 22l1-12h3l1 12zM12 10C5 12 2 10 1 8c3-4 7-4 11-1C8 2 10 0 12 1c3 0 5 3 3 6 4-3 7-2 8 1-3 4-7 3-9 2z" />
      </>
    ),
    "/analytics": (
      <>
        <rect x="3" y="12" width="5" height="10" rx="1" />
        <rect x="10" y="6" width="5" height="16" rx="1" />
        <rect x="17" y="2" width="5" height="20" rx="1" />
      </>
    ),
    "/about-farm": (
      <>
        <circle cx="12" cy="12" r="10" />
        <path
          d="M12 11v7M12 6v1"
          fill="none"
          stroke="var(--card)"
          strokeWidth="2.5"
        />
      </>
    ),
    "/settings": (
      <>
        <path d="M9 2h6l1 3 3 1 3 4-2 2 1 4-4 3-3-1-2 4-5-2v-3l-4-2 1-5 3-1z" />
        <circle cx="12" cy="12" r="3" fill="var(--card)" />
      </>
    ),
    "/about": (
      <>
        <circle cx="12" cy="7" r="5" />
        <path d="M2 22v-3c0-8 20-8 20 0v3z" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4.5 w-4.5 shrink-0 text-primary"
      fill="currentColor"
      aria-hidden="true"
    >
      {details[href]}
    </svg>
  );
}
