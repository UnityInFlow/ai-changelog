import { describe, it, expect } from "vitest";
import { generateChangelog } from "../src/generator.js";
import { ChangeEntry, ChangelogGroup, ChangelogOutput } from "../src/types.js";
import { resolve } from "node:path";

const makeEntry = (overrides: Partial<ChangeEntry> = {}): ChangeEntry => ({
  hash: "abc1234",
  message: "feat: add feature",
  date: "2026-04-01",
  author: "Test",
  type: "feat",
  description: "add feature",
  filesChanged: [],
  breaking: false,
  ...overrides,
});

describe("generateChangelog", () => {
  it("generates product format", async () => {
    const groups: ChangelogGroup[] = [
      {
        label: "Phase 1",
        entries: [makeEntry({ description: "user login" })],
      },
    ];
    const output: ChangelogOutput = {
      version: "v1.0.0",
      date: "April 2026",
      groups,
      breaking: [],
    };
    const result = await generateChangelog(output, "product");
    expect(result).toContain("v1.0.0");
    expect(result).toContain("Phase 1");
    expect(result).toContain("user login");
  });

  it("generates technical format", async () => {
    const groups: ChangelogGroup[] = [
      {
        label: "Phase 1",
        entries: [
          makeEntry({
            type: "fix",
            scope: "auth",
            description: "token expiry",
            hash: "def5678",
          }),
        ],
      },
    ];
    const output: ChangelogOutput = {
      version: "v1.0.0",
      date: "April 2026",
      groups,
      breaking: [],
    };
    const result = await generateChangelog(output, "technical");
    expect(result).toContain("fix(auth)");
    expect(result).toContain("def5678");
  });

  it("includes breaking changes section", async () => {
    const output: ChangelogOutput = {
      version: "v2.0.0",
      date: "April 2026",
      groups: [],
      breaking: [makeEntry({ description: "removed old API", breaking: true })],
    };
    const result = await generateChangelog(output, "product");
    expect(result).toContain("Breaking Changes");
    expect(result).toContain("removed old API");
  });

  it("handles empty groups", async () => {
    const output: ChangelogOutput = {
      version: "v1.0.0",
      date: "April 2026",
      groups: [],
      breaking: [],
    };
    const result = await generateChangelog(output, "product");
    expect(result).toContain("v1.0.0");
  });

  it("includes GSD summary in technical format", async () => {
    const groups: ChangelogGroup[] = [
      {
        label: "Phase 1",
        entries: [makeEntry()],
        gsdSummary: {
          phase: 1,
          planNumber: "01",
          whatWasBuilt: ["Login page"],
          decisions: ["Chose PKCE flow"],
          filesChanged: ["src/auth/login.ts"],
          specRequirements: ["REQ-001"],
        },
      },
    ];
    const output: ChangelogOutput = {
      version: "v1.0.0",
      date: "April 2026",
      groups,
      breaking: [],
    };
    const result = await generateChangelog(output, "technical");
    expect(result).toContain("Chose PKCE flow");
    expect(result).toContain("src/auth/login.ts");
  });

  it("uses GSD summary whatWasBuilt in product format when available", async () => {
    const groups: ChangelogGroup[] = [
      {
        label: "Phase 1",
        entries: [makeEntry()],
        gsdSummary: {
          phase: 1,
          planNumber: "01",
          whatWasBuilt: ["Login page", "OAuth2 integration"],
          decisions: [],
          filesChanged: [],
          specRequirements: [],
        },
      },
    ];
    const output: ChangelogOutput = {
      version: "v1.0.0",
      date: "April 2026",
      groups,
      breaking: [],
    };
    const result = await generateChangelog(output, "product");
    expect(result).toContain("Login page");
    expect(result).toContain("OAuth2 integration");
    expect(result).toContain("New Features");
  });

  it("shows bug fixes in product format", async () => {
    const groups: ChangelogGroup[] = [
      {
        label: "Phase 1",
        entries: [
          makeEntry({ type: "fix", description: "fixed crash on login" }),
          makeEntry({ type: "feat", description: "new dashboard" }),
        ],
      },
    ];
    const output: ChangelogOutput = {
      version: "v1.0.0",
      date: "April 2026",
      groups,
      breaking: [],
    };
    const result = await generateChangelog(output, "product");
    expect(result).toContain("Bug Fixes");
    expect(result).toContain("fixed crash on login");
  });

  it("supports custom template path", async () => {
    const customTemplatePath = resolve("tests/fixtures/custom-template.hbs");
    const output: ChangelogOutput = {
      version: "v1.0.0",
      date: "April 2026",
      groups: [{ label: "Test", entries: [makeEntry()] }],
      breaking: [],
    };
    const result = await generateChangelog(
      output,
      "product",
      customTemplatePath,
    );
    expect(result).toContain("CUSTOM: v1.0.0");
  });

  it("outputs consistent trailing newline", async () => {
    const output: ChangelogOutput = {
      version: "v1.0.0",
      date: "April 2026",
      groups: [],
      breaking: [],
    };
    const result = await generateChangelog(output, "product");
    expect(result.endsWith("\n")).toBe(true);
    expect(result.endsWith("\n\n")).toBe(false);
  });
});
