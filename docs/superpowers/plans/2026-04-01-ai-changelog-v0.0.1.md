# ai-changelog v0.0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `@unityinflow/ai-changelog` v0.0.1 to npm — a CLI that generates product and technical changelogs from git history and GSD planning files.

**Architecture:** A git walker reads commit history between tags/refs. A GSD parser extracts structured data from `.planning/*-SUMMARY.md` and `REQUIREMENTS.md` files. A matcher links commits to GSD phases. A generator groups changes and renders them through Handlebars templates into product or technical changelog formats. A CLI wraps everything with `commander`.

**Tech Stack:** TypeScript (strict, ES2022, ESM), tsup (build), vitest (test), commander (CLI), simple-git (git operations), handlebars (templates), @octokit/rest (GitHub Releases)

**Spec:** `02-ai-changelog.md`
**Process:** `../01-spec-linter/docs/superpowers/specs/2026-04-01-development-process-design.md`

---

## File Structure

```
ai-changelog/
├── .github/
│   ├── workflows/ci.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   └── adr/
│       └── ADR-001-tech-stack.md
├── src/
│   ├── types.ts              ← ChangeEntry, GsdSummary, ChangelogConfig, ChangelogOutput
│   ├── git.ts                ← getCommitRange(), getTagList() using simple-git
│   ├── parsers/
│   │   ├── gsd-summary.ts    ← parseGsdSummary(): extract phase, what was built, decisions
│   │   ├── requirements.ts   ← parseRequirements(): extract feature names, acceptance criteria
│   │   └── commit.ts         ← parseConventionalCommit(): parse feat/fix/docs from message
│   ├── matcher.ts            ← matchCommitsToPhases(): link commits to GSD phases by date/path
│   ├── generator.ts          ← generateChangelog(): group by phase, render through templates
│   ├── templates/
│   │   ├── product.hbs       ← stakeholder-friendly format
│   │   └── technical.hbs     ← developer-friendly format
│   ├── config.ts             ← loadConfig(), initConfig(), default config
│   ├── github.ts             ← createGithubRelease() using @octokit/rest
│   └── index.ts              ← CLI entry point (commander)
├── tests/
│   ├── fixtures/
│   │   ├── git-log.json          ← mock git log output
│   │   ├── summary-phase1.md     ← sample GSD SUMMARY.md
│   │   ├── summary-phase2.md     ← sample GSD SUMMARY.md
│   │   ├── requirements.md       ← sample REQUIREMENTS.md
│   │   └── ai-changelog.config.json
│   ├── parsers/
│   │   ├── gsd-summary.test.ts
│   │   ├── requirements.test.ts
│   │   └── commit.test.ts
│   ├── git.test.ts
│   ├── matcher.test.ts
│   ├── generator.test.ts
│   ├── config.test.ts
│   └── cli.test.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
├── LICENSE
├── CONTRIBUTING.md
└── CHANGELOG.md
```

---

## Task 1: Create GitHub repo and scaffold project

> **PR 1: Foundation**

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsup.config.ts`, `.gitignore`
- Create: `.github/workflows/ci.yml`, `.github/PULL_REQUEST_TEMPLATE.md`
- Create: `README.md` (skeleton), `LICENSE` (MIT), `docs/adr/ADR-001-tech-stack.md`
- Create: `src/types.ts`, `src/index.ts` (stub)

- [ ] **Step 1: Create the GitHub repo**

```bash
gh repo create UnityInFlow/ai-changelog --public --description "AI-aware changelog generator — product and technical changelogs from agent commits and GSD planning files" --clone
cd ai-changelog
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "@unityinflow/ai-changelog",
  "version": "0.0.0",
  "description": "AI-aware changelog generator — product and technical changelogs from agent commits and GSD planning files",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "ai-changelog": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc --noEmit",
    "format": "prettier --check src/ tests/",
    "format:fix": "prettier --write src/ tests/",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["changelog", "ai", "gsd", "git", "release", "claude-code"],
  "author": "Jiri Hermann",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/UnityInFlow/ai-changelog.git"
  },
  "engines": {
    "node": ">=18"
  },
  "files": ["dist"]
}
```

- [ ] **Step 3: Install dependencies**

```bash
npm install commander simple-git handlebars @octokit/rest
npm install -D typescript tsup vitest @types/node prettier
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"],
    "ignoreDeprecations": "6.0"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 5: Create tsup.config.ts**

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "node18",
  banner: {
    js: "#!/usr/bin/env node",
  },
});
```

- [ ] **Step 6: Create .gitignore**

```
node_modules/
dist/
*.tsbuildinfo
.DS_Store
```

- [ ] **Step 7: Create CI workflow (`.github/workflows/ci.yml`)**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    strategy:
      matrix:
        runner: [arc-runner-unityinflow, orangepi]
        node-version: [18, 20]
    runs-on: ${{ matrix.runner }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run format
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

- [ ] **Step 8: Create PR template (`.github/PULL_REQUEST_TEMPLATE.md`)**

Same template as spec-linter (Code/Tests/Docs/Verification/Self-Review/Smoke Test checklist).

- [ ] **Step 9: Create README skeleton**

```markdown
# @unityinflow/ai-changelog

> AI-aware changelog generator — product and technical changelogs from agent commits and GSD planning files.

