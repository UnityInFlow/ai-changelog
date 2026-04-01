import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseGsdSummary } from "../../src/parsers/gsd-summary.js";

const fixture = (name: string) =>
  readFileSync(resolve("tests/fixtures", name), "utf-8");

describe("parseGsdSummary", () => {
  it("extracts phase number and plan number", () => {
    const result = parseGsdSummary(fixture("summary-phase1.md"));
    expect(result.phase).toBe(1);
    expect(result.planNumber).toBe("01-03");
  });

  it("extracts what was built", () => {
    const result = parseGsdSummary(fixture("summary-phase1.md"));
    expect(result.whatWasBuilt).toHaveLength(3);
    expect(result.whatWasBuilt[0]).toContain("authentication");
  });

  it("extracts decisions", () => {
    const result = parseGsdSummary(fixture("summary-phase1.md"));
    expect(result.decisions).toHaveLength(2);
    expect(result.decisions[0]).toContain("PKCE");
  });

  it("extracts files changed", () => {
    const result = parseGsdSummary(fixture("summary-phase1.md"));
    expect(result.filesChanged.length).toBeGreaterThanOrEqual(3);
  });

  it("extracts spec requirements", () => {
    const result = parseGsdSummary(fixture("summary-phase1.md"));
    expect(result.specRequirements).toHaveLength(3);
    expect(result.specRequirements[0]).toContain("REQ-001");
  });

  it("parses a different phase", () => {
    const result = parseGsdSummary(fixture("summary-phase2.md"));
    expect(result.phase).toBe(2);
    expect(result.whatWasBuilt).toHaveLength(3);
  });

  it("returns empty arrays for missing sections", () => {
    const result = parseGsdSummary(
      "# Phase 3 Summary — Plan 07\n\nNo sections here.",
    );
    expect(result.whatWasBuilt).toHaveLength(0);
    expect(result.decisions).toHaveLength(0);
    expect(result.filesChanged).toHaveLength(0);
    expect(result.specRequirements).toHaveLength(0);
  });

  it("handles empty input", () => {
    const result = parseGsdSummary("");
    expect(result.phase).toBe(0);
    expect(result.whatWasBuilt).toHaveLength(0);
  });
});
