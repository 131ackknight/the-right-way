#!/usr/bin/env node
// Validates the skills, plugin manifests, and example build packs. No dependencies.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
let checks = 0;

const rel = (p) => relative(root, p) || ".";
const fail = (file, message) => errors.push(`${rel(file)}: ${message}`);
const check = (condition, file, message) => {
  checks++;
  if (!condition) fail(file, message);
};

function parseFrontmatter(file) {
  const text = readFileSync(file, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return { fields, body: text.slice(match[0].length) };
}

function relativeLinks(markdown) {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "");
  return [...withoutCode.matchAll(/\]\(([^)\s]+)\)/g)]
    .map((m) => m.at(1).split("#")[0])
    .filter((href) => href && !/^[a-z]+:/i.test(href) && !href.includes("<"));
}

function headings(markdown) {
  return [...markdown.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
}

function findFiles(dir, name, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) findFiles(full, name, out);
    else if (entry === name) out.push(full);
  }
  return out;
}

// Skills
const skillsDir = join(root, "skills");
const skillNames = readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory());
check(skillNames.length > 0, skillsDir, "no skills found");

for (const dir of skillNames) {
  const file = join(skillsDir, dir, "SKILL.md");
  check(existsSync(file), file, "missing SKILL.md");
  if (!existsSync(file)) continue;

  const parsed = parseFrontmatter(file);
  check(parsed !== null, file, "missing YAML frontmatter");
  if (!parsed) continue;
  const { name = "", description = "" } = parsed.fields;

  check(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name), file, `name "${name}" must be lowercase words joined by hyphens`);
  check(name.length <= 64, file, "name must be 64 characters or fewer");
  check(name === dir, file, `name "${name}" must match folder "${dir}"`);
  check(description.length > 0, file, "description is required");
  check(description.length <= 1024, file, `description is ${description.length} characters; max is 1024`);
  check(parsed.body.split("\n").length <= 500, file, "SKILL.md body should stay under 500 lines");

  for (const href of relativeLinks(parsed.body)) {
    check(existsSync(join(skillsDir, dir, href)), file, `broken link: ${href}`);
  }
}

// Plugin manifests
const pluginFile = join(root, ".claude-plugin", "plugin.json");
const marketplaceFile = join(root, ".claude-plugin", "marketplace.json");
const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(file, `invalid JSON: ${error.message}`);
    return null;
  }
};
const plugin = readJson(pluginFile);
const marketplace = readJson(marketplaceFile);

if (plugin && marketplace) {
  check(Boolean(marketplace.owner?.name), marketplaceFile, "owner.name is required");
  check(Array.isArray(marketplace.plugins) && marketplace.plugins.length > 0, marketplaceFile, "plugins must be a non-empty array");
  for (const entry of marketplace.plugins ?? []) {
    check(entry.name === plugin.name, marketplaceFile, `entry "${entry.name}" must match plugin.json name "${plugin.name}"`);
    if (typeof entry.source === "string") {
      check(!entry.source.includes(".."), marketplaceFile, `source "${entry.source}" must not contain ".."`);
      check(existsSync(join(root, entry.source, "skills")), marketplaceFile, `source "${entry.source}" has no skills/ folder`);
    }
  }
}

// Build packs: the templates define the required sections
const templatesDir = join(skillsDir, "the-right-way", "templates");
const required = {
  spec: headings(readFileSync(join(templatesDir, "SPEC.md"), "utf8")).filter((h) => !/^R-\d+/.test(h)),
  progress: headings(readFileSync(join(templatesDir, "PROGRESS.md"), "utf8")),
  slice: headings(readFileSync(join(templatesDir, "slice.md"), "utf8")),
};

for (const progressFile of findFiles(join(root, "examples"), "PROGRESS.md")) {
  const pack = dirname(progressFile);
  const progress = readFileSync(progressFile, "utf8");
  const specFile = join(pack, "SPEC.md");

  for (const h of required.progress) check(headings(progress).includes(h), progressFile, `missing section "## ${h}"`);

  check(existsSync(specFile), specFile, "missing SPEC.md next to PROGRESS.md");
  if (existsSync(specFile)) {
    const specHeadings = headings(readFileSync(specFile, "utf8"));
    for (const h of required.spec) check(specHeadings.includes(h), specFile, `missing section "## ${h}"`);
  }

  const briefLinks = relativeLinks(progress).filter((href) => href.startsWith("slices/"));
  check(briefLinks.length > 0, progressFile, "slices table links to no briefs");

  for (const href of briefLinks) {
    const brief = join(pack, href);
    check(existsSync(brief), progressFile, `slice brief not found: ${href}`);
    if (!existsSync(brief)) continue;
    const briefHeadings = headings(readFileSync(brief, "utf8"));
    for (const h of required.slice) check(briefHeadings.includes(h), brief, `missing section "## ${h}"`);
  }
}

if (errors.length > 0) {
  console.error(`Validation failed (${errors.length} of ${checks} checks):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`All ${checks} checks passed across ${skillNames.length} skills.`);