**Status:** Under construction

## What this does

Generates two changelog formats from git history and GSD planning files:
- **Product changelog** — for stakeholders ("users can now log in with Google")
- **Technical changelog** — for devs ("added OAuth2 flow, JWT session tokens")

## Installation

Coming soon — `npm install -g @unityinflow/ai-changelog`

## License

MIT
```

- [ ] **Step 10: Create ADR-001 (`docs/adr/ADR-001-tech-stack.md`)**

```markdown
# ADR-001: Tech Stack for ai-changelog

**Status:** Accepted
**Date:** 2026-04-01

## Context

ai-changelog generates changelogs from git history and GSD planning files. It needs to walk git history, parse markdown, render templates, and optionally push to GitHub Releases.

## Decision

- **TypeScript** with strict mode, ES2022, ESM
- **tsup** for building, **vitest** for testing, **commander** for CLI
- **simple-git** for git operations (mature, well-typed, handles edge cases)
- **handlebars** for changelog templates (logic-less, user-customizable)
- **@octokit/rest** for GitHub Releases API (official SDK)
- **No LLM calls in v0.0.1** — changelogs are generated from structured GSD files + conventional commits, not by prompting an AI. AI summarization is a v0.1.0 feature.

## Alternatives Considered

- **isomorphic-git** — pure JS but less mature, worse Windows support
- **EJS/mustache** — EJS too powerful (XSS risk in templates), mustache too limited (no helpers)
- **marked/remark for GSD parsing** — overkill; GSD files have predictable structure, regex + line splitting is sufficient
- **GitHub CLI (`gh`)** — not programmatic, can't be used as a library

## Consequences

- 4 runtime dependencies (commander, simple-git, handlebars, @octokit/rest)
- Git must be installed on the host machine (simple-git shells out)
- Users can customize templates by providing their own .hbs files
- GitHub Releases integration requires a GITHUB_TOKEN env var
```

- [ ] **Step 11: Create src/types.ts**

```typescript
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
  github?: {
    repo: string;
    createRelease: boolean;
  };
  templates?: {
    product?: string;
    technical?: string;
  };
  gsdDir: string;
}

