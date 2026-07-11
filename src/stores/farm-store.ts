"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FarmTree, TreeTypeId } from "@/lib/types";
import {
  FINAL_STAGE_INDEX,
  getTreeType,
  stageForGp,
} from "@/data/trees";
import { uid } from "@/lib/utils";

interface FarmState {
  trees: FarmTree[];
  /** Only one tree may actively grow at a time. */
  activeTreeId: string | null;

  plantTree: (typeId: TreeTypeId) => string;
  setActiveTree: (id: string) => void;
  /** Award GP to the active tree (called when a focus session completes). */
  awardGrowthPoints: (gp: number) => void;
  hydrateFromCloud: (data: { trees: FarmTree[]; activeTreeId: string | null }) => void;
}

export const useFarmStore = create<FarmState>()(
  persist(
    (set) => ({
      trees: [],
      activeTreeId: null,

      plantTree: (typeId) => {
        const id = uid();
        const tree: FarmTree = {
          id,
          typeId,
          gp: 0,
          plantedAt: new Date().toISOString(),
          maturedAt: null,
        };
        set((state) => ({
          trees: [...state.trees, tree],
          // Auto-select the new tree if nothing is actively growing.
          activeTreeId: state.activeTreeId ?? id,
        }));
        return id;
      },

      setActiveTree: (id) =>
        set((state) => {
          const tree = state.trees.find((t) => t.id === id);
          if (!tree || tree.maturedAt) return state;
          return { activeTreeId: id };
        }),

      awardGrowthPoints: (gp) =>
        set((state) => {
          if (!state.activeTreeId || gp <= 0) return state;
          let matured = false;
          const trees = state.trees.map((tree) => {
            if (tree.id !== state.activeTreeId || tree.maturedAt) return tree;
            const newGp = tree.gp + gp;
            const multiplier = getTreeType(tree.typeId).gpMultiplier;
            const reachedFinal = stageForGp(newGp, multiplier) >= FINAL_STAGE_INDEX;
            if (reachedFinal) matured = true;
            return {
              ...tree,
              gp: newGp,
              maturedAt: reachedFinal ? new Date().toISOString() : null,
            };
          });
          return {
            trees,
            // A matured tree stops growing; the user picks the next one.
            activeTreeId: matured ? null : state.activeTreeId,
          };
        }),

      hydrateFromCloud: (data) => set(data),
    }),
    { name: "quranodoro-farm" },
  ),
);
