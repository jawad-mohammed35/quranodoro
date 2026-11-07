# 🌴 Quranodoro

A peaceful Pomodoro app for Muslims: focus with Quran recitation, grow a
virtual date farm with every completed session, and watch your consistency
turn into an orchard.

## Features

- **Pomodoro timer** — start / pause / resume / stop / reset / skip break,
  optional auto-start, cycle tracking toward long breaks.
- **Presets** — Classic 25/5, Extended 50/10, Long Form 90/20, Deep Work, Exam
  Mode, plus unlimited custom presets (focus, short break, long break,
  sessions before long break).
- **Quran audio** — twelve complete-Quran reciters, all 114 surahs, volume control.
  Recitation auto-starts with focus sessions, pauses on breaks, and keeps
  playing as you navigate. Audio streams from the public mp3quran.net CDN.
- **Date Farm** — plant Ajwa, Medjool, Sukkari, Deglet Noor, or Barhi trees.
  One tree grows at a time; completed focus sessions award Growth Points that
  advance it through seven stages. Mature trees stay in your orchard forever.
  The math is fully documented on the About Date Farm page.
- **Dashboard** — today's focus, streak, totals, favorite reciter, active
  tree, weekly summary, and a daily Islamic reminder (verse / hadith / dua
  with Arabic, translation, and reference).
- **Dashboard customization** — drag, resize, hide, restore, and automatically save
  separate desktop/mobile layouts, with keyboard controls and touch handles.
- **Tasbih** — 33/99/100/custom targets, saved count, preset/custom dhikr phrases,
  optional vibration, completion history, and confirmed resets.
- **Analytics** — animated Recharts: weekly focus hours and Pomodoros,
  12-month study time (yearly overview), and 30-day streak history.
- **Accounts & sync** — Supabase auth (email/password with verification, plus
  Google OAuth) using the official `@supabase/ssr` server-side setup. New
  users pick a display name on first sign-in, stored in their profile.
  Local-first progress uses separate guest/account caches. Signed-in progress
  syncs to that account; existing guest data is retained separately.
- **Design** — calm pastel light theme, soft charcoal dark theme, remembered
  preference, fully responsive, keyboard/screen-reader friendly.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app is fully usable immediately — accounts
and cloud sync are optional.

### Enabling accounts (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` (creates `profiles`,
   `user_state`, and `sessions` with row-level security).
3. Under **Authentication → Sign In / Providers**, enable **Email** (leave
   "Confirm email" on for email verification). Optionally enable **Google**
   for "Continue with Google" — you'll need a Google Cloud OAuth client ID
   and secret.
4. Under **Authentication → URL Configuration**, set the Site URL to your
   deployed domain (keep `http://localhost:3000` while developing) so email
   confirmation and OAuth redirects land on `/auth/callback`.
5. Copy `.env.example` to `.env.local` and fill in your project URL and
   publishable key (`sb_publishable_...`) from the project's Connect dialog.
6. Restart the dev server.

## Providing your own Quran audio

Audio sources are defined in one place: `src/data/reciters.ts`.

- To self-host: set `audioBaseUrl` to a folder containing `001.mp3` …
  `114.mp3` (zero-padded surah numbers).
- To override individual surahs: add a `customUrls: { 36: "https://…" }` map.
- To add a reciter: append an entry to the `RECITERS` array.

No player code needs to change.

## Project structure

```
src/
  app/            # Next.js App Router pages (one folder per route)
  components/
    audio/        # Global <audio> engine (single instance, survives navigation)
    auth/         # Auth form building blocks
    dashboard/    # Dashboard widgets
    farm/         # Farm view + tree visuals
    layout/       # App shell, nav, theme toggle, page header
    providers/    # Auth context + cloud sync wiring
    quran/        # Player controls + surah browser
    settings/     # Settings form
    timer/        # Timer dial, controls, presets, global ticker
    ui/           # Reusable primitives (Button, Card, Select, Switch, …)
  data/           # Static domain data: surahs, reciters, trees, presets, reminders
  hooks/          # Shared hooks
  lib/            # Types, utilities, cloud sync
  stores/         # Zustand stores (timer, settings, sessions, farm, player)
  utils/
    supabase/     # Official @supabase/ssr helpers (client, server, middleware)
  proxy.ts        # Next.js proxy (middleware) — refreshes auth sessions
supabase/
  schema.sql      # Tables + row-level security for cloud sync
```

### Architecture notes

