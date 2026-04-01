# ADR-001: Tech Stack for ai-changelog

**Status:** Accepted
**Date:** 2026-04-01

## Context
ai-changelog generates changelogs from git history and GSD planning files. Needs git walking, markdown parsing, template rendering, GitHub Releases API.

## Decision
- TypeScript strict, ES2022, ESM
- tsup (build), vitest (test), commander (CLI)
- simple-git for git operations
- handlebars for templates (logic-less, customizable)
- @octokit/rest for GitHub Releases
- No LLM calls in v0.0.1

## Alternatives Considered
- isomorphic-git — less mature, worse Windows support
- EJS — too powerful (XSS risk), mustache — too limited
- marked/remark for GSD parsing — overkill for predictable structure

## Consequences
- 4 runtime deps (commander, simple-git, handlebars, @octokit/rest)
- Git must be installed on host
- Users can customize templates with own .hbs files
- GitHub Releases needs GITHUB_TOKEN env var
