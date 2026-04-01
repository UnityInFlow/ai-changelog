# ai-changelog Repo Setup Design

## Goal

Set up `02-ai-changelog/` as a development-ready repo with GSD, RTK, and Superpowers tooling so Claude Code has full context and structured workflows when implementation begins (after spec-linter v0.0.1 ships).

## Approach

**Approach B: Tooling-Ready** — repo + CLAUDE.md + GSD, no TypeScript scaffolding yet.

### What gets created

| File | Purpose |
|---|---|
| `.git/` | Git repository |
| `.gitignore` | Node/TypeScript ignores |
| `LICENSE` | MIT, Jiri Hermann |
| `CLAUDE.md` | Project-specific instructions for Claude Code |

### What already exists (unchanged)

| File | Purpose |
|---|---|
| `02-ai-changelog.md` | Feature spec, architecture, implementation todos |
| `ai-agent-ecosystem-business-analysis.md` | Ecosystem strategy, competitive landscape |

### External tooling

| Tool | Action | Scope |
|---|---|---|
| GSD | Install globally via `npx get-shit-done-cc@latest` | `~/.claude/commands/gsd/` |
| RTK | Already installed (v0.34.2) | Global, hook-based |
| Superpowers | Already installed (v5.0.5) | Global, plugin-based |

## CLAUDE.md Structure

Sections:
1. **Project Overview** — Tool 02 in UnityInFlow, what it does
2. **Status** — Waiting on spec-linter v0.0.1
3. **Reference Documents** — relative paths to both planning docs
4. **Tooling** — GSD, RTK, Superpowers status and usage
5. **Constraints** — TypeScript subset from parent CLAUDE.md (strict, ESM, no any, vitest, tsup, commander, kebab-case)
6. **Acceptance Criteria v0.0.1** — from 02-ai-changelog.md spec
7. **Development Workflow** — GSD phase mapping to spec's Week 3 and Week 4

References docs by path, does not inline content. Keeps CLAUDE.md lean.

## What this does NOT include

- No `package.json` or TypeScript config — GSD's `/gsd:new-project` handles this
- No source code directories
- No CI workflow yet
- No implementation work — blocked on spec-linter v0.0.1

## Decisions

| Decision | Rationale |
|---|---|
| GSD global install | 20-tool ecosystem, reusable across all projects |
| No TS scaffolding | Let GSD generate structure informed by spec |
| Reference docs, don't inline | Avoid context bloat, single source of truth |
| Inherit parent constraints | Don't duplicate, just reference the TypeScript subset |
