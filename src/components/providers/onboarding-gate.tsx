"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Sends signed-in users who haven't chosen a display name yet to /welcome
 * (new email signups and first-time Google sign-ins).
 */
export function OnboardingGate() {
  const { needsDisplayName } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (
      needsDisplayName &&
      pathname !== "/welcome" &&
      pathname !== "/update-password" &&
      !pathname.startsWith("/auth/")
    ) {
      router.replace("/welcome");
    }
  }, [needsDisplayName, pathname, router]);

  return null;
}
