import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components (runs in the browser).
 * Sessions are stored in cookies via @supabase/ssr so the server
 * (proxy, Route Handlers, Server Components) can read them too.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
