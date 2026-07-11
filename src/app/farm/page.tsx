import type { Metadata } from "next";
import { FarmView } from "@/components/farm/farm-view";

export const metadata: Metadata = { title: "Date Farm" };

export default function FarmPage() {
  return <FarmView />;
}
