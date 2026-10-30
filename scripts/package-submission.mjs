#!/usr/bin/env node
// npm run package — builds submission/<world-id>-<version>-submission.zip from this repository.
//
// 1. Validates world.yaml with the installed superwork CLI and stops if it is not ready.
// 2. Collects a fixed allowlist of files (nothing else is ever included).
// 3. Stops if a file looks like it holds a secret (keys, tokens, passwords).
// 4. Writes SUBMISSION.json (who, which World, which tools, per-file sha256) into the ZIP.
// 5. Writes a store-only ZIP with sorted entries and a fixed timestamp: the same files always give the same ZIP bytes.
//
// No dependencies besides the superwork CLI already in package.json. Nothing is uploaded anywhere.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const ROOT = process.cwd();
const fail = (msg) => { console.error(`\n✗ ${msg}\n`); process.exit(1); };

// ── 1. validation through the installed CLI ─────────────────────────────────
let cliBin, cliVersion, specVersion;
try {
  const cliDir = join(ROOT, "node_modules", "@superwork", "cli"), specDir = join(ROOT, "node_modules", "@superwork", "world-spec");
  const pkg = JSON.parse(readFileSync(join(cliDir, "package.json"), "utf8"));
  cliVersion = pkg.version;
  cliBin = join(cliDir, typeof pkg.bin === "string" ? pkg.bin : pkg.bin.superwork);
  specVersion = JSON.parse(readFileSync(join(specDir, "package.json"), "utf8")).version;
} catch { fail("The superwork CLI is not installed. Run: npm install"); }

if (!existsSync(join(ROOT, "world.yaml"))) fail("world.yaml is missing. It must stay at the repository root.");
const run = (args) => spawnSync(process.execPath, [cliBin, ...args], { cwd: ROOT, encoding: "utf8" });

const summary = run(["validate", "world.yaml", "--summary"]);
const summaryText = (summary.stdout ?? "").trim();
if (summary.status !== 0) {
  console.error(summaryText);
  console.error((run(["validate", "world.yaml"]).stdout ?? "").trim());
  fail("world.yaml does not validate. Fix the World (npm run validate), then package again.");
}
const tmp = mkdtempSync(join(tmpdir(), "superwork-package-"));
let exported;
try {
  const ex = run(["export", "world.yaml", "--out", tmp]);
  if (ex.status !== 0) fail(`superwork export failed:\n${ex.stdout}${ex.stderr}`);
  exported = JSON.parse(readFileSync(join(tmp, "summary.json"), "utf8"));
} finally { rmSync(tmp, { recursive: true, force: true }); }
if (exported.ready !== true) fail("superwork export reports the World is not ready.");
const worldId = String(exported.world), worldVersion = String(exported.version);
if (worldId === "my-world") fail("world.id is still the template value 'my-world'. Give your World its own id (for example procurement-approval).");
if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(worldId)) fail(`world.id '${worldId}' must use lowercase letters, digits and hyphens.`);
if (!/^[0-9A-Za-z.+-]{1,32}$/.test(worldVersion)) fail(`world.version '${worldVersion}' is not a simple version like 0.2.0.`);

// ── 2. who is submitting ────────────────────────────────────────────────────
let info;
try { info = JSON.parse(readFileSync(join(ROOT, "submission-info.json"), "utf8")); }
catch { fail("submission-info.json is missing or is not valid JSON."); }
const participant = String(info.participant ?? "").trim(), github = String(info.github ?? "").trim();
if (!participant) fail("Fill in your name in submission-info.json (\"participant\").");
const aiAssistedReview = String(info.aiAssistedReview ?? "").trim().toLowerCase();
if (!["yes", "no"].includes(aiAssistedReview)) fail("Answer \"aiAssistedReview\" in submission-info.json with \"yes\" or \"no\" (README, section 5).");

// ── 3. the allowlist ────────────────────────────────────────────────────────
const ROOT_FILES = ["world.yaml", "seed.yaml", "README.md", "SUBMISSION.md", ".superwork/schema-version"];
const DIRS = ["scenarios", "assignment", "evidence"];
const EXTENSIONS = /\.(ya?ml|md|txt|json|csv|png|jpe?g|svg)$/i;
const SKIP = new Set(["node_modules", ".git", "dist", "submission"]);
const MAX_FILE = 5 * 1024 * 1024;

const files = [];
for (const f of ROOT_FILES) if (existsSync(join(ROOT, f))) files.push(f);
const walk = (dir) => {
  for (const name of readdirSync(join(ROOT, dir))) {
    const rel = `${dir}/${name}`, st = statSync(join(ROOT, rel));
    if (name.startsWith(".") || SKIP.has(name)) continue;
    if (st.isDirectory()) walk(rel);
    else if (st.isFile() && EXTENSIONS.test(name)) files.push(rel);
  }
};
for (const d of DIRS) if (existsSync(join(ROOT, d))) walk(d);
files.sort();
if (!files.includes("seed.yaml")) console.warn("! seed.yaml is missing: your scenarios have no starting records.");

