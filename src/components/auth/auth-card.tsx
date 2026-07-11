"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useState } from "react";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto mt-2 w-full max-w-md sm:mt-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Card className="overflow-hidden">
          <div className="flex flex-col items-center gap-3 bg-primary-soft/50 px-6 pb-5 pt-8 text-center">
            <Image
              src="/logo.png"
              alt=""
              aria-hidden
              width={48}
              height={48}
              className="h-12 w-12 rounded-2xl shadow-card"
            />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export function FormMessage({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  if (error) {
    return (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        role="alert"
        className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger"
      >
        {error}
      </motion.p>
    );
  }
  if (success) {
    return (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        role="status"
        className="rounded-xl bg-primary-soft px-3 py-2 text-sm"
      >
        {success}
      </motion.p>
    );
  }
  return null;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.13 7.13 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

/** "Continue with Google" button + divider, shared by login and register. */
export function GoogleAuthSection({ label }: { label: string }) {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setBusy(true);
    setError(null);
    const result = await signInWithGoogle();
    // On success the browser navigates away; only errors land here.
    if (result.error) {
      setError(result.error);
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={busy}
        onClick={handleClick}
      >
        <GoogleIcon />
        {busy ? "Redirecting…" : label}
      </Button>
      <FormMessage error={error} />
      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
