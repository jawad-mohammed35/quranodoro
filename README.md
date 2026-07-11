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
- **Quran audio** — five complete-Quran reciters (Alafasy, Al-Sudais,
  Al-Muaiqly, Al-Ghamdi, Al-Dosari), all 114 surahs, volume control.
  Recitation auto-starts with focus sessions, pauses on breaks, and keeps
  playing as you navigate. Audio streams from the public mp3quran.net CDN.
- **Date Farm** — plant Ajwa, Medjool, Sukkari, Deglet Noor, or Barhi trees.
  One tree grows at a time; completed focus sessions award Growth Points that
  advance it through seven stages. Mature trees stay in your orchard forever.
  The math is fully documented on the About Date Farm page.
- **Dashboard** — today's focus, streak, totals, favorite reciter, active
  tree, weekly summary, and a daily Islamic reminder (verse / hadith / dua
  with Arabic, translation, and reference).
- **Analytics** — animated Recharts: weekly focus hours and Pomodoros,
  12-month study time (yearly overview), and 30-day streak history.
- **Accounts & sync** — Supabase auth (email/password with verification, plus
  Google OAuth) using the official `@supabase/ssr` server-side setup. New
  users pick a display name on first sign-in, stored in their profile.
  Local-first: everything works offline/anonymous via localStorage, and syncs
  to the cloud once you sign in.
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
- **Sync**: local-first. On sign-in the cloud snapshot wins; a fresh account
  is seeded from local data. Changes push with a 2 s debounce; sessions are
  append-only rows.
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
