import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseRequirements } from "../../src/parsers/requirements.js";

const fixture = readFileSync(
  resolve("tests/fixtures/requirements.md"),
  "utf-8",
);

describe("parseRequirements", () => {
  it("extracts phases with numbers and names", () => {
    const result = parseRequirements(fixture);
    expect(result.phases).toHaveLength(2);
    expect(result.phases[0]).toMatchObject({
      number: 1,
      name: "Authentication",
    });
    expect(result.phases[1]).toMatchObject({ number: 2, name: "Dashboard" });
  });

  it("extracts features per phase", () => {
    const result = parseRequirements(fixture);
    expect(result.phases[0].features).toHaveLength(3);
    expect(result.phases[0].features[0]).toContain("Google OAuth");
  });

  it("extracts all features flat", () => {
    const result = parseRequirements(fixture);
    expect(result.features.length).toBeGreaterThanOrEqual(6);
  });

  it("extracts acceptance criteria", () => {
    const result = parseRequirements(fixture);
    expect(result.acceptanceCriteria).toHaveLength(3);
    expect(result.acceptanceCriteria[0]).toContain("Playwright");
  });

  it("handles empty input", () => {
    const result = parseRequirements("");
    expect(result.phases).toHaveLength(0);
    expect(result.features).toHaveLength(0);
    expect(result.acceptanceCriteria).toHaveLength(0);
  });

  it("handles input with no phases", () => {
    const result = parseRequirements("# Just a title\n\nSome text");
    expect(result.phases).toHaveLength(0);
  });
});
