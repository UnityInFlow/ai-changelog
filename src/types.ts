export interface ChangeEntry {
  hash: string;
  message: string;
  date: string;
  author: string;
  type: "feat" | "fix" | "docs" | "chore" | "refactor" | "test" | "other";
  scope?: string;
  description: string;
  filesChanged: string[];
  breaking: boolean;
}

export interface GsdSummary {
  phase: number;
  planNumber: string;
  whatWasBuilt: string[];
  decisions: string[];
  filesChanged: string[];
  specRequirements: string[];
}

export interface GsdRequirements {
  features: string[];
  acceptanceCriteria: string[];
  phases: { number: number; name: string; features: string[] }[];
}

export interface ChangelogGroup {
  label: string;
  entries: ChangeEntry[];
  gsdSummary?: GsdSummary;
}

export interface ChangelogOutput {
  version: string;
  date: string;
  groups: ChangelogGroup[];
  breaking: ChangeEntry[];
}

export interface ChangelogConfig {
  groupBy: "phase" | "type";
  formats: ("product" | "technical")[];
  output: string;
  github?: { repo: string; createRelease: boolean };
  templates?: { product?: string; technical?: string };
  gsdDir: string;
}

export const DEFAULT_CONFIG: ChangelogConfig = {
  groupBy: "phase",
  formats: ["product", "technical"],
  output: "CHANGELOG.md",
  gsdDir: ".planning",
};
