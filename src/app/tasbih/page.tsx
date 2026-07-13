import type { Metadata } from "next";
import { TasbihView } from "@/components/tasbih/tasbih-view";

export const metadata: Metadata = { title: "Tasbih" };

export default function TasbihPage() {
  return <TasbihView />;
}
