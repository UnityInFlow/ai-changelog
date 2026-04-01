import { describe, it, expect } from "vitest";
import { matchCommitsToPhases } from "../src/matcher.js";
import { ChangeEntry, GsdSummary } from "../src/types.js";

const makeCommit = (overrides: Partial<ChangeEntry>): ChangeEntry => ({
  hash: "abc123",
  message: "feat: test",
  date: "2026-04-01",
  author: "Test",
  type: "feat",
  description: "test",
  filesChanged: [],
  breaking: false,
  ...overrides,
});

const makeSummary = (overrides: Partial<GsdSummary>): GsdSummary => ({
  phase: 1,
  planNumber: "01",
  whatWasBuilt: [],
  decisions: [],
  filesChanged: [],
  specRequirements: [],
  ...overrides,
});

describe("matchCommitsToPhases", () => {
  it("matches commits to phases by overlapping files", () => {
    const commits = [makeCommit({ filesChanged: ["src/auth/login.ts"] })];
    const summaries = [
      makeSummary({ phase: 1, filesChanged: ["src/auth/login.ts"] }),
    ];
    const groups = matchCommitsToPhases(commits, summaries);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toContain("Phase 1");
  });

  it("groups unmatched commits as ungrouped", () => {
    const commits = [makeCommit({ filesChanged: ["src/random.ts"] })];
    const summaries = [
      makeSummary({ phase: 1, filesChanged: ["src/auth/login.ts"] }),
    ];
    const groups = matchCommitsToPhases(commits, summaries);
    const ungrouped = groups.find((g) => g.label === "Other Changes");
    expect(ungrouped).toBeDefined();
    expect(ungrouped!.entries).toHaveLength(1);
  });

  it("handles empty commits", () => {
    const groups = matchCommitsToPhases([], []);
    expect(groups).toHaveLength(0);
  });

  it("handles commits with no GSD summaries", () => {
    const commits = [makeCommit({})];
    const groups = matchCommitsToPhases(commits, []);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Other Changes");
  });

  it("matches by directory prefix when exact file match fails", () => {
    const commits = [makeCommit({ filesChanged: ["src/auth/oauth.ts"] })];
    const summaries = [
      makeSummary({
        phase: 1,
        filesChanged: ["src/auth/login.ts", "src/auth/jwt.ts"],
      }),
    ];
    const groups = matchCommitsToPhases(commits, summaries);
    expect(groups[0].label).toContain("Phase 1");
  });

  it("attaches GSD summary to matched group", () => {
    const commits = [makeCommit({ filesChanged: ["src/auth/login.ts"] })];
    const summaries = [
      makeSummary({
        phase: 1,
        filesChanged: ["src/auth/login.ts"],
        whatWasBuilt: ["Login page"],
      }),
    ];
    const groups = matchCommitsToPhases(commits, summaries);
    expect(groups[0].gsdSummary?.whatWasBuilt).toContain("Login page");
  });
});
