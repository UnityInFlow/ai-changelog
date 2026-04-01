import { describe, it, expect } from "vitest";
import { parseConventionalCommit } from "../../src/parsers/commit.js";

describe("parseConventionalCommit", () => {
  it("parses a feat commit", () => {
    const result = parseConventionalCommit("feat: add login page");
    expect(result).toMatchObject({
      type: "feat",
      description: "add login page",
      breaking: false,
    });
  });

  it("parses a fix commit with scope", () => {
    const result = parseConventionalCommit("fix(auth): handle expired tokens");
    expect(result).toMatchObject({
      type: "fix",
      scope: "auth",
      description: "handle expired tokens",
    });
  });

  it("detects breaking change with !", () => {
    const result = parseConventionalCommit("feat!: remove legacy API");
    expect(result.breaking).toBe(true);
  });

  it("detects BREAKING CHANGE in body", () => {
    const result = parseConventionalCommit(
      "feat: new auth\n\nBREAKING CHANGE: old tokens invalid",
    );
    expect(result.breaking).toBe(true);
  });

  it("falls back to other for non-conventional commits", () => {
    const result = parseConventionalCommit("updated readme");
    expect(result.type).toBe("other");
    expect(result.description).toBe("updated readme");
  });

  it("handles empty message", () => {
    const result = parseConventionalCommit("");
    expect(result.type).toBe("other");
    expect(result.description).toBe("");
  });

  it("parses docs type", () => {
    expect(parseConventionalCommit("docs: update API reference").type).toBe(
      "docs",
    );
  });

  it("parses refactor type with scope", () => {
    const result = parseConventionalCommit("refactor(core): extract utils");
    expect(result.type).toBe("refactor");
    expect(result.scope).toBe("core");
  });
});
