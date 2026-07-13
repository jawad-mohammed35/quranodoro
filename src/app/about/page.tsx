import type { Metadata } from "next";
import { AboutView } from "@/components/about/about-view";

export const metadata: Metadata = { title: "About the Developer" };

export default function AboutPage() {
  return <AboutView />;
}
