import type { GrowthStage, TreeType, TreeTypeId } from "@/lib/types";

/**
 * Growth system
 * -------------
 * Completed focus sessions award Growth Points (GP) based on duration:
 * see `growthPointsForMinutes`. A tree advances through stages when its
 * accumulated GP crosses each stage's cumulative threshold (scaled by the
 * tree type's `gpMultiplier`).
 */

/** Base GP thresholds. Stage 0 (Seed) is the starting point. */
export const GROWTH_STAGES: GrowthStage[] = [
  { index: 0, name: "Seed", emoji: "🌰", cumulativeGp: 0 },
  { index: 1, name: "Sprout", emoji: "🌱", cumulativeGp: 20 },
  { index: 2, name: "Small Tree", emoji: "🪴", cumulativeGp: 50 },
  { index: 3, name: "Young Tree", emoji: "🌿", cumulativeGp: 100 },
  { index: 4, name: "Mature Tree", emoji: "🌳", cumulativeGp: 170 },
  { index: 5, name: "Fruiting Tree", emoji: "🌴", cumulativeGp: 260 },
  { index: 6, name: "Premium Tree", emoji: "✨", cumulativeGp: 380 },
];

export const FINAL_STAGE_INDEX = GROWTH_STAGES.length - 1;

export const TREE_TYPES: TreeType[] = [
  {
    id: "ajwa",
    name: "Ajwa",
    description:
      "The blessed dates of Madinah — dark, soft, and treasured. A patient tree for dedicated growers.",
    gpMultiplier: 1.5,
  },
  {
    id: "medjool",
    name: "Medjool",
    description:
      "The 'king of dates' — large, caramel-sweet fruit. A prestige tree that rewards long focus.",
    gpMultiplier: 1.3,
  },
  {
    id: "safawi",
    name: "Safawi",
    description:
      "A deep-black, semi-dry date from Madinah with a rich, mellow sweetness. A steady long-term grower.",
    gpMultiplier: 1.2,
  },
  {
    id: "sukkari",
    name: "Sukkari",
    description:
      "Golden and honey-sweet, beloved across the Gulf. Grows at a steady, satisfying pace.",
    gpMultiplier: 1.1,
  },
  {
    id: "deglet-noor",
    name: "Deglet Noor",
    description:
      "The translucent 'date of light'. A balanced tree — a great first planting.",
    gpMultiplier: 1.0,
  },
  {
    id: "barhi",
    name: "Barhi",
    description:
      "Small, butterscotch-flavored dates eaten fresh. The fastest tree to mature.",
    gpMultiplier: 0.8,
  },
];

export function getTreeType(id: TreeTypeId): TreeType {
  return TREE_TYPES.find((t) => t.id === id) ?? TREE_TYPES[3];
}

/**
 * GP awarded for a completed focus session.
 * Anchored at: 25 min = 10 GP, 50 min = 20 GP, 90 min = 35 GP.
 * Sessions of 60+ minutes earn slightly less per minute (diminishing returns
 * discourage marathon sessions over healthy Pomodoro rhythms).
 */
export function growthPointsForMinutes(focusMinutes: number): number {
  if (focusMinutes <= 0) return 0;
  if (focusMinutes <= 60) return Math.round(focusMinutes * 0.4);
  return Math.round(24 + (focusMinutes - 60) * 0.3667);
}

/** GP threshold (scaled for the tree type) to reach a given stage. */
export function stageThreshold(stageIndex: number, multiplier: number): number {
  const stage = GROWTH_STAGES[Math.min(stageIndex, FINAL_STAGE_INDEX)];
  return Math.round(stage.cumulativeGp * multiplier);
}

/** Current stage index for a tree's accumulated GP. */
export function stageForGp(gp: number, multiplier: number): number {
  let stage = 0;
  for (const s of GROWTH_STAGES) {
    if (gp >= Math.round(s.cumulativeGp * multiplier)) stage = s.index;
  }
  return stage;
}

/** Progress (0..1) toward the next stage; 1 when fully grown. */
export function progressToNextStage(gp: number, multiplier: number): number {
  const current = stageForGp(gp, multiplier);
  if (current >= FINAL_STAGE_INDEX) return 1;
  const currentGp = stageThreshold(current, multiplier);
  const nextGp = stageThreshold(current + 1, multiplier);
  return Math.min(1, (gp - currentGp) / (nextGp - currentGp));
}

/** Total GP (scaled) needed to fully grow a tree of this type. */
export function totalGpToMature(multiplier: number): number {
  return stageThreshold(FINAL_STAGE_INDEX, multiplier);
}
