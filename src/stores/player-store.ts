"use client";

import { create } from "zustand";

export type PlaybackStatus = "stopped" | "loading" | "playing" | "paused" | "error";

interface PlayerState {
  playback: PlaybackStatus;
  /** Whether the user explicitly asked for playback (vs. timer automation). */
  userInitiated: boolean;
  currentTime: number;
  duration: number;

  requestPlay: (userInitiated?: boolean) => void;
  requestPause: () => void;
  requestStop: () => void;
  /** Internal: the audio engine reports real element state here. */
  _report: (partial: Partial<Pick<PlayerState, "playback" | "currentTime" | "duration">>) => void;
}

/**
 * The store holds *intent* (play/pause/stop). The `QuranAudioEngine`
 * component owns the single HTMLAudioElement, listens to this store, and
 * reports actual playback state back. This keeps audio alive across route
 * changes and lets the Pomodoro timer drive playback without touching the DOM.
 */
export const usePlayerStore = create<PlayerState>()((set) => ({
  playback: "stopped",
  userInitiated: false,
  currentTime: 0,
  duration: 0,

  requestPlay: (userInitiated = false) =>
    set({ playback: "loading", userInitiated }),
  requestPause: () => set({ playback: "paused" }),
  requestStop: () => set({ playback: "stopped", currentTime: 0 }),
  _report: (partial) => set(partial),
}));
