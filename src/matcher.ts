import { ChangeEntry, ChangelogGroup, GsdSummary } from "./types.js";
import { dirname } from "node:path";

function getDirectories(files: string[]): Set<string> {
  return new Set(files.map((f) => dirname(f)));
}

function filesOverlap(commitFiles: string[], summaryFiles: string[]): boolean {
  const commitSet = new Set(commitFiles);
  if (summaryFiles.some((f) => commitSet.has(f))) return true;

  const commitDirs = getDirectories(commitFiles);
  const summaryDirs = getDirectories(summaryFiles);
  for (const dir of commitDirs) {
    if (summaryDirs.has(dir)) return true;
  }

  return false;
}

export function matchCommitsToPhases(
  commits: ChangeEntry[],
  summaries: GsdSummary[],
): ChangelogGroup[] {
  if (commits.length === 0) return [];

  const groups = new Map<number, ChangelogGroup>();
  const unmatched: ChangeEntry[] = [];

  for (const commit of commits) {
    let matched = false;

    for (const summary of summaries) {
      if (filesOverlap(commit.filesChanged, summary.filesChanged)) {
        if (!groups.has(summary.phase)) {
          groups.set(summary.phase, {
            label: `Phase ${summary.phase}`,
            entries: [],
            gsdSummary: summary,
          });
        }
        groups.get(summary.phase)!.entries.push(commit);
        matched = true;
        break;
      }
    }

    if (!matched) {
      unmatched.push(commit);
    }
  }

  const result = Array.from(groups.values()).sort(
    (a, b) => (a.gsdSummary?.phase ?? 0) - (b.gsdSummary?.phase ?? 0),
  );

  if (unmatched.length > 0) {
    result.push({ label: "Other Changes", entries: unmatched });
  }

  return result;
}
