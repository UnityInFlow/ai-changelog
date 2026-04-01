import { GsdSummary } from "../types.js";

const SECTION_HEADERS: Record<
  keyof Omit<GsdSummary, "phase" | "planNumber">,
  string
> = {
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
    specRequirements: extractListItems(
      content,
      SECTION_HEADERS.specRequirements,
    ),
  };
}
