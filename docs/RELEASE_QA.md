# Release verification — November 7, 2026

## Passed

- `npm run lint`: no errors or warnings.
- `npm run typecheck`: passed.
- `npm test`: 14 domain/regression tests passed. These cover layout normalization, callback destinations, audio URL construction, focus/break transitions, single-completion rewards, farm maturity, dhikr history, account isolation, failed/stale cloud reads, offline preferences, malformed preferences, and month-end analytics.
- `npm run build`: passed with Next.js 16.4.5's supported webpack backend; all pages and auth handlers compiled. The prior default Turbopack run failed in its Windows PostCSS worker; dev/build scripts now select webpack explicitly.
- `npm audit`: zero reported vulnerabilities, including development dependencies. Next.js and eslint-config-next were updated together, and a scoped patched minimatch override resolves the lint dependency advisory.
- Production-build browser regression suite: **21 passed, 1 skipped** across Chromium and WebKit. The skipped case uses Chromium-only CDP touch injection; that touch case passed in Chromium.
- Browser tests exercised drag/drop, resizing, hide/show, saved layouts, keyboard rearrangement, reset cancellation/confirmation, timer reload/pause/resume/stop, saved dhikr count, target 100, light/dark persistence, mobile menu Escape handling, media rejection/retry, stalled-media timeout, tree planting, and single farm rewards with two tabs.
- Horizontal-overflow checks passed on dashboard, Pomodoro, Quran, Tasbih, farm, settings, and analytics at widths **320, 375, 430, 768, 1024, 1440, and 2560**, in both tested engines. Desktop/mobile screenshots were reviewed in WebKit. Default desktop panels had no internal content overflow in the empty-state fixture.
- Existing English, Arabic, French, Turkish, Indonesian, and Chinese language selections fit the 375px settings viewport in a Chromium smoke check without page exceptions. New dashboard/backup instructions currently use English; existing translated views remain available.
- `npm run verify:audio -- --all`: **1,368/1,368** endpoints returned successful audio headers: 114 Surahs for each of twelve reciters. This does not mean every recording was listened to in full.
- `npx tsx scripts/verify-playback.mts`: actual Surah 114 MP3 decoding and advancing playback passed for **12/12 reciters** in Chromium, with zero page exceptions. Reciter identity and Surah mappings were checked against MP3Quran's official catalogue.
- `git diff --check`: passed before release staging. Environment files containing credentials and test output remain ignored.

## Verification boundaries

The guest browser regression suite stubs Supabase requests; it does **not** certify live accounts. The Supabase hostname configured locally failed DNS resolution using two HTTP clients. Registration/email delivery, verification links, password recovery, Google consent/callback completion, refresh-token behavior against the real provider, live two-account RLS, and cross-device sync require the setup and controlled-account checks in [AUTH_SETUP.md](AUTH_SETUP.md).

Firefox's downloaded test executable failed to launch (`spawn UNKNOWN`) in this Windows execution environment. Firefox remains configured in Playwright for rerunning on a supported test host. Edge was not run separately. WebKit engine testing is not a substitute for testing physical Safari/iOS devices; Chromium touch injection is not a physical Android test. No full assistive-technology, Lighthouse, or device power-profile audit was performed.

WebKit's Windows native media backend bypassed Playwright URL interception and continued playing real audio during the initial simulated-network-failure test. The final failure test injects a rejected media `play()` promise at the platform API boundary; a separate fake-clock test verifies the loading timeout. Real media decoding was independently checked in Chromium.

The timer reconciles a saved deadline when the app returns. It does not provide a background service while the browser is closed, and it does not manufacture completed sessions for an unattended chain of auto-start phases. Cross-tab reward coordination uses Web Locks where supported.

Cloud preferences remain JSON snapshots with documented last-writer conflict limits. Sessions and completed dhikr merge by ID, trees are retained by ID, and tree GP uses the larger saved value. A transactional event ledger is recommended before simultaneous offline web/Android use. Progress backups are export-only; automatic import is not implemented.

The email-existence RPC removal migration must be applied to the existing Supabase database; committing SQL does not run it. See [ANDROID_READINESS.md](ANDROID_READINESS.md) for the retained architecture and recommended next steps.
