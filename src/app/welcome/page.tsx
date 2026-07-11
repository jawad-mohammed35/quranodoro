"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { AuthCard, FormMessage } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function WelcomePage() {
  const { user, profile, loading, updateDisplayName } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  // This page is only for signed-in users who still need a name.
  useEffect(() => {
    if (loading || saved) return;
    if (!user) router.replace("/login");
    else if (profile?.displayName) router.replace("/");
  }, [loading, saved, user, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await updateDisplayName(name);
    if (result.error) {
      setError(result.error);
      setBusy(false);
    } else {
      setSaved(true);
      setTimeout(() => router.replace("/"), 900);
    }
  };

  if (loading || !user) {
    return (
      <AuthCard title="One moment…" description="Getting your account ready.">
        <p className="text-center text-sm text-muted-foreground">Loading…</p>
      </AuthCard>
    );
  }

  if (saved) {
    return (
      <AuthCard
        title={`Ahlan, ${name.trim()}!`}
        description="Your profile is ready. Taking you to your dashboard…"
      >
        <motion.p
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="text-center text-5xl"
          aria-hidden
        >
          🌱
        </motion.p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Welcome to Quranodoro!"
      description="Your account was created successfully. What name would you like displayed throughout the app?"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="display-name">Display name</Label>
          <Input
            id="display-name"
            autoComplete="name"
            placeholder="e.g. Jawad"
            maxLength={40}
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Used for your dashboard greeting. You can change it anytime in Settings.
          </p>
        </div>
        <FormMessage error={error} />
        <Button type="submit" disabled={busy || !name.trim()} size="lg">
          {busy ? "Saving…" : "Continue"}
        </Button>
      </form>
    </AuthCard>
  );
}
