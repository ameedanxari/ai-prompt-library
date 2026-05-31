#!/usr/bin/env bash
# validate-design-system-review-artifact.sh — validate the static HTML
# design-system review artifact created during execution.
#
# Usage:
#   bash scripts/validate-design-system-review-artifact.sh [project-root-or-html-path] [source-map]
#
# If a directory is passed, validates:
#   <directory>/docs/design-system/review/index.html
#
# Exit codes:
#   0  artifact satisfies the review contract
#   1  artifact exists but violates the contract
#   2  preconditions missing

set -uo pipefail

TARGET="${1:-.}"
SOURCE_MAP="${2:-}"
if [ -d "$TARGET" ]; then
  HTML="$TARGET/docs/design-system/review/index.html"
  if [ -z "$SOURCE_MAP" ] && [ -f "$TARGET/prompts/outputs/current/ui-reference-source-map.md" ]; then
    SOURCE_MAP="$TARGET/prompts/outputs/current/ui-reference-source-map.md"
  fi
else
  HTML="$TARGET"
  if [ -z "$SOURCE_MAP" ]; then
    HTML_DIR="$(cd "$(dirname "$HTML")" 2>/dev/null && pwd)"
    if [ -n "$HTML_DIR" ]; then
      PROJECT_ROOT="$(cd "$HTML_DIR/../../.." 2>/dev/null && pwd)"
      if [ -f "$PROJECT_ROOT/prompts/outputs/current/ui-reference-source-map.md" ]; then
        SOURCE_MAP="$PROJECT_ROOT/prompts/outputs/current/ui-reference-source-map.md"
      fi
    fi
  fi
fi

if [ ! -f "$HTML" ]; then
  echo "❌ design-system review artifact not found: $HTML" >&2
  exit 2
fi

if [ -n "$SOURCE_MAP" ] && [ ! -f "$SOURCE_MAP" ]; then
  echo "❌ UI reference source map not found: $SOURCE_MAP" >&2
  exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found — required for HTML artifact validation" >&2
  exit 2
fi

python3 - "$HTML" "$SOURCE_MAP" <<'PY'
import html
import re
import sys
from pathlib import Path

html_path = Path(sys.argv[1])
source_map_arg = sys.argv[2] if len(sys.argv) > 2 else ""
source_map_path = Path(source_map_arg) if source_map_arg else None
raw = html_path.read_text(encoding="utf-8", errors="replace")
lower_raw = raw.lower()

text = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", " ", raw, flags=re.IGNORECASE | re.DOTALL)
text = re.sub(r"<[^>]+>", " ", text)
text = html.unescape(text)
text = re.sub(r"\s+", " ", text).strip()
lower_text = text.lower()
normalised_text = re.sub(r"[^a-z0-9]+", " ", lower_text).strip()


def has(pattern: str) -> bool:
    return re.search(pattern, lower_text, re.IGNORECASE) is not None


def raw_has(pattern: str) -> bool:
    return re.search(pattern, lower_raw, re.IGNORECASE | re.DOTALL) is not None


def missing_terms(label: str, terms: list[tuple[str, str]]) -> list[str]:
    return [name for name, pattern in terms if not has(pattern)]


