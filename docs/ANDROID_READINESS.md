# Preparing for Android

No Android application has been added. The existing Next.js and Supabase architecture is retained.

- Keep `src/lib/types.ts`, the dashboard preference model in `src/lib/dashboard.ts`, reciter/Surah catalogues, growth calculations, and statistics helpers as the platform-neutral domain contract. Android can reproduce these rules and JSON models; React components, browser storage, and HTML audio remain web adapters.
- Continue using the existing Supabase user IDs and RLS-protected `profiles`, `user_state`, and `sessions` tables. Native authentication should use the Supabase-supported Android client, platform-secure session storage, and explicitly registered deep links. Browser cookies and localStorage must not be copied to Android.
- Retain stable reciter IDs and user-selected Surah numbers. Resolve audio URLs through one catalogue adapter. Android playback belongs in a foreground media service with platform audio focus and media-session controls. Offline audio needs provider permission and a separate storage policy.
- Store timer deadlines and preset snapshots rather than decrementing a counter. Use the platform's monotonic clock for active timing and deliberate wall-clock reconciliation after process death. Define the same policy as the web app: finishing a long-unattended deadline awards its focus session once; auto-start begins the next phase on return instead of manufacturing many unattended sessions.
- Keep desktop and mobile dashboard preferences distinct. Native layouts can interpret the mobile ordering/visibility while applying native constraints; they need not reproduce the browser's pixel dimensions.
- Before supporting simultaneous offline use on several devices, add an idempotent backend event model for tree growth and dhikr, with session-to-tree association and transactional reward application. Current JSON snapshots have documented last-writer conflict limits. This should be a deliberate migration with backups, not an incidental UI refactor.
- Add database integration tests for two authenticated users and version preference payloads before a mobile release. The new web regression tests cover domain behavior and browser persistence; they do not replace backend RLS tests.

Useful next improvements after repairing production auth are a controlled-account integration suite and an explicit, reviewed backup-import flow. Notifications while the browser is fully closed would require a service worker/push design; the current timer intentionally reconciles when the app resumes.
