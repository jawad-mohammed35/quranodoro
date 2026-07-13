import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Amiri } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { OnboardingGate } from "@/components/providers/onboarding-gate";
import { AppShell } from "@/components/layout/app-shell";
import { QuranAudioEngine } from "@/components/audio/quran-audio-engine";
import { TimerTicker } from "@/components/timer/timer-ticker";
import { LocaleApplier } from "@/components/providers/locale-applier";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: {
    default: "Quranodoro — Focus with the Quran",
    template: "%s · Quranodoro",
  },
  description:
    "A peaceful Pomodoro timer for Muslims. Focus with Quran recitation, grow your date farm, and build a habit of deep work.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1e211e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <OnboardingGate />
            <TimerTicker />
            <QuranAudioEngine />
            <LocaleApplier />
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
