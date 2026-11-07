import type { StateStorage } from "zustand/middleware";

const OWNER_KEY = "quranodoro-storage-owner";
let owner: string | undefined;
let hydrating = false;
export function duringHydration<T>(action: () => T): T {
  const previous = hydrating;
  hydrating = true;
  try {
    return action();
  } finally {
    hydrating = previous;
  }
}
export function unsyncedRevision(account = getStorageOwner()) {
  return localStorage.getItem(`quranodoro-unsynced:${account}`);
}
export function markAccountSynced(account: string, revision: string | null) {
  if (unsyncedRevision(account) === revision)
    localStorage.removeItem(`quranodoro-unsynced:${account}`);
}
export function getStorageOwner() {
  return (owner ??= localStorage.getItem(OWNER_KEY) || "guest");
}
export const accountStorage: StateStorage = {
  getItem(name) {
    const owner = getStorageOwner();
    const scoped = localStorage.getItem(`${name}:${owner}`);
    // Preserve pre-upgrade data as guest data; never import an unknown owner's
    // cache into a signed-in account. Original keys remain as a backup.
    return scoped ?? (owner === "guest" ? localStorage.getItem(name) : null);
  },
  setItem(name, value) {
    localStorage.setItem(`${name}:${getStorageOwner()}`, value);
    if (!hydrating && name !== "quranodoro-timer")
      localStorage.setItem(
        `quranodoro-unsynced:${getStorageOwner()}`,
        crypto.randomUUID(),
      );
  },
  removeItem(name) {
    localStorage.removeItem(`${name}:${getStorageOwner()}`);
  },
};
export function setStorageOwner(userId: string | null) {
  owner = userId || "guest";
  localStorage.setItem(OWNER_KEY, owner);
}
