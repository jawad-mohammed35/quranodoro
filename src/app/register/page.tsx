"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { AuthCard, FormMessage, GoogleAuthSection } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    const result = await signUp(email, password);
    if (result.error) {
      setError(result.error);
      setBusy(false);
    } else if (result.needsEmailConfirmation) {
      setSuccess(
        "Your account was created successfully! We've sent a confirmation link to your email — click it, and you'll be asked to choose your display name.",
      );
      setBusy(false);
    } else {
      // Email confirmation disabled: the user is already signed in.
      router.push("/welcome");
    }
  };

  return (
    <AuthCard
      title="Create your account"
      description="Your Pomodoro history, streaks, date farm, and settings — safely in the cloud. Free forever."
    >
      {success ? (
        <div className="flex flex-col gap-4">
          <FormMessage success={success} />
          <Link
            href="/login"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Go to sign in →
          </Link>
        </div>
      ) : (
        <>
          <GoogleAuthSection label="Continue with Google" />
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <FormMessage error={error} />
            <Button type="submit" disabled={busy} size="lg">
              {busy ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </>
      )}
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
