# ai-changelog — AI-Aware Changelog Generator

## Project Overview

**Tool 02** in the [UnityInFlow](https://github.com/UnityInFlow) ecosystem.

Generates **product changelogs** (for stakeholders) and **technical changelogs** (for devs) from agent-produced commits by parsing GSD planning files (`SUMMARY.md`, `REQUIREMENTS.md`) from git history. Nobody can read 200 agent commits and understand what shipped — this tool solves that.

**Phase:** 1 | **Stack:** TypeScript | **npm:** `@unityinflow/ai-changelog`

## Status

Waiting — `spec-linter` (Tool 01) must ship v0.0.1 to npm before development begins.

## Reference Documents

- `02-ai-changelog.md` — Feature spec, CLI commands, architecture, GSD parser design, implementation todos (Week 3 + Week 4)
- `ai-agent-ecosystem-business-analysis.md` — Ecosystem strategy, competitive landscape (GSD, RTK, Superpowers, Paperclip), market trends, KORE runtime vision, go-to-market plan

Read these before making architectural or scope decisions.

## Tooling

| Tool | Status | Usage |
|---|---|---|
| **GSD** | Installed (global) | `/gsd:new-project` to scaffold when ready. `/gsd:plan-phase` and `/gsd:execute-phase` for structured development. |
| **RTK** | Active (v0.34.2) | Automatic via hooks. Compresses vitest, tsc, git, npm output. ~80% token savings. |
| **Superpowers** | Active (v5.0.5) | Auto-triggers brainstorming, TDD, planning, code review, debugging skills. |

## Constraints

### TypeScript (inherited from ecosystem CLAUDE.md)
- Node.js >=18, ESM modules (`"type": "module"` in package.json)
- Build with `tsup`, test with `vitest`, CLI with `commander`
- Strict TypeScript: `"strict": true` in tsconfig.json
- Target `ES2022`
- Prefer named exports over default exports
- No `any` types — use `unknown` and narrow properly
- File naming: `kebab-case.ts`
- `const` everywhere, `interface` over `type` for object shapes
- `async/await` over raw promises
- Early returns over nested `if` blocks
- Comments only for non-obvious logic

### General
- Test coverage >80% on core logic before release
- No secrets committed — all credentials via environment variables
- Every lint rule / parser: at least 3 passing and 3 failing test cases
- No `console.log` debug output left in committed code

## Acceptance Criteria — v0.0.1

- [ ] `ai-changelog generate` produces product-format changelog from git history
- [ ] `ai-changelog generate --from <tag> --to HEAD` works with specific ranges
- [ ] `ai-changelog generate --output CHANGELOG.md` writes to file
- [ ] `ai-changelog publish --release <version>` pushes to GitHub Releases
- [ ] `ai-changelog init` creates `ai-changelog.config.json`
- [ ] Product and technical output formats both working
- [ ] GSD SUMMARY.md and REQUIREMENTS.md parser tested with real fixtures
- [ ] All tests pass on macOS, Linux, Windows (CI)
- [ ] Published to npm as `@unityinflow/ai-changelog`
- [ ] README with problem statement, installation, examples

## Development Workflow

When ready to build:

1. `/gsd:new-project` — describe ai-changelog, feed existing spec. Generates `.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`
2. `/gsd:discuss-phase 1` — lock in decisions for Week 3 (core parser: GSD file parser, git walker, commit matcher)
3. `/gsd:plan-phase 1` — atomic task plans with file paths
4. `/gsd:execute-phase 1` — parallel execution with fresh context windows
5. `/gsd:discuss-phase 2` — lock in decisions for Week 4 (generator, templates, CLI, GitHub Releases, npm publish)
6. `/gsd:plan-phase 2` — atomic task plans
7. `/gsd:execute-phase 2` — build and ship

Superpowers skills (TDD, code review, debugging) activate automatically during execution.

## Key Dependencies (for reference, not installed yet)

- `simple-git` — git log walking
- `handlebars` — changelog templates
- `@octokit/rest` — GitHub Releases API
- `commander` — CLI framework

---

## CI / Self-Hosted Runners

Use UnityInFlow org-level self-hosted runners. Never use `ubuntu-latest`.

```yaml
runs-on: [arc-runner-unityinflow]
```

Available runners: `hetzner-runner-1/2/3` (X64), `orangepi-runner` (ARM64).

---

## Do Not

- Do not start implementation until spec-linter v0.0.1 is published on npm
- Do not use `any` in TypeScript
- Do not commit secrets or API keys
- Do not skip writing tests
- Do not inline the reference docs into this file — read them by path
