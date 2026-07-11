"use client";

import { motion } from "framer-motion";
import { GROWTH_STAGES } from "@/data/trees";
import { cn } from "@/lib/utils";

interface TreeVisualProps {
  stageIndex: number;
  /** Pulse gently while the tree is actively growing. */
  growing?: boolean;
  size?: "sm" | "lg";
}

/**
 * Emoji-based tree art with a soft "ground" mound. Stages can later be
 * swapped for illustrations by changing only this component.
 */
export function TreeVisual({ stageIndex, growing = false, size = "sm" }: TreeVisualProps) {
  const stage = GROWTH_STAGES[Math.min(stageIndex, GROWTH_STAGES.length - 1)];
  const isPremium = stageIndex >= GROWTH_STAGES.length - 1;

  return (
    <div
      className={cn(
        "relative flex items-end justify-center",
        size === "lg" ? "h-40" : "h-24",
      )}
      role="img"
      aria-label={`${stage.name} stage`}
    >
      <motion.span
        key={stage.index}
        initial={{ scale: 0.5, opacity: 0, y: 10 }}
        animate={{
          scale: growing ? [1, 1.06, 1] : 1,
          opacity: 1,
          y: 0,
        }}
        transition={
          growing
            ? { scale: { repeat: Infinity, duration: 2.4, ease: "easeInOut" } }
            : { type: "spring", stiffness: 200, damping: 15 }
        }
        className={cn("relative z-10", size === "lg" ? "text-7xl" : "text-4xl")}
      >
        {isPremium ? "🌴" : stage.emoji}
        {isPremium && (
          <motion.span
            className={cn("absolute -right-2 -top-2", size === "lg" ? "text-3xl" : "text-lg")}
            animate={{ opacity: [1, 0.4, 1], rotate: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            aria-hidden
          >
            ✨
          </motion.span>
        )}
      </motion.span>
      <div
        aria-hidden
        className={cn(
          "absolute bottom-0 rounded-[50%] bg-accent-soft",
          size === "lg" ? "h-6 w-32" : "h-4 w-20",
        )}
      />
    </div>
  );
}
