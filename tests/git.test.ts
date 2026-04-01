import { describe, it, expect } from "vitest";
import { getCommitRange, getTagList } from "../src/git.js";
import { resolve } from "node:path";

// Tests run against the ai-changelog repo itself
const repoPath = resolve(".");

describe("git", () => {
  describe("getTagList", () => {
    it("returns an array", async () => {
      const tags = await getTagList(repoPath);
      expect(Array.isArray(tags)).toBe(true);
    });
  });

  describe("getCommitRange", () => {
    it("returns commits from HEAD", async () => {
      const commits = await getCommitRange(repoPath, { to: "HEAD" });
      expect(commits.length).toBeGreaterThanOrEqual(1);
    });

    it("returns commits with expected fields", async () => {
      const commits = await getCommitRange(repoPath, { to: "HEAD" });
      const first = commits[0];
      expect(first).toHaveProperty("hash");
      expect(first).toHaveProperty("message");
      expect(first).toHaveProperty("date");
      expect(first).toHaveProperty("author");
      expect(first).toHaveProperty("filesChanged");
    });

    it("respects from/to range", async () => {
      const all = await getCommitRange(repoPath, { to: "HEAD" });
      // With 'from' set to HEAD, should return 0 commits
      if (all.length > 1) {
        const subset = await getCommitRange(repoPath, {
          from: all[0].hash,
          to: "HEAD",
        });
        expect(subset.length).toBeLessThan(all.length);
      }
    });
  });
});
