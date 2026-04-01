import { Command } from "commander";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { getCommitRange, getTagList } from "./git.js";
import { parseGsdSummary } from "./parsers/gsd-summary.js";
import { matchCommitsToPhases } from "./matcher.js";
import { generateChangelog } from "./generator.js";
import { loadConfig, initConfig } from "./config.js";
import { createGithubRelease } from "./github.js";
import {
  ChangeEntry,
  ChangelogGroup,
  ChangelogOutput,
  GsdSummary,
} from "./types.js";

const TYPE_LABELS: Record<string, string> = {
  feat: "New Features",
  fix: "Bug Fixes",
  docs: "Documentation",
  refactor: "Refactoring",
  test: "Testing",
  chore: "Maintenance",
  other: "Other Changes",
};

export function groupByCommitType(commits: ChangeEntry[]): ChangelogGroup[] {
  const groups = new Map<string, ChangelogGroup>();
  for (const commit of commits) {
    const key = commit.type;
    if (!groups.has(key)) {
      groups.set(key, {
        label: TYPE_LABELS[key] ?? "Other Changes",
        entries: [],
      });
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
  .action(
    async (options: {
      from?: string;
      to: string;
      format: string;
      output?: string;
    }) => {
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
        console.warn(
          "No GSD files found, grouping by commit type. Use GSD for richer changelogs.",
        );
      }
      const groups =
        summaries.length > 0
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
        const existing = existsSync(outputPath)
          ? readFileSync(outputPath, "utf-8")
          : "";
        const combined = existing ? rendered + "\n" + existing : rendered;
        writeFileSync(outputPath, combined);
        console.log(`Changelog written to ${options.output}`);
      } else {
        console.log(rendered);
      }
    },
  );

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
    if (summaries.length === 0) {
      console.warn(
        "No GSD files found, grouping by commit type. Use GSD for richer changelogs.",
      );
    }
    const groups =
      summaries.length > 0
        ? matchCommitsToPhases(commits, summaries)
        : groupByCommitType(commits);

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