export const DEFAULT_CONFIG: ChangelogConfig = {
  groupBy: "phase",
  formats: ["product", "technical"],
  output: "CHANGELOG.md",
  gsdDir: ".planning",
};
```

- [ ] **Step 12: Create stub src/index.ts**

```typescript
// Stub entry point — replaced with CLI in Task 10
export type { ChangeEntry, ChangelogConfig, ChangelogOutput } from "./types.js";
```

- [ ] **Step 13: Commit and push**

```bash
git add .
git commit -m "feat: scaffold project with TypeScript, tsup, vitest, CI"
git remote add origin https://github.com/UnityInFlow/ai-changelog.git
git push -u origin main
```

- [ ] **Step 14: Create GitHub milestone**

```bash
gh api repos/UnityInFlow/ai-changelog/milestones -f title="v0.0.1" -f description="MVP: product + technical changelog generation from git history and GSD files"
```

---

## Task 2: Implement commit parser

> **PR 1: Foundation (continued)**

**Files:**
- Create: `src/parsers/commit.ts`
- Create: `tests/parsers/commit.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
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
    const result = parseConventionalCommit("docs: update API reference");
    expect(result.type).toBe("docs");
  });

  it("parses refactor type", () => {
    const result = parseConventionalCommit("refactor(core): extract utils");
    expect(result.type).toBe("refactor");
    expect(result.scope).toBe("core");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/parsers/commit.test.ts
```

- [ ] **Step 3: Implement commit parser**

```typescript
import { ChangeEntry } from "../types.js";

const CONVENTIONAL_RE =
  /^(?<type>feat|fix|docs|chore|refactor|test)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?\s*:\s*(?<description>.+)/;

type ParsedCommit = Pick<
  ChangeEntry,
  "type" | "scope" | "description" | "breaking"
>;

export function parseConventionalCommit(message: string): ParsedCommit {
  const firstLine = message.split("\n")[0];
  const match = firstLine.match(CONVENTIONAL_RE);

  if (!match?.groups) {
    return {
      type: "other",
      description: firstLine,
      breaking: message.includes("BREAKING CHANGE"),
    };
  }

  const { type, scope, breaking, description } = match.groups;

  return {
    type: type as ChangeEntry["type"],
    scope: scope || undefined,
    description: description.trim(),
    breaking: breaking === "!" || message.includes("BREAKING CHANGE"),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/parsers/commit.test.ts
```

Expected: 8/8 PASS

- [ ] **Step 5: Commit**

```bash
git add src/parsers/commit.ts tests/parsers/commit.test.ts
git commit -m "feat: add conventional commit parser"
```

---

## Task 3: Implement GSD summary parser

> **PR 2: Parsers + Git**

**Files:**
- Create: `src/parsers/gsd-summary.ts`
- Create: `tests/parsers/gsd-summary.test.ts`
- Create: `tests/fixtures/summary-phase1.md`
- Create: `tests/fixtures/summary-phase2.md`

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b feat/parsers-git
```

- [ ] **Step 2: Create test fixtures**

`tests/fixtures/summary-phase1.md`:
```markdown
# Phase 1 Summary — Plan 01-03

## What Was Built
- User authentication with Google OAuth
- JWT session token management
- Rate limiting middleware (10 req/min per IP)

## Decisions Made
- Chose PKCE flow over implicit grant for security
- httpOnly cookies for token storage (not localStorage)

## Files Changed
- src/auth/google-oauth.ts
- src/auth/jwt.ts
- src/middleware/rate-limit.ts
- tests/auth/

## Spec Requirements Met
- REQ-001: Users can log in with Google
- REQ-002: Sessions expire after 24 hours
- REQ-003: Rate limiting on auth endpoints
```

`tests/fixtures/summary-phase2.md`:
```markdown
# Phase 2 Summary — Plan 04-06

## What Was Built
- Real-time token cost dashboard
- Agent session cost tracking
- SQLite schema for sessions and agent_calls

## Decisions Made
- HTMX polling over WebSocket (simpler, sufficient for 5s refresh)
- SQLite over PostgreSQL for zero-config local experience

## Files Changed
- src/dashboard/cost.ts
- src/db/schema.sql
- src/routes/dashboard.ts

## Spec Requirements Met
- REQ-010: Dashboard shows cost per agent session
- REQ-011: Costs update in real time
```

- [ ] **Step 3: Write failing tests**

```typescript
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
    const result = parseGsdSummary("# Phase 3 Summary — Plan 07\n\nNo sections here.");
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
```

- [ ] **Step 4: Implement GSD summary parser**

```typescript
import { GsdSummary } from "../types.js";

const SECTION_HEADERS: Record<keyof Omit<GsdSummary, "phase" | "planNumber">, string> = {
  whatWasBuilt: "What Was Built",
  decisions: "Decisions Made",
  filesChanged: "Files Changed",
  specRequirements: "Spec Requirements Met",
};

function extractListItems(content: string, sectionName: string): string[] {
  const sectionRegex = new RegExp(
    `## ${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`,
  );
  const match = content.match(sectionRegex);
  if (!match) return [];

  return match[1]
    .split("\n")
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter((line) => line.length > 0);
}

export function parseGsdSummary(content: string): GsdSummary {
  const headerMatch = content.match(
    /# Phase (\d+) Summary\s*(?:—|-)?\s*Plan\s+([^\n]+)/,
  );

  return {
    phase: headerMatch ? parseInt(headerMatch[1], 10) : 0,
    planNumber: headerMatch ? headerMatch[2].trim() : "",
    whatWasBuilt: extractListItems(content, SECTION_HEADERS.whatWasBuilt),
    decisions: extractListItems(content, SECTION_HEADERS.decisions),
    filesChanged: extractListItems(content, SECTION_HEADERS.filesChanged),
    specRequirements: extractListItems(content, SECTION_HEADERS.specRequirements),
  };
}
```

- [ ] **Step 5: Run tests, verify pass, commit**

```bash
npx vitest run tests/parsers/gsd-summary.test.ts
git add src/parsers/gsd-summary.ts tests/parsers/gsd-summary.test.ts tests/fixtures/summary-phase1.md tests/fixtures/summary-phase2.md
git commit -m "feat: add GSD summary parser"
```

---

## Task 4: Implement requirements parser

> **PR 2 (continued)**

**Files:**
- Create: `src/parsers/requirements.ts`
- Create: `tests/parsers/requirements.test.ts`
- Create: `tests/fixtures/requirements.md`

- [ ] **Step 1: Create test fixture**

`tests/fixtures/requirements.md`:
```markdown
# Project Requirements

## Phase 1: Authentication
- REQ-001: Users can log in with Google OAuth
- REQ-002: Sessions expire after 24 hours
- REQ-003: Rate limiting on auth endpoints

## Phase 2: Dashboard
- REQ-010: Dashboard shows cost per agent session
- REQ-011: Costs update in real time
- REQ-012: Export cost data as CSV

## Acceptance Criteria
- [ ] All auth flows tested with Playwright
- [ ] Dashboard loads in under 2 seconds
- [ ] CSV export matches displayed data
```

- [ ] **Step 2: Write failing tests**

```typescript
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
    expect(result.phases[0]).toMatchObject({ number: 1, name: "Authentication" });
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
```

- [ ] **Step 3: Implement requirements parser**

```typescript
import { GsdRequirements } from "../types.js";

export function parseRequirements(content: string): GsdRequirements {
  const phases: GsdRequirements["phases"] = [];
  const allFeatures: string[] = [];
  const acceptanceCriteria: string[] = [];

  const lines = content.split("\n");
  let currentPhase: { number: number; name: string; features: string[] } | null =
    null;
  let inAcceptanceCriteria = false;

  for (const line of lines) {
    const phaseMatch = line.match(/^## Phase (\d+):\s*(.+)/);
    if (phaseMatch) {
      if (currentPhase) phases.push(currentPhase);
      currentPhase = {
        number: parseInt(phaseMatch[1], 10),
        name: phaseMatch[2].trim(),
        features: [],
      };
      inAcceptanceCriteria = false;
      continue;
    }

    if (line.match(/^## Acceptance Criteria/i)) {
      if (currentPhase) phases.push(currentPhase);
      currentPhase = null;
      inAcceptanceCriteria = true;
      continue;
    }

    if (line.match(/^## /)) {
      if (currentPhase) phases.push(currentPhase);
      currentPhase = null;
      inAcceptanceCriteria = false;
      continue;
    }

    const itemMatch = line.match(/^[-*]\s+(?:\[.\]\s+)?(.+)/);
    if (itemMatch) {
      const item = itemMatch[1].trim();
      if (inAcceptanceCriteria) {
        acceptanceCriteria.push(item);
      } else if (currentPhase) {
        currentPhase.features.push(item);
        allFeatures.push(item);
      }
    }
  }

  if (currentPhase) phases.push(currentPhase);

  return { features: allFeatures, acceptanceCriteria, phases };
}
```

- [ ] **Step 4: Run tests, verify pass, commit**

```bash
npx vitest run tests/parsers/requirements.test.ts
git add src/parsers/requirements.ts tests/parsers/requirements.test.ts tests/fixtures/requirements.md
git commit -m "feat: add GSD requirements parser"
```

---

## Task 5: Implement git walker

> **PR 2 (continued)**

**Files:**
- Create: `src/git.ts`
- Create: `tests/git.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, beforeAll } from "vitest";
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
```

- [ ] **Step 2: Implement git walker**

```typescript
import simpleGit from "simple-git";
import { ChangeEntry } from "./types.js";
import { parseConventionalCommit } from "./parsers/commit.js";

interface CommitRange {
  from?: string;
  to: string;
}

export async function getCommitRange(
  repoPath: string,
  range: CommitRange,
): Promise<ChangeEntry[]> {
  const git = simpleGit(repoPath);
  const log = await git.log({
    from: range.from,
    to: range.to,
    "--name-only": null,
  });

  return log.all.map((commit) => {
    const parsed = parseConventionalCommit(commit.message);
    return {
      hash: commit.hash,
      message: commit.message,
      date: commit.date,
      author: commit.author_name,
      type: parsed.type,
      scope: parsed.scope,
      description: parsed.description,
      filesChanged: commit.diff?.files.map((f) => f.file) ?? [],
      breaking: parsed.breaking,
    };
  });
}

export async function getTagList(repoPath: string): Promise<string[]> {
  const git = simpleGit(repoPath);
  const tags = await git.tags();
  return tags.all;
}
```

- [ ] **Step 3: Run tests, verify pass, commit**

```bash
npx vitest run tests/git.test.ts
git add src/git.ts tests/git.test.ts
git commit -m "feat: add git commit walker with tag listing"
```

---

## Task 6: Implement matcher

> **PR 2 (continued)**

**Files:**
- Create: `src/matcher.ts`
- Create: `tests/matcher.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
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
    const commits = [
      makeCommit({ filesChanged: ["src/auth/login.ts"] }),
    ];
    const summaries = [
      makeSummary({ phase: 1, filesChanged: ["src/auth/login.ts"] }),
    ];
    const groups = matchCommitsToPhases(commits, summaries);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toContain("Phase 1");
  });

  it("groups unmatched commits as ungrouped", () => {
    const commits = [
      makeCommit({ filesChanged: ["src/random.ts"] }),
    ];
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
    const commits = [
      makeCommit({ filesChanged: ["src/auth/oauth.ts"] }),
    ];
    const summaries = [
      makeSummary({ phase: 1, filesChanged: ["src/auth/login.ts", "src/auth/jwt.ts"] }),
    ];
    const groups = matchCommitsToPhases(commits, summaries);
    expect(groups[0].label).toContain("Phase 1");
  });

  it("attaches GSD summary to matched group", () => {
    const commits = [
      makeCommit({ filesChanged: ["src/auth/login.ts"] }),
    ];
    const summaries = [
      makeSummary({ phase: 1, filesChanged: ["src/auth/login.ts"], whatWasBuilt: ["Login page"] }),
    ];
    const groups = matchCommitsToPhases(commits, summaries);
    expect(groups[0].gsdSummary?.whatWasBuilt).toContain("Login page");
  });
});
```

- [ ] **Step 2: Implement matcher**

```typescript
import { ChangeEntry, ChangelogGroup, GsdSummary } from "./types.js";
import { dirname } from "node:path";

