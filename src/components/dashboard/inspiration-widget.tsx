"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Inspiration } from "@/lib/types";
import { inspirationForDate, randomInspiration } from "@/data/inspirations";
import { useMounted } from "@/hooks/use-mounted";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const KIND_LABELS: Record<Inspiration["kind"], string> = {
  verse: "Quran",
  hadith: "Hadith",
  dua: "Dua",
};

export function InspirationWidget() {
  const mounted = useMounted();
  // Manual refresh overrides the deterministic daily pick.
  const [override, setOverride] = useState<Inspiration | null>(null);

  // Resolved on the client only, so the server never guesses the timezone.
  const inspiration = override ?? (mounted ? inspirationForDate(new Date()) : null);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Daily reminder</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Show another reminder"
          onClick={() => setOverride(randomInspiration(inspiration?.id))}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {inspiration && (
            <motion.figure
              key={inspiration.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <blockquote>
                <p
                  className="font-arabic text-xl leading-relaxed sm:text-2xl"
                  dir="rtl"
                  lang="ar"
                >
                  {inspiration.arabic}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  “{inspiration.english}”
                </p>
              </blockquote>
              <figcaption className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent-foreground">
                  {KIND_LABELS[inspiration.kind]}
                </span>
                {inspiration.reference}
              </figcaption>
            </motion.figure>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
