"use client";

import { useEffect, useRef } from "react";
import { getReciter, getSurahAudioUrl } from "@/data/reciters";
import { usePlayerStore } from "@/stores/player-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useTimerStore } from "@/stores/timer-store";

/**
 * Owns the app's single <audio> element.
 *
 * - Reacts to play/pause/stop intent from the player store.
 * - Follows reciter/surah/volume from settings.
 * - Auto-plays recitation when a focus session is running (if enabled) and
 *   pauses it during breaks or when the timer stops.
 * - Advances to the next surah when one finishes.
 *
 * Mounted once in the root layout so audio survives navigation.
 */
export function QuranAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playback = usePlayerStore((s) => s.playback);
  const report = usePlayerStore((s) => s._report);

  const reciterId = useSettingsStore((s) => s.reciterId);
  const surahNumber = useSettingsStore((s) => s.surahNumber);
  const volume = useSettingsStore((s) => s.volume);
  const playQuranDuringFocus = useSettingsStore((s) => s.playQuranDuringFocus);

  const timerStatus = useTimerStore((s) => s.status);
  const timerPhase = useTimerStore((s) => s.phase);

  // Create the element once.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    const onTime = () =>
      report({ currentTime: audio.currentTime, duration: audio.duration || 0 });
    const onPlaying = () => report({ playback: "playing" });
    const onPause = () => {
      // Distinguish a natural pause from stop (src cleared).
      if (usePlayerStore.getState().playback !== "stopped") {
        report({ playback: "paused" });
      }
    };
    const onError = () => report({ playback: "error" });
    const onEnded = () => {
      // Continue with the next surah, wrapping at 114.
      const { surahNumber: current } = useSettingsStore.getState();
      const next = current >= 114 ? 1 : current + 1;
      useSettingsStore.getState().setSetting("surahNumber", next);
      usePlayerStore.getState().requestPlay(usePlayerStore.getState().userInitiated);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [report]);

  // Volume follows settings.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Load + act on intent and source changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const url = getSurahAudioUrl(getReciter(reciterId), surahNumber);

    if (playback === "loading") {
      if (audio.src !== url) {
        audio.src = url;
        report({ currentTime: 0, duration: 0 });
      }
      audio.play().catch(() => report({ playback: "error" }));
    } else if (playback === "paused") {
      audio.pause();
    } else if (playback === "stopped") {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      report({ currentTime: 0, duration: 0 });
    } else if (playback === "playing" && audio.src !== url) {
      // Reciter or surah changed mid-playback: switch seamlessly.
      audio.src = url;
      report({ currentTime: 0, duration: 0 });
      audio.play().catch(() => report({ playback: "error" }));
    }
  }, [playback, reciterId, surahNumber, report]);

  // Timer-driven automation: recite during focus, pause on breaks/stop.
  useEffect(() => {
    const { playback: current, userInitiated, requestPlay, requestPause } =
      usePlayerStore.getState();

    if (timerStatus === "running" && timerPhase === "focus") {
      if (playQuranDuringFocus && current !== "playing" && current !== "loading") {
        requestPlay(false);
      }
    } else if (!userInitiated && (current === "playing" || current === "loading")) {
      // Only auto-pause playback that the timer itself started.
      requestPause();
    }
  }, [timerStatus, timerPhase, playQuranDuringFocus]);

  return null;
}
