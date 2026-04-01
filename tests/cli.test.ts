import { describe, it, expect, beforeAll } from "vitest";
import { execaNode } from "execa";
import { resolve } from "node:path";
import { existsSync, unlinkSync } from "node:fs";

const CLI_PATH = resolve("dist/index.js");

describe("CLI integration", () => {
  beforeAll(async () => {
    const { execaCommand } = await import("execa");
    await execaCommand("npm run build");
  });

  it("shows help", async () => {
    const result = await execaNode(CLI_PATH, ["--help"]);
    expect(result.stdout).toContain("ai-changelog");
    expect(result.stdout).toContain("generate");
    expect(result.stdout).toContain("publish");
    expect(result.stdout).toContain("init");
  });

  it("shows version", async () => {
    const result = await execaNode(CLI_PATH, ["--version"]);
    expect(result.stdout).toContain("0.0.1");
  });

  it("generates changelog from current repo", async () => {
    const result = await execaNode(CLI_PATH, ["generate", "--to", "HEAD"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);
  });

  it("generates changelog in technical format", async () => {
    const result = await execaNode(CLI_PATH, [
      "generate",
      "--to",
      "HEAD",
      "--format",
      "technical",
    ]);
    expect(result.exitCode).toBe(0);
  });

  it("writes changelog to file", async () => {
    const outputPath = resolve("tests/fixtures/test-output.md");
    try {
      await execaNode(CLI_PATH, [
        "generate",
        "--to",
        "HEAD",
        "--output",
        outputPath,
      ]);
      expect(existsSync(outputPath)).toBe(true);
    } finally {
      if (existsSync(outputPath)) unlinkSync(outputPath);
    }
  });

  it("creates config file with init", async () => {
    const configPath = resolve("ai-changelog.config.json");
    try {
      await execaNode(CLI_PATH, ["init"]);
      expect(existsSync(configPath)).toBe(true);
    } finally {
      if (existsSync(configPath)) unlinkSync(configPath);
    }
  });

  it("uses --to value as version label", async () => {
    const result = await execaNode(CLI_PATH, [
      "generate",
      "--to",
      "v1.0.0-test",
    ]);
    expect(result.stdout).toContain("v1.0.0-test");
  });
});