function getDirectories(files: string[]): Set<string> {
  return new Set(files.map((f) => dirname(f)));
}

function filesOverlap(commitFiles: string[], summaryFiles: string[]): boolean {
  const commitSet = new Set(commitFiles);
  if (summaryFiles.some((f) => commitSet.has(f))) return true;

  const commitDirs = getDirectories(commitFiles);
  const summaryDirs = getDirectories(summaryFiles);
  for (const dir of commitDirs) {
    if (summaryDirs.has(dir)) return true;
  }

  return false;
}

export function matchCommitsToPhases(
  commits: ChangeEntry[],
  summaries: GsdSummary[],
): ChangelogGroup[] {
  if (commits.length === 0) return [];

  const groups = new Map<number, ChangelogGroup>();
  const unmatched: ChangeEntry[] = [];

  for (const commit of commits) {
    let matched = false;

    for (const summary of summaries) {
      if (filesOverlap(commit.filesChanged, summary.filesChanged)) {
        if (!groups.has(summary.phase)) {
          groups.set(summary.phase, {
            label: `Phase ${summary.phase}`,
            entries: [],
            gsdSummary: summary,
          });
        }
        groups.get(summary.phase)!.entries.push(commit);
        matched = true;
        break;
      }
    }

    if (!matched) {
      unmatched.push(commit);
    }
  }

  const result = Array.from(groups.values()).sort(
    (a, b) => (a.gsdSummary?.phase ?? 0) - (b.gsdSummary?.phase ?? 0),
  );

  if (unmatched.length > 0) {
    result.push({ label: "Other Changes", entries: unmatched });
  }

  return result;
}
```

- [ ] **Step 3: Run tests, verify pass, commit, push PR 2**

```bash
npx vitest run tests/matcher.test.ts
npx vitest run  # full suite
git add src/matcher.ts tests/matcher.test.ts
git commit -m "feat: add commit-to-phase matcher"
git push -u origin feat/parsers-git
gh pr create --title "feat: parsers, git walker, and matcher" --body "PR 2 of ai-changelog v0.0.1 milestone.

