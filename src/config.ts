import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { ChangelogConfig, DEFAULT_CONFIG } from "./types.js";

const CONFIG_FILENAME = "ai-changelog.config.json";

export function loadConfig(dir: string): ChangelogConfig {
  const configPath = resolve(dir, CONFIG_FILENAME);

  if (!existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }

  const raw = readFileSync(configPath, "utf-8");
  const parsed = JSON.parse(raw) as Partial<ChangelogConfig>;

  return { ...DEFAULT_CONFIG, ...parsed };
}

export function initConfig(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const configPath = join(dir, CONFIG_FILENAME);
  writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n");
}
