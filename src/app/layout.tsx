import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Amiri } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./globals.css";
import { MotionProvider } from "@/components/providers/motion-provider";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://quranodoro.vercel.app",
  ),
  applicationName: "Quranodoro",
  openGraph: {
    type: "website",
    siteName: "Quranodoro",
    title: "Quranodoro — Focus with the Quran",
    description:
      "A peaceful space for Quran recitation, focused work, dhikr, and daily growth.",
    images: [
      {
        url: "/logo.png",
        width: 1011,
        height: 1024,
        alt: "Quranodoro Islamic productivity",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Quranodoro — Focus with the Quran",
    images: ["/logo.png"],
  },
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
          <MotionProvider>
            <AuthProvider>
              <OnboardingGate />
              <TimerTicker />
              <QuranAudioEngine />
              <LocaleApplier />
              <AppShell>{children}</AppShell>
            </AuthProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
