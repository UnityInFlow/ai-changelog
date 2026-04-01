import { describe, it, expect } from "vitest";
import { loadConfig, initConfig } from "../src/config.js";
import { resolve } from "node:path";
import { existsSync, rmSync } from "node:fs";

describe("config", () => {
  it("returns defaults when no config file exists", () => {
    const config = loadConfig("/nonexistent/path");
    expect(config.groupBy).toBe("phase");
    expect(config.formats).toEqual(["product", "technical"]);
    expect(config.output).toBe("CHANGELOG.md");
    expect(config.gsdDir).toBe(".planning");
  });

  it("loads config from fixture file", () => {
    const config = loadConfig(resolve("tests/fixtures"));
    expect(config.output).toBe("RELEASES.md");
    expect(config.formats).toEqual(["product"]);
    expect(config.github?.repo).toBe("UnityInFlow/example");
  });

  it("merges with defaults for missing fields", () => {
    const config = loadConfig(resolve("tests/fixtures"));
    expect(config.gsdDir).toBe(".planning");
  });

  it("preserves templates field from config file", () => {
    // The fixture doesn't have templates, so it should remain undefined
    const config = loadConfig(resolve("tests/fixtures"));
    expect(config.templates).toBeUndefined();
  });

  it("initConfig creates a config file", () => {
    const testDir = resolve("tests/fixtures/temp-init");
    const configPath = resolve(testDir, "ai-changelog.config.json");
    try {
      initConfig(testDir);
      expect(existsSync(configPath)).toBe(true);

      // Verify the created config is valid and matches defaults
      const config = loadConfig(testDir);
      expect(config.groupBy).toBe("phase");
      expect(config.formats).toEqual(["product", "technical"]);
      expect(config.output).toBe("CHANGELOG.md");
    } finally {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true });
      }
    }
  });

  it("initConfig creates parent directories if needed", () => {
    const testDir = resolve("tests/fixtures/temp-nested/deep/dir");
    const configPath = resolve(testDir, "ai-changelog.config.json");
    try {
      initConfig(testDir);
      expect(existsSync(configPath)).toBe(true);
    } finally {
      const topLevel = resolve("tests/fixtures/temp-nested");
      if (existsSync(topLevel)) {
        rmSync(topLevel, { recursive: true });
      }
    }
  });

  it("returns github as undefined when not in config", () => {
    const config = loadConfig("/nonexistent/path");
    expect(config.github).toBeUndefined();
  });
});
