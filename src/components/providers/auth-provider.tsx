"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { pullFromCloud, startSync } from "@/lib/supabase/sync";
import { useSettingsStore } from "@/stores/settings-store";

export interface Profile {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

interface AuthContextValue {
  /** Null while signed out. */
  user: User | null;
  /** The user's row in `public.profiles`; null while signed out or loading. */
  profile: Profile | null;
  loading: boolean;
  /** True when a signed-in user still has to choose their display name. */
  needsDisplayName: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  /** Saves the display name to the user's profile and local settings. */
  updateDisplayName: (name: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  };
}

/** Turn raw Supabase auth errors into friendly, actionable messages. */
async function friendlySignInError(
  supabase: ReturnType<typeof createClient>,
  email: string,
  rawMessage: string,
): Promise<string> {
  const msg = rawMessage.toLowerCase();

  if (msg.includes("email not confirmed")) {
    return "Your email hasn't been verified yet. Check your inbox for the confirmation link.";
  }

  if (msg.includes("invalid login credentials")) {
    // Distinguish "no such account" from "wrong password".
    const { data: exists, error } = await supabase.rpc("email_exists", {
      check_email: email,
    });
    if (!error && exists === false) {
      return "No account exists with this email. Please create an account first.";
    }
    return "Incorrect password. Please try again or reset your password.";
  }

  return rawMessage;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const stopSyncRef = useRef<(() => void) | null>(null);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, email, display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();
    return data ? toProfile(data as ProfileRow) : null;
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const handleUser = async (nextUser: User | null) => {
      stopSyncRef.current?.();
      stopSyncRef.current = null;

      if (!nextUser) {
        if (!cancelled) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      await pullFromCloud(supabase, nextUser.id);
      const nextProfile = await fetchProfile(nextUser.id);
      if (cancelled) return;

      setProfile(nextProfile);
      setLoading(false);

      // The profile's display name is the account-level source of truth;
      // mirror it into local settings so the dashboard greeting matches.
      if (nextProfile?.displayName) {
        useSettingsStore.getState().setSetting("displayName", nextProfile.displayName);
      }

      stopSyncRef.current = startSync(supabase, nextUser.id);
    };

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setUser(data.user ?? null);
      void handleUser(data.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      // Defer Supabase calls out of the auth callback (avoids deadlocks).
      setTimeout(() => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
          void handleUser(nextUser);
        }
      }, 0);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      stopSyncRef.current?.();
    };
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/welcome` },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered")) {
        return {
          error: "An account with this email already exists. Try signing in instead.",
          needsEmailConfirmation: false,
        };
      }
      return { error: error.message, needsEmailConfirmation: false };
    }
    // With email confirmation enabled there's no session yet.
    return { error: null, needsEmailConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return { error: null };
    return { error: await friendlySignInError(supabase, email, error.message) };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  }, []);

  const updateDisplayName = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return { error: "Please enter a name." };
      if (!user) return { error: "You need to be signed in." };

      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .upsert(
          { id: user.id, email: user.email ?? null, display_name: trimmed },
          { onConflict: "id" },
        );
      if (error) return { error: error.message };

      useSettingsStore.getState().setSetting("displayName", trimmed);
      setProfile((prev) =>
        prev
          ? { ...prev, displayName: trimmed }
          : { id: user.id, email: user.email ?? null, displayName: trimmed, avatarUrl: null },
      );
      return { error: null };
    },
    [user],
  );

  const needsDisplayName = Boolean(user && !loading && !profile?.displayName);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      needsDisplayName,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
      updatePassword,
      updateDisplayName,
    }),
    [
      user,
      profile,
      loading,
      needsDisplayName,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
      updatePassword,
      updateDisplayName,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
