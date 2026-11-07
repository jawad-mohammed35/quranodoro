import { RECITERS, getSurahAudioUrl } from "../src/data/reciters";

// No audio is downloaded or redistributed. Check headers with bounded concurrency.
const surahs = process.argv.includes("--all")
  ? Array.from({ length: 114 }, (_, i) => i + 1)
  : [1, 36, 114];
const jobs = RECITERS.flatMap((reciter) =>
  surahs.map((surah) => ({ reciter, surah })),
);
let failures = 0,
  passed = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (jobs.length) {
      const job = jobs.shift()!;
      try {
        let response: Response | undefined;
        for (let attempt = 0; attempt < 3; attempt++) {
          response = await fetch(getSurahAudioUrl(job.reciter, job.surah), {
            method: "HEAD",
            signal: AbortSignal.timeout(20000),
          });
          if (response.ok) break;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        if (
          !response?.ok ||
          !response.headers.get("content-type")?.includes("audio")
        )
          throw new Error(
            `HTTP ${response?.status}, ${response?.headers.get("content-type")}`,
          );
        passed++;
      } catch (error) {
        failures++;
        console.error(
          `${job.reciter.id}, surah ${job.surah}: ${String(error)}`,
        );
      }
    }
  }),
);
console.log(
  `${passed} audio endpoints passed; ${failures} failed (${surahs.length} surahs × ${RECITERS.length} reciters).`,
);
process.exitCode = failures ? 1 : 0;