- **State**: Zustand with `persist` — settings, sessions, and farm live in
  localStorage; the timer derives remaining time from a wall-clock deadline so
  it stays accurate in background tabs.
- **Audio**: one `HTMLAudioElement` owned by `QuranAudioEngine`, driven by
  *intent* in the player store. The timer never touches the DOM; it just
  changes state the engine reacts to.
- **Growth**: pure functions in `src/data/trees.ts` (`growthPointsForMinutes`,
  `stageForGp`, …) — easy to test, rebalance, or extend.
- **Sync**: account-scoped caches with dirty revision tracking. Clean caches load
  the cloud snapshot; pending edits survive reload and sign-out. Writes are
  serialized and retried; sessions merge by ID and load in pages. Snapshot
  conflicts retain last-writer limits described in `docs/AUTH_SETUP.md`.
- **Future-ready**: leaderboards/friends would add tables + read queries;
  achievements can derive from the session log; Ramadan mode is a theme +
  preset variant. The session log is the single source of truth for stats.

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Zustand ·
Framer Motion · Recharts · Supabase (Postgres + Auth) · Lucide icons

## Scripts

| Command         | Purpose                  |
| --------------- | ------------------------ |
| `npm run dev`   | Development server       |
| `npm run build` | Production build         |
| `npm run start` | Serve production build   |
| `npm run lint`  | ESLint                   |

## November 2026 improvements

The pastel identity is retained, with restrained frosted navigation, solid active-tab
icons, reduced-motion support, a focused stopwatch/Quran favicon, Apple touch icon,
and social metadata. **Edit dashboard** provides drag handles, resize corners,
hide buttons, move buttons, and Shift + arrow-key resizing on a focused handle.
**Settings → Dashboard customization** controls visibility and confirms default
restoration. Hiding panels never deletes progress. Small screens use a separate
one-column layout.

Timers save deadlines and preset snapshots across refreshes, offer optional browser
notifications and in-app feedback, and coordinate rewards across tabs using Web
Locks when supported. Custom presets, long breaks, automatic transitions, and farm
growth retain the original mechanics. The farm explains how focus earns growth and
shows today's completed focus. Settings can download a JSON progress backup.

### Added reciters

Seven additional Hafs/Murattal collections: Mahmoud Khalil Al-Husary, Muhammad
Siddiq Al-Minshawi, Abdul Basit Abdus Samad, Saud Al-Shuraim, Abu Bakr Al-Shatri,
Ali Al-Hudhaifi, and Ahmad Al-Ajmy. Their mappings come from the
[official MP3Quran catalogue](https://mp3quran.net/api/v3/reciters?language=eng).
New streams use its `cdn.mp3quran.net/audio/...` endpoints; the five existing
reciters retain their working provider URLs. All 114 Surah endpoints for all twelve
reciters passed HTTP audio-header verification on November 7, 2026.

Audio streams directly; recordings are not downloaded, bundled, or redistributed.
Public catalogue access does not establish a redistribution licence. Confirm
provider permission before adding offline downloads or bundling recordings in
Android. The player includes visible provider attribution.

### Accounts require attention

The configured local Supabase hostname did not resolve during this review. Live
authentication and cloud sync are **not certified**. Restore/check the existing
Supabase project, update local and Vercel environment variables, apply the supplied
email-lookup-removal migration, and verify Google/email flows using
[the authentication setup checklist](docs/AUTH_SETUP.md). No credentials were
committed. See [Android readiness](docs/ANDROID_READINESS.md) and
[release QA](docs/RELEASE_QA.md) for architecture recommendations and verification limits.

### Additional checks

- `npm test` — domain, timer, account separation, dirty sync, and regression tests.
- `npm run typecheck` — TypeScript validation.
- `npm run test:e2e` — Playwright regression suite; run `npx playwright install`
  first, then start the production server in another terminal.
- `npm run verify:audio -- --all` — HEAD checks for every reciter/Surah without
  downloading recordings.
- `node scripts/verify-auth-config.mjs` — read-only public provider/anonymous
  access checks after restoring Supabase.

Browser tests default to `http://localhost:3000`; set `PLAYWRIGHT_BASE_URL` for a
different preview. Guest tests stub Supabase requests and do not verify live OAuth
or email delivery. `npx tsx scripts/verify-playback.mts` checks real Surah 114
decoding/advancing playback for all twelve reciters through the app. Dev and build
scripts use Next.js's supported webpack backend after a Windows Turbopack worker
crash. The scoped minimatch override patches the lint dependency without
downgrading Next.js.
