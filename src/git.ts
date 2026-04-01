import { simpleGit } from "simple-git";
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

  const logOptions: Record<string, unknown> = {
    "--name-only": null,
  };

  if (range.from) {
    logOptions.from = range.from;
    logOptions.to = range.to;
  }

  const log = await git.log(logOptions);

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
