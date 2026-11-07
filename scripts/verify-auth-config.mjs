// Read public environment settings in memory. Never print keys, URLs, or tokens.
import fs from "node:fs";
const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [
        l.slice(0, i),
        l
          .slice(i + 1)
          .trim()
          .replace(/^['"]|['"]$/g, ""),
      ];
    }),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL,
  key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("Public Supabase configuration missing");
const headers = { apikey: key, Authorization: `Bearer ${key}` };
try {
  const response = await fetch(`${url}/auth/v1/settings`, { headers });
  if (!response.ok) throw new Error(`Auth settings HTTP ${response.status}`);
  const settings = await response.json();
  console.log(
    JSON.stringify({
      emailEnabled: settings.external?.email,
      googleEnabled: settings.external?.google,
      emailAutoConfirm: settings.mailer_autoconfirm,
    }),
  );
  for (const table of ["profiles", "sessions", "user_state"]) {
    const r = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
      headers,
    });
    const rows = await r.json();
    console.log(
      `${table}: anonymous read HTTP ${r.status}; rows visible: ${Array.isArray(rows) ? rows.length : "denied"}`,
    );
    if (r.ok && Array.isArray(rows) && rows.length) process.exitCode = 1;
  }
} catch (error) {
  console.error("Auth configuration verification failed:", error.message);
  process.exitCode = 1;
}
