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