def normalise_heading(raw_value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", raw_value.lower()).strip()


def normalise_value(raw_value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", raw_value.lower()).strip()


def split_row(raw_row: str) -> list[str]:
    trimmed = raw_row.strip()
    if trimmed.startswith("|"):
        trimmed = trimmed[1:]
    if trimmed.endswith("|"):
        trimmed = trimmed[:-1]

    cells: list[str] = []
    current: list[str] = []
    escaped = False
    for char in trimmed:
        if escaped:
            current.append(char)
            escaped = False
            continue
        if char == "\\":
            escaped = True
            continue
        if char == "|":
            cells.append("".join(current).strip())
            current = []
            continue
        current.append(char)
    if escaped:
        current.append("\\")
    cells.append("".join(current).strip())
    return cells


def table_for_section(markdown: str, section_name: str) -> tuple[list[str], list[dict[str, str]]]:
    wanted = normalise_heading(section_name)
    current = ""
    table_lines: list[str] = []

    for line in markdown.splitlines():
        if line.startswith("## "):
            current = normalise_heading(line.replace("##", "", 1))
            continue
        if current == wanted and line.strip().startswith("|"):
            table_lines.append(line)

    if len(table_lines) < 2:
        return [], []

    header = split_row(table_lines[0])
    rows: list[dict[str, str]] = []
    for raw_row in table_lines[2:]:
        cells = split_row(raw_row)
        if not any(cells):
            continue
        padded = cells + [""] * max(0, len(header) - len(cells))
        rows.append(dict(zip(header, padded[:len(header)])))
    return header, rows


def split_tokens(raw_value: str) -> list[str]:
    values = [part.strip() for part in re.split(r",|;", raw_value) if part.strip()]
    return [value for value in values if value.lower() not in {"n/a", "none"}]


def require_source_value(issues: list[str], label: str, value: str, row_id: str) -> None:
    cleaned = normalise_value(value)
    if not cleaned:
        return
    if cleaned not in normalised_text:
        issues.append(f"source-map row {row_id} missing {label}: {value}")


issues: list[str] = []

if re.search(r"\{\{[^}]+\}\}|<TBD>|\[project name\]", raw, re.IGNORECASE):
    issues.append("artifact still contains template placeholder text")

external_render_assets = [
    r"<script\b[^>]+\bsrc=[\"']https?://",
    r"<link\b[^>]+\bhref=[\"']https?://",
    r"<img\b[^>]+\bsrc=[\"']https?://",
    r"@import\s+url\([\"']?https?://",
    r"\bfetch\([\"']https?://",
]
if any(raw_has(pattern) for pattern in external_render_assets):
    issues.append("artifact uses external render-time assets; keep the review HTML self-contained")

section_count = len(re.findall(r"<section\b", raw, flags=re.IGNORECASE))
if section_count < 8:
    issues.append("artifact must render the review as at least 8 explicit <section> blocks")

if not raw_has(r"<table\b[\s\S]*?</table>"):
    issues.append("reference evidence panel must render as an HTML table")

if not raw_has(r"class=[\"'][^\"']*\bswatch\b"):
    issues.append("token swatches must include visible swatch elements")

if not raw_has(r"class=[\"'][^\"']*\bcomponent-card\b"):
    issues.append("component gallery must include component-card examples")

state_example_count = len(re.findall(r"class=[\"'][^\"']*\bstate\b", raw, flags=re.IGNORECASE))
if state_example_count < 6:
    issues.append("state matrix must render at least 6 explicit state examples")

feedback_item_count = len(re.findall(r"<li\b", raw, flags=re.IGNORECASE))
if feedback_item_count < 5:
    issues.append("feedback checklist must render at least 5 checklist items")

sections = [
    ("design direction summary", r"design direction|design summary|visual direction"),
    ("reference evidence panel", r"reference evidence|reference panel|source evidence"),
    ("token swatches", r"token swatches|design tokens|semantic aliases"),
    ("component gallery", r"component gallery|component catalog|component library"),
    ("state matrix", r"state matrix|component states|states affected"),
    ("responsive previews", r"responsive previews|responsive preview|viewport previews"),
    ("accessibility notes", r"accessibility notes|accessibility guardrails|a11y notes"),
    ("feedback checklist", r"feedback checklist|review checklist|user review checklist"),
]
for label, pattern in sections:
    if not has(pattern):
        issues.append(f"missing required section: {label}")

design_terms = missing_terms("design direction", [
    ("product surface", r"product surface|primary surface|surface"),
    ("density", r"density"),
    ("navigation model", r"navigation model|navigation"),
    ("style authority", r"style authority|existing style authority|theme authority"),
    ("redesign status", r"redesign|rebrand"),
])
for term in design_terms:
    issues.append(f"design direction summary missing {term}")

reference_terms = missing_terms("reference evidence", [
    ("source type", r"source type"),
    ("product/file", r"product\s*/\s*file|product file|file"),
    ("flow/screen", r"flow\s*/\s*screen|flow screen|screen"),
    ("URL/path/availability", r"url\s*/\s*path\s*/\s*availability|availability"),
    ("inspected date", r"inspected at|inspected date"),
    ("evidence quality", r"evidence quality"),
    ("non-copy boundary", r"non-copy|do not copy|pattern inspiration"),
    ("design decision", r"design decision|product decision|decision"),
])
for term in reference_terms:
    issues.append(f"reference evidence panel missing {term}")

if not re.search(r"REF-[0-9]+", raw) and "research-unavailable" not in lower_raw:
    issues.append("reference evidence must include REF-* rows or a visible research-unavailable rationale")

if not re.search(r"href=[\"'][^\"']+(https?://|/|\.{0,2}/|[A-Za-z0-9_.-]+/)", raw, re.IGNORECASE) \
   and "research-unavailable" not in lower_raw:
    issues.append("reference evidence must include links or local paths when research is available")

token_terms = missing_terms("token swatches", [
    ("color", r"color"),
    ("typography", r"typography|font"),
    ("spacing", r"spacing"),
    ("radius", r"radius"),
    ("elevation", r"elevation|shadow"),
    ("motion", r"motion|animation"),
    ("semantic aliases", r"semantic alias|semantic aliases|semantic token"),
    ("platform mapping", r"platform mapping|platform mappings|ios|android|web"),
])
for term in token_terms:
    issues.append(f"token swatches missing {term}")

state_terms = missing_terms("state matrix", [
    ("default", r"\bdefault\b"),
    ("loading", r"\bloading\b"),
    ("empty", r"\bempty\b"),
    ("error", r"\berror\b"),
    ("disabled", r"\bdisabled\b"),
    ("success", r"\bsuccess\b"),
])
for term in state_terms:
    issues.append(f"state matrix missing {term}")

responsive_terms = missing_terms("responsive previews", [
    ("mobile", r"mobile|phone|ios|android"),
    ("tablet", r"tablet|ipad"),
    ("desktop", r"desktop"),
    ("large desktop", r"large desktop|wide desktop|large screen"),
])
for term in responsive_terms:
    issues.append(f"responsive previews missing {term}")

accessibility_terms = missing_terms("accessibility notes", [
    ("contrast", r"contrast"),
    ("focus", r"focus"),
    ("touch target", r"touch target|tap target"),
    ("reduced motion", r"reduced motion"),
    ("screen reader", r"screen reader|screen-reader|aria"),
])
for term in accessibility_terms:
    issues.append(f"accessibility notes missing {term}")

feedback_terms = missing_terms("feedback checklist", [
    ("visual direction", r"visual direction"),
    ("reference alignment", r"reference alignment|reference-alignment"),
    ("missing states", r"missing states?"),
    ("accessibility concerns", r"accessibility concerns?"),
    ("approval or blocking feedback", r"approval|blocking feedback|blocker"),
])
for term in feedback_terms:
    issues.append(f"feedback checklist missing {term}")

if source_map_path:
    source_text = source_map_path.read_text(encoding="utf-8", errors="replace")
    _, evidence_rows = table_for_section(source_text, "Reference Evidence")
    _, map_rows = table_for_section(source_text, "Reference Map")

    if not evidence_rows:
        issues.append(f"source map has no Reference Evidence rows: {source_map_path}")
    if not map_rows:
        issues.append(f"source map has no Reference Map rows: {source_map_path}")

    evidence_ids = {
        row.get("Row ID", "").strip()
        for row in evidence_rows
        if re.fullmatch(r"REF-[0-9]+", row.get("Row ID", "").strip())
    }
    has_unavailable_evidence = any(
        "research-unavailable" in " ".join(row.values()).lower()
        for row in evidence_rows
    )

    for row in evidence_rows:
        row_id = row.get("Row ID", "").strip()
        if not row_id:
            continue
        if row_id not in raw and "research-unavailable" not in lower_raw:
            issues.append(f"source-map evidence row {row_id} is not represented in the artifact")
        for label, column in [
            ("source type", "Source Type"),
            ("product/file", "Product / File"),
            ("flow/screen", "Flow / Screen"),
            ("availability", "URL / Path / Availability"),
            ("evidence quality", "Evidence Quality"),
        ]:
            value = row.get(column, "")
            if value and "research-unavailable" not in value.lower():
                require_source_value(issues, label, value, row_id)

    if evidence_ids and not has_unavailable_evidence:
        for row in map_rows:
            row_id = row.get("Row ID", "").strip()
            if row_id and row_id not in raw:
                issues.append(f"source-map decision row {row_id} is not represented in the artifact")

            evidence_refs = re.findall(r"REF-[0-9]+", row.get("Evidence Row", ""))
            for ref in evidence_refs:
                if ref not in raw:
                    issues.append(f"source-map decision row {row_id} cites {ref}, but the artifact does not show that citation")

            for label, column in [
                ("reference category", "Reference Category"),
                ("observed pattern", "Observed Pattern"),
                ("product decision", "Product Decision"),
                ("non-copy boundary", "Non-copy Boundary"),
                ("responsive notes", "Responsive Notes"),
                ("accessibility notes", "Accessibility Notes"),
            ]:
                require_source_value(issues, label, row.get(column, ""), row_id or "<unknown>")

            for label, column in [
                ("component", "Components Affected"),
                ("token", "Tokens Affected"),
                ("state", "States Affected"),
            ]:
                values = split_tokens(row.get(column, ""))
                missing_values = [
                    value
                    for value in values
                    if normalise_value(value) and normalise_value(value) not in normalised_text
                ]
                if missing_values:
                    issues.append(
                        f"source-map row {row_id or '<unknown>'} missing {label} value(s): "
                        + ", ".join(missing_values)
                    )

if issues:
    print(f"❌ design-system review artifact failed: {html_path}")
    for issue in issues:
        print(f"   - {issue}")
    sys.exit(1)

print(f"✅ design-system review artifact valid: {html_path}")
PY
