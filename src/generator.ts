import Handlebars from "handlebars";
import { readFileSync } from "node:fs";
import { ChangeEntry, ChangelogOutput } from "./types.js";

// --- Handlebars helpers ---

Handlebars.registerHelper("eq", (a: string, b: string) => a === b);

Handlebars.registerHelper(
  "hasItems",
  (arr: unknown) => Array.isArray(arr) && arr.length > 0,
);

Handlebars.registerHelper(
  "filterByType",
  (entries: Array<{ type: string }>, type: string) =>
    entries.filter((entry) => entry.type === type),
);

// --- Built-in templates as inline strings ---
// Inlined to avoid __dirname / fileURLToPath issues in tsup bundles.
// The .hbs files in src/templates/ serve as the canonical source for editing;
// keep them in sync with these constants.

const PRODUCT_TEMPLATE = `## {{version}} — {{date}}

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
{{/if}}`;

const TECHNICAL_TEMPLATE = `## {{version}} — {{date}}

{{#each groups}}
### {{label}}
{{#each entries}}
- \`{{type}}{{#if scope}}({{scope}}){{/if}}\`: {{description}} ({{hash}})
{{/each}}
{{#if gsdSummary}}

**Decisions:** {{#each gsdSummary.decisions}}
- {{this}}
{{/each}}
**Files changed:** {{#each gsdSummary.filesChanged}}
- \`{{this}}\`
{{/each}}
{{/if}}
{{/each}}

{{#if (hasItems breaking)}}
### Breaking Changes
{{#each breaking}}
- \`{{type}}\`: {{description}} ({{hash}})
{{/each}}
{{/if}}`;

const BUILT_IN_TEMPLATES: Record<string, string> = {
  product: PRODUCT_TEMPLATE,
  technical: TECHNICAL_TEMPLATE,
};

function loadTemplate(format: "product" | "technical"): string {
  return BUILT_IN_TEMPLATES[format];
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