## What
- Conventional commit parser (8 tests)
- GSD SUMMARY.md parser (8 tests)
- GSD REQUIREMENTS.md parser (6 tests)
- Git commit walker with tag listing (3 tests)
- Commit-to-phase matcher (6 tests)
- Test fixtures for GSD files"
```

---

## Task 7: Implement Handlebars templates + generator

> **PR 3: Generator + Templates**

**Files:**
- Create: `src/templates/product.hbs`
- Create: `src/templates/technical.hbs`
- Create: `src/generator.ts`
- Create: `tests/generator.test.ts`

- [ ] **Step 1: Create feature branch**

```bash
git checkout main && git pull
git checkout -b feat/generator
```

- [ ] **Step 2: Create product template**

`src/templates/product.hbs`:
```handlebars
## {{version}} — {{date}}

{{#each groups}}
### {{label}}

{{#if gsdSummary}}
#### New Features
{{#each gsdSummary.whatWasBuilt}}- {{this}}
{{/each}}
{{else}}
{{#each entries}}
{{#if (eq type "feat")}}- {{description}}
{{/if}}{{/each}}
{{/if}}

{{#if (hasItems (filterByType entries "fix"))}}
#### Bug Fixes
{{#each entries}}
{{#if (eq type "fix")}}- {{description}}
{{/if}}{{/each}}
{{/if}}
{{/each}}

{{#if (hasItems breaking)}}
### Breaking Changes
{{#each breaking}}
- {{description}}
{{/each}}
{{/if}}
```

- [ ] **Step 3: Create technical template**

`src/templates/technical.hbs`:
```handlebars
## {{version}} — {{date}}

{{#each groups}}
### {{label}}
{{#each entries}}
- `{{type}}{{#if scope}}({{scope}}){{/if}}`: {{description}} ({{hash}})
{{/each}}
{{#if gsdSummary}}

**Decisions:** {{#each gsdSummary.decisions}}
- {{this}}
{{/each}}
**Files changed:** {{#each gsdSummary.filesChanged}}
- `{{this}}`
{{/each}}
{{/if}}
{{/each}}

{{#if (hasItems breaking)}}
### Breaking Changes
{{#each breaking}}
- `{{type}}`: {{description}} ({{hash}})
{{/each}}
{{/if}}
```

- [ ] **Step 4: Write failing generator tests**

```typescript
import { describe, it, expect } from "vitest";
import { generateChangelog } from "../src/generator.js";
import { ChangeEntry, ChangelogGroup, ChangelogOutput } from "../src/types.js";

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
      { label: "Phase 1", entries: [makeEntry({ description: "user login" })] },
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
      { label: "Phase 1", entries: [makeEntry({ type: "fix", scope: "auth", description: "token expiry", hash: "def5678" })] },
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
    const output: ChangelogOutput = { version: "v1.0.0", date: "April 2026", groups, breaking: [] };
    const result = await generateChangelog(output, "technical");
    expect(result).toContain("Chose PKCE flow");
    expect(result).toContain("src/auth/login.ts");
  });
});
```

- [ ] **Step 5: Implement generator**

```typescript
import Handlebars from "handlebars";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ChangelogOutput } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

Handlebars.registerHelper("eq", (a: string, b: string) => a === b);
Handlebars.registerHelper("hasItems", (arr: unknown[]) => Array.isArray(arr) && arr.length > 0);
Handlebars.registerHelper("filterByType", (entries: Array<{ type: string }>, type: string) =>
  entries.filter((e) => e.type === type),
);

function loadTemplate(format: "product" | "technical"): string {
  const templatePath = resolve(__dirname, "templates", `${format}.hbs`);
  return readFileSync(templatePath, "utf-8");
}

export async function generateChangelog(
  output: ChangelogOutput,
  format: "product" | "technical",
  customTemplatePath?: string,
): Promise<string> {
  const templateSource = customTemplatePath
    ? readFileSync(customTemplatePath, "utf-8")
    : loadTemplate(format);

  const template = Handlebars.compile(templateSource);
  return template(output).trim() + "\n";
}
```

- [ ] **Step 6: Run tests, verify pass, commit**

```bash
npx vitest run tests/generator.test.ts
git add src/generator.ts src/templates/ tests/generator.test.ts
git commit -m "feat: add changelog generator with Handlebars templates"
```

---

## Task 8: Implement config loader

> **PR 3 (continued)**

**Files:**
- Create: `src/config.ts`
- Create: `tests/config.test.ts`
- Create: `tests/fixtures/ai-changelog.config.json`

- [ ] **Step 1: Create test fixture**

`tests/fixtures/ai-changelog.config.json`:
```json
{
  "groupBy": "phase",
  "formats": ["product"],
  "output": "RELEASES.md",
  "github": {
    "repo": "UnityInFlow/example",
    "createRelease": true
  },
  "gsdDir": ".planning"
}
```

- [ ] **Step 2: Write failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { loadConfig, initConfig } from "../src/config.js";
import { resolve } from "node:path";
import { existsSync, unlinkSync, rmSync } from "node:fs";

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

  it("initConfig creates a config file", () => {
    const testDir = resolve("tests/fixtures/temp-init");
    const configPath = resolve(testDir, "ai-changelog.config.json");
    try {
      initConfig(testDir);
      expect(existsSync(configPath)).toBe(true);
    } finally {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true });
      }
    }
  });
});
```

- [ ] **Step 3: Implement config**

```typescript
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
```

- [ ] **Step 4: Run tests, verify pass, commit, push PR 3**

```bash
npx vitest run tests/config.test.ts
npx vitest run  # full suite
git add src/config.ts tests/config.test.ts tests/fixtures/ai-changelog.config.json
git commit -m "feat: add config loader with defaults and init"
git push -u origin feat/generator
gh pr create --title "feat: changelog generator, templates, and config" --body "PR 3 of ai-changelog v0.0.1 milestone.

## What
- Handlebars templates (product + technical formats)
- Changelog generator with GSD summary integration
- Config loader with defaults and init command support
- 9+ tests"
```

---

## Task 9: Implement GitHub Releases integration

> **PR 4: CLI + GitHub + Release**

**Files:**
- Create: `src/github.ts`
- Create: `tests/github.test.ts`

- [ ] **Step 1: Create feature branch**

```bash
git checkout main && git pull
git checkout -b feat/cli-release
```

- [ ] **Step 2: Write tests (mock-based)**

```typescript
import { describe, it, expect, vi } from "vitest";
import { createGithubRelease } from "../src/github.js";

// Mock @octokit/rest
vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    repos: {
      createRelease: vi.fn().mockResolvedValue({
        data: { html_url: "https://github.com/test/repo/releases/tag/v1.0.0" },
      }),
    },
  })),
}));

describe("github", () => {
  it("creates a release and returns URL", async () => {
    const url = await createGithubRelease({
      repo: "test/repo",
      tag: "v1.0.0",
      name: "v1.0.0",
      body: "Release notes",
      token: "fake-token",
    });
    expect(url).toContain("github.com");
  });

  it("throws without token", async () => {
    await expect(
      createGithubRelease({
        repo: "test/repo",
        tag: "v1.0.0",
        name: "v1.0.0",
        body: "Notes",
        token: "",
      }),
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 3: Implement GitHub integration**

```typescript
import { Octokit } from "@octokit/rest";

interface ReleaseOptions {
  repo: string;
  tag: string;
  name: string;
  body: string;
  token: string;
}

export async function createGithubRelease(
  options: ReleaseOptions,
): Promise<string> {
  if (!options.token) {
    throw new Error(
      "GITHUB_TOKEN is required for publishing releases. Set it as an environment variable.",
    );
  }

  const octokit = new Octokit({ auth: options.token });
  const [owner, repo] = options.repo.split("/");

  const response = await octokit.repos.createRelease({
    owner,
    repo,
    tag_name: options.tag,
    name: options.name,
    body: options.body,
  });

  return response.data.html_url;
}
```

- [ ] **Step 4: Run tests, commit**

```bash
npx vitest run tests/github.test.ts
git add src/github.ts tests/github.test.ts
git commit -m "feat: add GitHub Releases integration"
```

---

## Task 10: Implement CLI

> **PR 4 (continued)**

**Files:**
- Modify: `src/index.ts` (replace stub)

- [ ] **Step 1: Implement full CLI**

Replace `src/index.ts`:

```typescript
import { Command } from "commander";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { getCommitRange, getTagList } from "./git.js";
import { parseGsdSummary } from "./parsers/gsd-summary.js";
import { matchCommitsToPhases } from "./matcher.js";
import { generateChangelog } from "./generator.js";
import { loadConfig, initConfig } from "./config.js";
import { createGithubRelease } from "./github.js";
import { ChangeEntry, ChangelogGroup, ChangelogOutput, GsdSummary } from "./types.js";

const TYPE_LABELS: Record<string, string> = {
  feat: "New Features",
  fix: "Bug Fixes",
  docs: "Documentation",
  refactor: "Refactoring",
  test: "Testing",
  chore: "Maintenance",
  other: "Other Changes",
};

function groupByCommitType(commits: ChangeEntry[]): ChangelogGroup[] {
  const groups = new Map<string, ChangelogGroup>();
  for (const commit of commits) {
    const key = commit.type;
    if (!groups.has(key)) {
      groups.set(key, { label: TYPE_LABELS[key] ?? "Other Changes", entries: [] });
    }
    groups.get(key)!.entries.push(commit);
  }
  return Array.from(groups.values());
}

function findGsdSummaries(gsdDir: string): GsdSummary[] {
  const dir = resolve(gsdDir);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.includes("SUMMARY") && f.endsWith(".md"))
    .map((f) => parseGsdSummary(readFileSync(join(dir, f), "utf-8")));
}

const program = new Command();

program
  .name("ai-changelog")
  .description("AI-aware changelog generator")
  .version("0.0.1");

program
  .command("generate")
  .description("Generate changelog from git history and GSD files")
  .option("--from <ref>", "Start ref (tag or commit)")
  .option("--to <ref>", "End ref", "HEAD")
  .option("--format <type>", "Output format: product or technical", "product")
  .option("--output <path>", "Write to file instead of stdout")
  .action(async (options: { from?: string; to: string; format: string; output?: string }) => {
    const cwd = process.cwd();
    const config = loadConfig(cwd);

    const commits = await getCommitRange(cwd, {
      from: options.from,
      to: options.to,
    });

    if (commits.length === 0) {
      console.log("No commits found in range.");
      process.exit(0);
    }

    const summaries = findGsdSummaries(config.gsdDir);
    if (summaries.length === 0) {
      console.warn("No GSD files found, grouping by commit type. Use GSD for richer changelogs.");
    }
    const groups = summaries.length > 0
      ? matchCommitsToPhases(commits, summaries)
      : groupByCommitType(commits);

    const tags = await getTagList(cwd);
    const version =
      options.to !== "HEAD"
        ? options.to
        : tags.length > 0
          ? tags[tags.length - 1]
          : "unreleased";
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });

    const changelogOutput: ChangelogOutput = {
      version,
      date,
      groups,
      breaking: commits.filter((c) => c.breaking),
    };

    const format = options.format as "product" | "technical";
    const rendered = await generateChangelog(changelogOutput, format);

    if (options.output) {
      const outputPath = resolve(options.output);
      const existing = existsSync(outputPath) ? readFileSync(outputPath, "utf-8") : "";
      const combined = existing ? rendered + "\n" + existing : rendered;
      writeFileSync(outputPath, combined);
      console.log(`Changelog written to ${options.output}`);
    } else {
      console.log(rendered);
    }
  });

program
  .command("publish")
  .description("Push changelog to GitHub Releases")
  .requiredOption("--release <version>", "Release version tag")
  .option("--format <type>", "Changelog format", "product")
  .action(async (options: { release: string; format: string }) => {
    const cwd = process.cwd();
    const config = loadConfig(cwd);

    if (!config.github?.repo) {
      console.error("No github.repo configured in ai-changelog.config.json");
      process.exit(1);
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error("GITHUB_TOKEN environment variable is required");
      process.exit(1);
    }

    const tags = await getTagList(cwd);
    const prevTag = tags.length > 1 ? tags[tags.length - 2] : undefined;

    const commits = await getCommitRange(cwd, {
      from: prevTag,
      to: options.release,
    });

    const summaries = findGsdSummaries(config.gsdDir);
    const groups = matchCommitsToPhases(commits, summaries);

    const changelogOutput: ChangelogOutput = {
      version: options.release,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      }),
      groups,
      breaking: commits.filter((c) => c.breaking),
    };

    const format = options.format as "product" | "technical";
    const rendered = await generateChangelog(changelogOutput, format);

    const url = await createGithubRelease({
      repo: config.github.repo,
      tag: options.release,
      name: options.release,
      body: rendered,
      token,
    });

    console.log(`Release published: ${url}`);
  });

program
  .command("init")
  .description("Create ai-changelog.config.json in the current directory")
  .action(() => {
    initConfig(process.cwd());
    console.log("Created ai-changelog.config.json");
  });

program.parse();
```

- [ ] **Step 2: Build and smoke test**

```bash
npm run build
node dist/index.js generate --to HEAD
node dist/index.js init
node dist/index.js --help
```

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: add CLI with generate, publish, and init commands"
```

---

## Task 11: CLI integration tests + README

> **PR 4 (continued)**

**Files:**
- Create: `tests/cli.test.ts`
- Modify: `README.md`

- [ ] **Step 1: Install execa**

```bash
npm install -D execa
```

- [ ] **Step 2: Write CLI integration tests**

```typescript
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
});
```

- [ ] **Step 3: Update README with full usage**

```markdown
# @unityinflow/ai-changelog

> AI-aware changelog generator — product and technical changelogs from agent commits and GSD planning files.

## The Problem

Agent-generated commits are either terse machine strings or verbose implementation noise. Nobody can read 200 agent commits and understand what actually shipped.

Teams need:
- A **product changelog** ("users can now log in with Google") — for stakeholders
- A **technical changelog** ("added OAuth2 flow, JWT session tokens") — for devs

## Installation

```bash
npm install -g @unityinflow/ai-changelog
```

## Usage

```bash
# Generate changelog from last tag to HEAD
ai-changelog generate

# Specific range
ai-changelog generate --from v1.0.0 --to HEAD

# Technical format (includes file changes, decisions)
ai-changelog generate --format technical

# Write to file
ai-changelog generate --output CHANGELOG.md

# Push to GitHub Releases
GITHUB_TOKEN=xxx ai-changelog publish --release v1.2.0

# Create config file
ai-changelog init
```

## Output Formats

**Product (default):**
```markdown
## v1.2.0 — April 2026

### Phase 1
- Users can now log in with Google OAuth
- JWT session token management

### Breaking Changes
- None
```

**Technical:**
```markdown
## v1.2.0 — April 2026

### Phase 1
- `feat(auth)`: add Google OAuth with PKCE flow (abc1234)
- `feat(auth)`: JWT session tokens in httpOnly cookies (def5678)

**Decisions:**
- Chose PKCE flow over implicit grant for security
**Files changed:**
- `src/auth/google-oauth.ts`
- `src/auth/jwt.ts`
```

## Configuration

Create `ai-changelog.config.json`:

```json
{
  "groupBy": "phase",
  "formats": ["product", "technical"],
  "output": "CHANGELOG.md",
  "github": {
    "repo": "owner/repo",
    "createRelease": true
  },
  "gsdDir": ".planning"
}
```

## Exit Codes

- `0` — success
- `1` — error

## License

MIT
```

- [ ] **Step 4: Run full suite, commit, push PR 4**

```bash
npx vitest run
git add tests/cli.test.ts README.md package.json package-lock.json
git commit -m "feat: add CLI integration tests and full README"
git push -u origin feat/cli-release
gh pr create --title "feat: CLI with generate/publish/init, GitHub Releases, integration tests" --body "PR 4 of ai-changelog v0.0.1 milestone.

## What
- Full CLI with generate, publish, init commands
- GitHub Releases integration via @octokit/rest
- CLI integration tests (5 tests)
- Full README with usage examples and output format samples"
```

---

## Task 12: Release prep

> **PR 5: Release prep**

**Files:**
- Create: `CONTRIBUTING.md`
- Modify: `LICENSE` (already exists, verify content)
- Modify: `README.md` (final polish)
- Modify: `package.json` (version bump)
- Create: `CHANGELOG.md` (generated by the tool itself)

- [ ] **Step 1: Create feature branch**

```bash
git checkout main && git pull
git checkout -b feat/release-prep
```

- [ ] **Step 2: Create CONTRIBUTING.md**

```markdown
# Contributing to ai-changelog

## Development

```bash
npm install          # install deps
npm test             # run tests
npm run test:watch   # watch mode
npm run build        # build to dist/
npm run lint         # type check
```

## Adding a New Output Format

1. Create a Handlebars template in `src/templates/<format>.hbs`
2. Add the format name to the `ChangelogConfig` type in `src/types.ts`
3. Test with: `ai-changelog generate --format <format>`

## Adding a New Parser

1. Create `src/parsers/<parser>.ts` implementing the parse function
2. Create `tests/parsers/<parser>.test.ts` with at least 3 passing and 3 failing cases
3. Wire it into `matcher.ts` or `generator.ts` as needed

## Commit Convention

```
feat: add new parser
fix: handle edge case in GSD summary
test: add fixtures for phase matching
docs: update README
```
```

- [ ] **Step 3: Generate CHANGELOG.md using the tool itself**

```bash
npm run build
node dist/index.js generate --to HEAD --format technical --output CHANGELOG.md
```

- [ ] **Step 4: Bump version to 0.0.1**

In `package.json`, change `"version": "0.0.0"` to `"version": "0.0.1"`.

- [ ] **Step 5: Run full verification**

```bash
npm run format
npm run lint
npm run build
npm test
node dist/index.js generate --to HEAD
node dist/index.js init
```

- [ ] **Step 6: Commit, push, create PR 5**

```bash
git add .
git commit -m "docs: add CONTRIBUTING, CHANGELOG, bump to v0.0.1"
git push -u origin feat/release-prep
gh pr create --title "docs: release prep for v0.0.1" --body "PR 5 of ai-changelog v0.0.1 milestone.

## What
- CONTRIBUTING.md
- CHANGELOG.md (generated by the tool itself)
- Version bumped to 0.0.1
- Full verification passed"
```

- [ ] **Step 7: Request AI full-review**

Dispatch comprehensive code review before merging.

---

## Task 13: Publish and release

> **After PR 5 is merged**

- [ ] **Step 1: Merge and tag**

```bash
git checkout main && git pull
git merge feat/release-prep --no-edit
git push origin main
git tag v0.0.1
git push origin v0.0.1
```

- [ ] **Step 2: Create GitHub Release**

```bash
gh release create v0.0.1 --repo UnityInFlow/ai-changelog --title "v0.0.1" --notes "Initial release of @unityinflow/ai-changelog

## What's included
- Product and technical changelog generation from git history + GSD files
- CLI: generate, publish, init commands
- GitHub Releases integration
- Handlebars templates (customizable)

## Install
\`\`\`bash
npm install -g @unityinflow/ai-changelog
\`\`\`"
```

- [ ] **Step 3: Publish to npm**

```bash
npm publish --access public
```

- [ ] **Step 4: Create GitHub issues for v0.1.0**

Create issues for:
- Semantic versioning suggestion
- Jira/Linear ticket linking
- Slack/email announcement draft generation
- AI-powered commit summarization (LLM integration)
- Custom template documentation

- [ ] **Step 5: Close milestone**

```bash
gh api repos/UnityInFlow/ai-changelog/milestones --jq '.[0].number' | xargs -I{} gh api -X PATCH repos/UnityInFlow/ai-changelog/milestones/{} -f state=closed
```
