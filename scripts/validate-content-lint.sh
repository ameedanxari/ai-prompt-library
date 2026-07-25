#!/usr/bin/env bash
# Validate user-visible surface copy in application source against the
# project's content-lint config (banned surface terms, identifier-derived
# display names, fixture data reaching UI source, duplicate keyboard
# shortcuts) and cross-check the content inventory against the content
# model. Companion to prompts/orchestrators/content-system.md.
#
# Usage: validate-content-lint.sh [outputs-dir] [app-root]
#   outputs-dir  default prompts/outputs/current
#   app-root     default . (the application repository root)
#
# Exit codes: 0 pass / not-applicable, 1 blocking findings, 2 prerequisite error.

set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"
APP_DIR="${2:-.}"
CONFIG="$TARGET_DIR/content-lint.config.json"
CONTENT_SYSTEM="$TARGET_DIR/content-system.md"
INVENTORY="$TARGET_DIR/content-inventory.json"
REPORT="$TARGET_DIR/content-lint-report.json"

resolve_script_dir() {
  local source="${BASH_SOURCE[0]}"
  while [ -L "$source" ]; do
    local dir target
    dir="$(cd -P "$(dirname "$source")" && pwd)"
    target="$(readlink "$source")"
    case "$target" in
      /*) source="$target" ;;
      *) source="$dir/$target" ;;
    esac
  done
  cd -P "$(dirname "$source")" && pwd
}

SCRIPT_DIR="$(resolve_script_dir)"
# shellcheck source=scripts/lib/toolchain.sh
source "$SCRIPT_DIR/lib/toolchain.sh"

if [ ! -d "$TARGET_DIR" ]; then
  echo "content-lint prerequisite error: target directory does not exist: $TARGET_DIR" >&2
  exit 2
fi
if [ ! -d "$APP_DIR" ]; then
  echo "content-lint prerequisite error: app root does not exist: $APP_DIR" >&2
  exit 2
fi
if ! require_tool node resolve_node; then
  exit 2
fi

produce_report() {
  local temporary="$1"
  "$RESOLVED_NODE" - "$CONFIG" "$CONTENT_SYSTEM" "$INVENTORY" "$APP_DIR" "$temporary" <<'NODE'
const fs = require('node:fs');
const path = require('node:path');

const [configPath, contentSystemPath, inventoryPath, appRoot, reportPath] = process.argv.slice(2);
const issues = [];
const warnings = [];
const hasConfig = fs.existsSync(configPath);
const hasContentSystem = fs.existsSync(contentSystemPath);

const finish = (status, applicable, reason, stats = {}) => {
  fs.writeFileSync(reportPath, JSON.stringify({
    schemaVersion: 1,
    generatedBy: 'scripts/validate-content-lint.sh',
    generatedAt: new Date().toISOString(),
    status,
    applicable,
    reason,
    stats,
    issues,
    warnings,
  }, null, 2) + '\n');
  process.exit(0);
};

// The gate must never silently turn itself off when the project HAS a
// content system: a missing half of the pair is a failure, not
// not-applicable (lesson from the fixture-isolation self-disable).
if (!hasConfig && !hasContentSystem) {
  finish('not-applicable', false, 'no content-system.md or content-lint.config.json in the outputs directory');
}
if (hasContentSystem && !hasConfig) {
  issues.push({ code: 'missing-config', file: path.basename(configPath), message: 'content-system.md exists but content-lint.config.json is missing; the lint cannot be skipped for a project with a content system.' });
  finish('fail', true, 'content-lint config missing');
}
if (hasConfig && !hasContentSystem) {
  issues.push({ code: 'missing-content-system', file: path.basename(contentSystemPath), message: 'content-lint.config.json exists but content-system.md is missing.' });
  finish('fail', true, 'content-system artifact missing');
}

let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error(`content-lint prerequisite error: unreadable config: ${error.message}`);
  process.exit(2);
}

const contentSystem = fs.readFileSync(contentSystemPath, 'utf8');
const list = (input) => Array.isArray(input) ? input : [];
const DEFAULT_EXCLUDES = ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/.next/**', '**/.open-next/**', '**/coverage/**', '**/__pycache__/**'];
const uiGlobs = list(config.uiSourceGlobs).map(String);
const excludeGlobs = [...list(config.excludeGlobs).map(String), ...DEFAULT_EXCLUDES];
const bannedTerms = list(config.bannedSurfaceTerms)
  .map((entry) => typeof entry === 'string' ? { term: entry, reason: '', allowedContexts: [] } : entry)
  .filter((entry) => entry && typeof entry.term === 'string' && entry.term.trim());
const identifierPatterns = list(config.identifierDerivedNamePatterns).map(String);
if (identifierPatterns.length === 0) identifierPatterns.push('slice\\s*\\(\\s*0\\s*,\\s*\\d+\\s*\\)', 'substring\\s*\\(\\s*0\\s*,\\s*\\d+\\s*\\)');
const fixtureMarkers = [...list(config.fixtureMarkerPatterns).map(String), '@[a-z0-9.-]+\\.test\\b', '00000000-0000-4000'];
const shortcutPattern = new RegExp(String(config.shortcutPattern || '(?:symbol|shortcut|hotkey|accesskey)\\s*[:=]\\s*["\'`]([A-Za-z0-9])["\'`]'), 'gi');

if (uiGlobs.length === 0) {
  issues.push({ code: 'empty-ui-source-globs', file: path.basename(configPath), message: 'uiSourceGlobs is empty; the lint has no surface to scan.' });
}

const globToRegExp = (glob) => {
  let pattern = '';
  for (let index = 0; index < glob.length; index += 1) {
    const character = glob[index];
    if (character === '*') {
      if (glob[index + 1] === '*') {
        pattern += '.*';
        index += 1;
        if (glob[index + 1] === '/') index += 1;
      } else {
        pattern += '[^/]*';
      }
    } else if (character === '?') {
      pattern += '[^/]';
    } else {
      pattern += character.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${pattern}$`);
};
const uiMatchers = uiGlobs.map(globToRegExp);
const excludeMatchers = excludeGlobs.map(globToRegExp);
const matchesAny = (matchers, relative) => matchers.some((matcher) => matcher.test(relative));

const files = [];
const walk = (directory) => {
  let entries;
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(appRoot, absolute).split(path.sep).join('/');
    if (matchesAny(excludeMatchers, relative) || matchesAny(excludeMatchers, `${relative}/`)) continue;
    if (entry.isDirectory()) {
      walk(absolute);
    } else if (entry.isFile() && matchesAny(uiMatchers, relative)) {
      files.push({ absolute, relative });
    }
  }
};
walk(appRoot);

const MARKUP_EXTENSIONS = new Set(['.tsx', '.jsx', '.html', '.vue', '.svelte']);
// User-visible spans on a line: quoted string bodies plus, for
// markup-capable files, JSX/HTML text nodes (text between > and <).
const HEADER_TOKEN_LITERAL = /^[A-Z][A-Za-z0-9]*(?:-[A-Z0-9][A-Za-z0-9]*)+$/;
const scannableSpans = (line, markup) => {
  const spans = [];
  // A comment line is never user-visible copy. Multiword terms already strip
  // comments before matching; doing it here extends the same rule to
  // single-word terms, whose backtick-quoted identifiers in JSDoc
  // (`idempotencyKey`) would otherwise read as a quoted string.
  if (/^\s*(?:\/\/|\/\*|\*\/|\*(?!\/))/.test(line)) return spans;
  const quoted = line.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/g);
  // Template-literal interpolation source (`${candidate.canonicalName}`)
  // is code, not user-visible copy — scan only the literal text around it.
  for (const match of quoted) {
    const body = match[2].replace(/\$\{[^}]*\}/g, ' ');
    // A quoted literal in canonical HTTP-header casing ("Idempotency-Key",
    // "X-Correlation-ID") is a wire identifier, not prose. Requiring each
    // segment to start uppercase keeps lowercase hyphenated copy — including
    // banned terms like "server-owned" — fully checked.
    if (HEADER_TOKEN_LITERAL.test(body.trim())) continue;
    spans.push(body);
  }
  if (markup) {
    for (const match of line.matchAll(/>([^<>{}]+)</g)) spans.push(match[1]);
    const trailing = line.match(/>\s*([^<>{}"'`]+)\s*$/);
    if (trailing) spans.push(trailing[1]);
    const leading = line.match(/^\s*([^<>{}"'`=;]+?)\s*</);
    if (leading && !/^[\s/]*$/.test(leading[1]) && !/^(import|export|const|let|var|return|function|type|interface)\b/.test(leading[1].trim())) spans.push(leading[1]);
  }
  return spans;
};
const termRegExp = (term) => new RegExp(term.split(/\s+/).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+'), 'i');
// Multiword terms scan whole markup lines (JSX text is unquoted), but code
// comments are not user-visible copy — strip them first. "//" after
// whitespace or at line start is a comment; "://" in URLs is not.
const stripComments = (line) => line
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
  .replace(/^\s*(?:\/\/|\/?\*).*$/, ' ')
  .replace(/(^|\s)\/\/.*$/, '$1');
const identifierRegs = identifierPatterns.map((pattern) => new RegExp(pattern));
const fixtureRegs = fixtureMarkers.map((pattern) => new RegExp(pattern, 'i'));
const shortcutsByFile = new Map();
const shortcutsGlobal = new Map();

for (const file of files) {
  let text;
  try {
    text = fs.readFileSync(file.absolute, 'utf8');
  } catch {
    continue;
  }
  const markup = MARKUP_EXTENSIONS.has(path.extname(file.relative).toLowerCase());
  const lines = text.split(/\r?\n/);
  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const spans = scannableSpans(line, markup);
    const spanText = spans.join(' ␟ ');
    for (const banned of bannedTerms) {
      const allowed = list(banned.allowedContexts).map(globToRegExp);
      if (allowed.length > 0 && matchesAny(allowed, file.relative)) continue;
      const regExp = termRegExp(banned.term);
      const multiword = /\s/.test(banned.term.trim());
      const haystack = multiword ? `${spanText} ${markup ? stripComments(line) : ''}` : spanText;
      if (haystack && regExp.test(haystack)) {
        issues.push({ code: 'banned-surface-term', file: file.relative, line: lineNumber, term: banned.term, message: `Banned surface term "${banned.term}" in user-visible copy${banned.reason ? ` (${banned.reason})` : ''}.` });
      }
    }
    for (const marker of fixtureRegs) {
      if (spanText && marker.test(spanText)) {
        issues.push({ code: 'fixture-data-in-ui-source', file: file.relative, line: lineNumber, message: `Fixture marker ${marker.source} appears in UI source outside excluded fixture paths.` });
        break;
      }
    }
    for (const identifier of identifierRegs) {
      if (identifier.test(line)) {
        const interpolates = /\$\{|`.*\+|" \+|' \+|f["']/.test(line);
        const names = /name|title|label|heading/i.test(line);
        if (interpolates && names) {
          issues.push({ code: 'identifier-derived-display-name', file: file.relative, line: lineNumber, message: 'Display name appears to be derived from an identifier fragment; display names must come from captured or generated human names.' });
        } else {
          warnings.push({ code: 'identifier-slice-review', file: file.relative, line: lineNumber, message: 'Identifier truncation pattern found; verify it is not rendered as a display name.' });
        }
        break;
      }
    }
    for (const match of line.matchAll(shortcutPattern)) {
      const key = match[1].toUpperCase();
      const perFile = shortcutsByFile.get(file.relative) ?? new Map();
      shortcutsByFile.set(file.relative, perFile);
      perFile.set(key, [...(perFile.get(key) ?? []), lineNumber]);
      shortcutsGlobal.set(key, [...(shortcutsGlobal.get(key) ?? []), `${file.relative}:${lineNumber}`]);
    }
  });
}

for (const [file, perFile] of shortcutsByFile) {
  for (const [key, lineNumbers] of perFile) {
    if (lineNumbers.length > 1) {
      issues.push({ code: 'duplicate-shortcut', file, line: lineNumbers[0], message: `Keyboard shortcut "${key}" is declared ${lineNumbers.length} times in one surface (lines ${lineNumbers.join(', ')}).` });
    }
  }
}
for (const [key, locations] of shortcutsGlobal) {
  const distinctFiles = new Set(locations.map((location) => location.split(':')[0]));
  if (distinctFiles.size > 1) {
    warnings.push({ code: 'cross-file-shortcut-review', message: `Shortcut "${key}" is declared in multiple files (${locations.join('; ')}); verify the scopes do not overlap.` });
  }
}

// Content-inventory cross-check: the build must account for its strings.
const modelStringIds = new Set([...contentSystem.matchAll(/\bSTR-[A-Z0-9-]+\b/g)].map((match) => match[0]));
if (!fs.existsSync(inventoryPath)) {
  issues.push({ code: 'missing-content-inventory', file: path.basename(inventoryPath), message: 'content-inventory.json is missing; builds with a content system must emit their string table with provenance.' });
} else {
  let inventory;
  try {
    inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  } catch (error) {
    inventory = null;
    issues.push({ code: 'invalid-content-inventory', file: path.basename(inventoryPath), message: `content-inventory.json is not valid JSON: ${error.message}` });
  }
  const entries = list(inventory?.entries);
  if (inventory && entries.length === 0) {
    issues.push({ code: 'empty-content-inventory', file: path.basename(inventoryPath), message: 'content-inventory.json has no entries; a UI build always ships strings.' });
  }
  const headingCopy = new Map();
  for (const entry of entries) {
    const stringId = String(entry?.stringId || '');
    if (!stringId || !modelStringIds.has(stringId)) {
      issues.push({ code: 'unknown-string-id', file: String(entry?.file || path.basename(inventoryPath)), line: entry?.line, message: `Inventory entry ${stringId || '<missing id>'} has no matching String ID in content-system.md.` });
    }
    if (String(entry?.element || '').toLowerCase() === 'heading') {
      const key = `${String(entry?.screen || '')}␟${String(entry?.copy || '').trim().toLowerCase()}`;
      const seen = headingCopy.get(key);
      if (seen) {
        issues.push({ code: 'duplicate-heading', file: String(entry?.file || ''), line: entry?.line, message: `Heading copy duplicated on screen "${entry?.screen}" (also ${seen}).` });
      } else if (String(entry?.copy || '').trim()) {
        headingCopy.set(key, `${entry?.file}:${entry?.line}`);
      }
    }
  }
}

issues.sort((a, b) => `${a.file}:${a.code}:${a.line ?? 0}`.localeCompare(`${b.file}:${b.code}:${b.line ?? 0}`));
finish(issues.length === 0 ? 'pass' : 'fail', true,
  issues.length === 0 ? 'surface copy passes the content lint' : 'blocking content-lint findings',
  { filesScanned: files.length, bannedTermCount: bannedTerms.length });
NODE
}

if ! write_atomic_report "$REPORT" produce_report; then
  echo "content-lint report error: $ATOMIC_REPORT_STATUS" >&2
  exit 2
fi

report_status="$("$RESOLVED_NODE" -e 'const fs=require("node:fs"); process.stdout.write(JSON.parse(fs.readFileSync(process.argv[1], "utf8")).status)' "$REPORT")"
issue_count="$("$RESOLVED_NODE" -e 'const fs=require("node:fs"); process.stdout.write(String(JSON.parse(fs.readFileSync(process.argv[1], "utf8")).issues.length))' "$REPORT")"
warning_count="$("$RESOLVED_NODE" -e 'const fs=require("node:fs"); process.stdout.write(String(JSON.parse(fs.readFileSync(process.argv[1], "utf8")).warnings.length))' "$REPORT")"
echo "Content-lint report: $REPORT (status=$report_status, issues=$issue_count, warnings=$warning_count)"
case "$report_status" in
  pass)
    echo "✅ content-lint gate: pass"
    exit 0
    ;;
  not-applicable)
    echo "ℹ️  content-lint gate: not applicable — no content system declared"
    exit 0
    ;;
  *)
    "$RESOLVED_NODE" -e 'const fs=require("node:fs"); for (const issue of JSON.parse(fs.readFileSync(process.argv[1], "utf8")).issues.slice(0, 40)) console.log(`  - ${issue.code} [${issue.file}${issue.line ? `:${issue.line}` : ""}]: ${issue.message}`)' "$REPORT"
    echo "❌ content-lint gate: fail"
    exit 1
    ;;
esac
