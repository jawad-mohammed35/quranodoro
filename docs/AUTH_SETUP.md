# Authentication setup and release checks

Quranodoro retains Supabase Auth, its cookie-based SSR clients, and Postgres row-level security. No additional identity service is required.

## Current blocker

During the November 7, 2026 review, the Supabase hostname configured in `.env.local` did not resolve using either Node fetch or the system HTTP client. Live registration, verification emails, password recovery, Google authorization, authenticated RLS checks, and account synchronization could therefore not be certified. A successful web build does not verify any of these flows.

## Configure the existing project

1. Open your Supabase dashboard. Confirm that the original project still exists and is active; restore it if paused. Prefer restoring the original database over creating a replacement, to retain existing accounts and progress.
2. Copy the active project URL and **publishable** key into `.env.local`, and into Vercel's Production and Preview environment settings. Never use the secret/service-role key in `NEXT_PUBLIC_` variables. Restart locally and redeploy after changing public environment variables because Next.js bundles them into client assets.
3. For a fresh database, run `supabase/schema.sql` once. For an existing database, apply `supabase/migrations/20261107_remove_email_lookup.sql`. The migration removes the anonymous email-existence lookup; it does not modify user or progress rows. The app now returns a generic invalid-credentials message to avoid exposing account membership.
4. Enable Email under Authentication → Providers, keep email confirmation enabled, and configure a minimum password length of at least 8 in the provider. Configure production SMTP and verify delivery; default email limits are unsuitable for a broadly used release.
5. Set the Supabase Site URL to `https://quranodoro.vercel.app`. Add the following redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/callback?next=/welcome`
   - `http://localhost:3000/auth/callback?next=/update-password`
   - `https://quranodoro.vercel.app/auth/callback`
   - `https://quranodoro.vercel.app/auth/callback?next=/welcome`
   - `https://quranodoro.vercel.app/auth/callback?next=/update-password`
   Add specific preview origins when needed; avoid an unrestricted production wildcard.
6. In Google Cloud, configure a Web OAuth client, consent screen, allowed audiences/test users, and the `openid`, email, and profile scopes. Add localhost and production origins. The Google **redirect URI** is `https://<your-supabase-project>.supabase.co/auth/v1/callback`, copied from the Supabase Google provider panel. It is different from the app callback above. Store Google's client ID and secret in the Supabase provider settings, then enable Google. Do not put the Google client secret into this repository or public environment variables.
7. Default PKCE email templates can use `ConfirmationURL`. For custom token-hash templates, use `/auth/confirm?token_hash={{ .TokenHash }}&type=signup`; use `type=recovery` for recovery emails. Recovery confirmation sends users to `/update-password`. Callback destinations are restricted to local paths.

Reference: [Supabase SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs) and [Google setup](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).

## Verify after configuration

Run `node scripts/verify-auth-config.mjs` for a read-only provider/anonymous-access check. It prints provider booleans and row counts, not keys. This check is insufficient on its own; complete the following in both localhost and production:

- Register a controlled test email. Verify password validation, inbox delivery, confirmation, profile onboarding, refresh, and sign-out.
- Sign in again, test an incorrect password and an unverified account, and ensure errors remain actionable without enumerating other accounts.
- Send a recovery email, follow its link, change the password, and verify that the old password fails. Check an expired link as well.
- Complete Google authorization, cancellation, first-time onboarding, repeat login, refresh, and sign-out.
- Use two controlled accounts. Account B must not see A's farm, settings, history, or dhikr. Verify direct REST reads/writes against A's IDs are denied using B's token. Do not use a service-role key for this check.
- Change dashboard preferences on one device, allow sync to finish, and sign in on a second device. Test offline edits, reconnection, and sign-out while a save is pending.

## Storage behavior

Guest and account data use separate localStorage namespaces. Pre-upgrade unscoped data stays available in the guest space and its original keys remain intact as a backup. Guest progress is deliberately not silently copied into a different account. Settings → Download progress backup exports the currently selected space without auth cookies, passwords, or tokens; automatic import is not implemented.

Failed cloud reads never seed an apparently empty account. Pending local changes remain marked across reload/sign-out and are uploaded before accepting a stale cloud snapshot. Sessions and completed dhikr merge by ID; independently created trees are retained, and same-tree GP uses the larger saved value. Preference snapshots use the last successful writer. Concurrent offline growth on the same tree can still require reconciliation; this is not a transactional multi-device event ledger. Avoid clearing browser data while changes are unsynced.

Local storage is a device cache, not a security boundary against someone with access to the same browser profile. Database RLS remains the server-side authorization boundary.