// ── 4. secret-shaped content stops the packaging ────────────────────────────
const SECRET = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a private key"],
  [/\bAKIA[0-9A-Z]{16}\b/, "an AWS access key"],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}\b/, "a GitHub token"],
  [/\bxox[abpr]-[A-Za-z0-9-]{10,}/, "a Slack token"],
  [/\bsk-(ant-)?[A-Za-z0-9_-]{20,}/, "an API key"],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, "a Google API key"],
  [/(password|passwd|secret|api[_-]?key|access[_-]?token)\s*[:=]\s*["']?[^\s"']{8,}/i, "a password or key assignment"],
];
const entries = [];
for (const f of files) {
  const buf = readFileSync(join(ROOT, f));
  if (buf.length > MAX_FILE) fail(`${f} is larger than 5 MB. Keep evidence small (screenshots, text).`);
  if (/\.(ya?ml|md|txt|json|csv|svg)$/i.test(f)) {
    const text = buf.toString("utf8");
    for (const [re, what] of SECRET) if (re.test(text)) fail(`${f} looks like it contains ${what}. Remove it (and rotate it if it was real), then package again.`);
  }
  entries.push({ path: f.split(sep).join("/"), data: buf, sha256: createHash("sha256").update(buf).digest("hex") });
}

// ── 5. manifest ─────────────────────────────────────────────────────────────
const lineOf = (label) => (summaryText.match(new RegExp(`^${label}\\s+(PASS|FAIL\\S*)\\s*$`, "m")) ?? [])[1] ?? null;
const manifest = {
  format: "superwork-starter-submission/1",
  participant,
  github: github || null,
  aiAssistedReview: aiAssistedReview,
  world: { id: worldId, version: worldVersion, spec: String(exported.spec) },
  counts: { entities: exported.entities, states: exported.states, transitions: exported.transitions, constraints: exported.constraints },
  validation: { tool: `@superwork/cli ${cliVersion}`, worldSpec: `@superwork/world-spec ${specVersion}`, ready: true, warnings: exported.warnings,
    checks: { schema: lineOf("Schema"), references: lineOf("References"), transitions: lineOf("Transitions"), constraints: lineOf("Constraints") } },
  note: "Validation shows the World follows the language. It does not show the rules are right; the scenarios are your desk-check predictions.",
  files: entries.map((e) => ({ path: e.path, bytes: e.data.length, sha256: e.sha256 })),
};
const manifestBuf = Buffer.from(JSON.stringify(manifest, null, 2) + "\n", "utf8");
const summaryBuf = Buffer.from(summaryText + "\n", "utf8");
const all = [
  ...entries.map((e) => ({ path: e.path, data: e.data })),
  { path: "SUBMISSION.json", data: manifestBuf },
  { path: "validation-summary.txt", data: summaryBuf },
].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

// ── 6. deterministic store-only ZIP ─────────────────────────────────────────
const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const DOS_TIME = 0, DOS_DATE = (2026 - 1980) << 9 | 1 << 5 | 1; // 2026-01-01 00:00:00, fixed for every entry
const top = `${worldId}-${worldVersion}`;
const local = [], central = [];
let offset = 0;
for (const e of all) {
  const name = Buffer.from(`${top}/${e.path}`, "utf8"), crc = crc32(e.data), size = e.data.length;
  const h = Buffer.alloc(30);
  h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt16LE(0, 8);
  h.writeUInt16LE(DOS_TIME, 10); h.writeUInt16LE(DOS_DATE, 12); h.writeUInt32LE(crc, 14); h.writeUInt32LE(size, 18); h.writeUInt32LE(size, 22);
  h.writeUInt16LE(name.length, 26); h.writeUInt16LE(0, 28);
  local.push(h, name, e.data);
  const c = Buffer.alloc(46);
  c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(0x031e, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(0, 10);
  c.writeUInt16LE(DOS_TIME, 12); c.writeUInt16LE(DOS_DATE, 14); c.writeUInt32LE(crc, 16); c.writeUInt32LE(size, 20); c.writeUInt32LE(size, 24);
  c.writeUInt16LE(name.length, 28); c.writeUInt16LE(0, 30); c.writeUInt16LE(0, 32); c.writeUInt16LE(0, 34); c.writeUInt16LE(0, 36);
  c.writeUInt32LE((0o100644 << 16) >>> 0, 38); c.writeUInt32LE(offset, 42);
  central.push(c, name);
  offset += 30 + name.length + size;
}
const cdSize = central.reduce((n, b) => n + b.length, 0);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(all.length, 8); end.writeUInt16LE(all.length, 10);
end.writeUInt32LE(cdSize, 12); end.writeUInt32LE(offset, 16);
const zip = Buffer.concat([...local, ...central, end]);

mkdirSync(join(ROOT, "submission"), { recursive: true });
const out = join(ROOT, "submission", `${top}-submission.zip`);
writeFileSync(out, zip);
writeFileSync(join(ROOT, "submission", "SUBMISSION.json"), manifestBuf);
const digest = createHash("sha256").update(zip).digest("hex");

console.log(summaryText);
console.log(`\n✓ Submission packaged\n`);
console.log(`  World        ${worldId} ${worldVersion}`);
console.log(`  Participant  ${participant}${github ? ` (@${github.replace(/^@/, "")})` : ""}`);
console.log(`  AI-assisted  ${aiAssistedReview}`);
console.log(`  Files        ${entries.length} (+ SUBMISSION.json, validation-summary.txt)`);
console.log(`  ZIP          ${relative(ROOT, out)}`);
console.log(`  SHA-256      ${digest}`);
console.log(`\nSend this ZIP through the submission link your instructor gives you.`);
