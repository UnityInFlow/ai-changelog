import { GsdRequirements } from "../types.js";

export function parseRequirements(content: string): GsdRequirements {
  const phases: GsdRequirements["phases"] = [];
  const allFeatures: string[] = [];
  const acceptanceCriteria: string[] = [];

  const lines = content.split("\n");
  let currentPhase: {
    number: number;
    name: string;
    features: string[];
  } | null = null;
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
