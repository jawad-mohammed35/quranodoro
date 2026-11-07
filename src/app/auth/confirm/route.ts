import { safeAuthPath } from "@/lib/auth-redirect";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Email OTP confirmation: exchanges the `token_hash` for a session.
 * Used when the Supabase email templates point at
 * `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=...`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = safeAuthPath(next);
  redirectTo.search = "";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      if (type === "recovery") redirectTo.pathname = "/update-password";
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = "/login";
  redirectTo.search = "?error=auth";
  return NextResponse.redirect(redirectTo);
}
