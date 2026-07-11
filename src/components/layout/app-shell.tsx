"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Settings,
  TimerIcon,
  TreePalm,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pomodoro", label: "Pomodoro", icon: TimerIcon },
  { href: "/quran", label: "Quran Player", icon: BookOpen },
  { href: "/farm", label: "Date Farm", icon: TreePalm },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/about-farm", label: "About Date Farm", icon: Info },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/about", label: "About Me", icon: User },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary-soft text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function AuthSection({ onNavigate }: { onNavigate?: () => void }) {
  const { user, profile, signOut } = useAuth();

  if (user) {
    return (
      <div className="flex flex-col gap-2">
        <div className="min-w-0 px-3">
          {profile?.displayName && (
            <p className="truncate text-sm font-medium">{profile.displayName}</p>
          )}
          <p className="truncate text-xs text-muted-foreground" title={user.email ?? ""}>
            {user.email}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mx-3 justify-start gap-2"
          onClick={() => {
            void signOut();
            onNavigate?.();
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden /> Sign out
        </Button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      onClick={onNavigate}
      className="mx-3 flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      <LogIn className="h-4 w-4" aria-hidden /> Sign in
    </Link>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-3">
      <Image
        src="/logo.png"
        alt=""
        aria-hidden
        width={36}
        height={36}
        className="h-9 w-9 rounded-xl"
      />
      <span className="text-lg font-semibold tracking-tight">Quranodoro</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-border bg-card px-3 py-6 lg:flex">
        <div className="flex items-center justify-between">
          <Brand />
          <ThemeToggle />
        </div>
        <NavLinks />
        <div className="mt-auto">
          <AuthSection />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/90 px-3 backdrop-blur lg:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              aria-hidden
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-6 border-r border-border bg-card px-3 py-6 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between">
                <Brand />
                <Button variant="ghost" size="icon" aria-label="Close menu" onClick={close}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <NavLinks onNavigate={close} />
              <div className="mt-auto">
                <AuthSection onNavigate={close} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="min-w-0 flex-1 px-4 pb-16 pt-20 sm:px-6 lg:px-10 lg:pt-8">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
