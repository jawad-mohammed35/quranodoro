import Link from "next/link";
import type { Metadata } from "next";
import { AboutView } from "@/components/about/about-view";

export const metadata: Metadata = { title: "About the Developer" };

export default function AboutPage() {
  return (
    <>
      <Link href="/settings" className="mb-4 inline-block text-sm text-primary">
        ← Settings
      </Link>
      <AboutView />
    </>
  );
}
