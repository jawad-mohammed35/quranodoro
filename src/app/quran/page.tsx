import type { Metadata } from "next";
import { QuranView } from "@/components/quran/quran-view";

export const metadata: Metadata = { title: "Quran Player" };

export default function QuranPage() {
  return <QuranView />;
}
