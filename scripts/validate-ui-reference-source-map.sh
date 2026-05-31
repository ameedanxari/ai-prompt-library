#!/usr/bin/env bash
# validate-ui-reference-source-map.sh — schema and evidence gate for
# prompts/outputs/current/ui-reference-source-map.md.
#
# Usage:
#   bash scripts/validate-ui-reference-source-map.sh [source-map-path]
#
# Exit codes:
#   0  source map is valid
#   1  source map exists but violates the contract
#   2  preconditions missing

set -uo pipefail

SOURCE_MAP="${1:-prompts/outputs/current/ui-reference-source-map.md}"

if [ ! -f "$SOURCE_MAP" ]; then
  echo "❌ UI reference source map not found: $SOURCE_MAP" >&2
  exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found — required for source-map validation" >&2
  exit 2
fi

python3 - "$SOURCE_MAP" <<'PY'
import re
import sys
from pathlib import Path

source_map = Path(sys.argv[1])
text = source_map.read_text(encoding="utf-8")
lines = text.splitlines()

EVIDENCE_REQUIRED = [
    "Row ID",
    "Source Type",
    "Product / File",
    "Flow / Screen",
    "URL / Path / Availability",
    "Inspected At",
    "Evidence Quality",
]

MAP_REQUIRED = [
    "Row ID",
    "Evidence Row",
    "Reference Category",
    "Observed Pattern",
    "Product Decision",
    "Non-copy Boundary",
    "Components Affected",
    "Tokens Affected",
    "States Affected",
    "Responsive Notes",
    "Accessibility Notes",
]

REQUIRED_STATES = ["default", "loading", "empty", "error", "disabled", "success"]
REQUIRED_SECTIONS = [
    "Product Design Direction",
    "Reference Evidence",
    "Reference Map",
    "Open Design Risks",
]
GENERIC_CATEGORY_RE = re.compile(
    r"^(modern apps?|nice ui|beautiful ui|good design|ui inspiration|reference|references?)$",
    re.IGNORECASE,
)
PLACEHOLDER_RE = re.compile(r"\{\{[^}]+\}\}|<[^>]+>|\[project name\]", re.IGNORECASE)
MEANINGLESS_RE = re.compile(r"^(?:n/?a|none|todo|tbd|unknown|not applicable|-)+$", re.IGNORECASE)


def normalise_heading(raw: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", raw.lower()).strip()


def split_row(raw: str) -> list[str]:
    trimmed = raw.strip()
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


def table_for_section(section_name: str) -> tuple[list[str], list[dict[str, str]], list[str]]:
    wanted = normalise_heading(section_name)
    current = ""
    table_lines: list[str] = []
    table_issues: list[str] = []

    for line in lines:
        if line.startswith("## "):
            current = normalise_heading(line.replace("##", "", 1))
            continue
        if current == wanted and line.strip().startswith("|"):
            table_lines.append(line)

    if len(table_lines) < 2:
        return [], [], []

    header = split_row(table_lines[0])
    rows: list[dict[str, str]] = []
    for offset, raw in enumerate(table_lines[2:], start=3):
        cells = split_row(raw)
        if not any(cells):
            continue
        if len(cells) != len(header):
            table_issues.append(
                f"{source_map}: {section_name} table row {offset} has "
                f"{len(cells)} cell(s), expected {len(header)}"
            )
        padded = cells + [""] * max(0, len(header) - len(cells))
        rows.append(dict(zip(header, padded[:len(header)])))
    return header, rows, table_issues


def section_body(section_name: str) -> list[str]:
    wanted = normalise_heading(section_name)
    current = ""
    body: list[str] = []

    for line in lines:
        if line.startswith("## "):
            current = normalise_heading(line.replace("##", "", 1))
            continue
        if current == wanted:
            body.append(line)

    return body


def field_value(section_lines: list[str], label: str) -> str:
    wanted = normalise_heading(label)
    for line in section_lines:
        match = re.match(r"\s*-\s+\*\*([^*]+):\*\*\s*(.+?)\s*$", line)
        if match and normalise_heading(match.group(1)) == wanted:
            return match.group(2).strip()
    return ""


def missing_columns(header: list[str], required: list[str]) -> list[str]:
    return [column for column in required if column not in header]


def row_label(row: dict[str, str]) -> str:
    return row.get("Row ID", "<unknown row>")


issues: list[str] = []

section_names = {
    normalise_heading(line.replace("##", "", 1))
    for line in lines
    if line.startswith("## ")
}

for section in REQUIRED_SECTIONS:
    if normalise_heading(section) not in section_names:
        issues.append(f"{source_map}: missing required section '## {section}'")

direction_lines = section_body("Product Design Direction")
existing_style_authority = field_value(direction_lines, "Existing style authority")
design_intent = field_value(direction_lines, "Design intent")
primary_surfaces = field_value(direction_lines, "Primary surfaces")
non_copy_rule = field_value(direction_lines, "Non-copy rule")

for label, value in [
    ("Existing style authority", existing_style_authority),
    ("Design intent", design_intent),
    ("Primary surfaces", primary_surfaces),
    ("Non-copy rule", non_copy_rule),
]:
    if not value:
        issues.append(f"{source_map}: Product Design Direction missing '{label}'")
    elif PLACEHOLDER_RE.search(value) or MEANINGLESS_RE.fullmatch(value):
        issues.append(f"{source_map}: Product Design Direction field '{label}' is not project-specific")

if non_copy_rule and not re.search(r"pattern inspiration|do not copy|non-copy|not copy|original", non_copy_rule, re.IGNORECASE):
    issues.append(f"{source_map}: Product Design Direction non-copy rule must explicitly forbid copying")

open_risk_lines = [
    line.strip()
    for line in section_body("Open Design Risks")
    if line.strip() and not line.strip().startswith("|")
]
open_risk_bullets = [line for line in open_risk_lines if line.startswith("-")]
if not open_risk_bullets:
    issues.append(f"{source_map}: Open Design Risks must contain at least one bullet")
elif any(PLACEHOLDER_RE.search(line) or re.fullmatch(r"-\s*(?:todo|tbd|n/?a|-)\s*", line, re.IGNORECASE) for line in open_risk_bullets):
    issues.append(f"{source_map}: Open Design Risks contains placeholder or non-actionable text")

evidence_header, evidence_rows, evidence_table_issues = table_for_section("Reference Evidence")
map_header, map_rows, map_table_issues = table_for_section("Reference Map")
issues.extend(evidence_table_issues)
issues.extend(map_table_issues)

missing_evidence = missing_columns(evidence_header, EVIDENCE_REQUIRED)
if missing_evidence:
    issues.append(
        f"{source_map}: missing required reference-evidence column(s): "
        + ", ".join(f"'{column}'" for column in missing_evidence)
    )

missing_map = missing_columns(map_header, MAP_REQUIRED)
if missing_map:
    issues.append(
        f"{source_map}: missing required source-map column(s): "
        + ", ".join(f"'{column}'" for column in missing_map)
    )

if not evidence_rows:
    issues.append(f"{source_map}: Reference Evidence table has no data rows")
if not map_rows:
    issues.append(f"{source_map}: Reference Map table has no data rows")

if existing_style_authority.lower() in {"no", "none", "false", "not supplied", "not provided"} and len(evidence_rows) < 3:
    issues.append(
        f"{source_map}: Product Design Direction says no existing style authority, "
        "so Reference Evidence must include at least 3 evidence rows"
    )

evidence_ids = {
    row.get("Row ID", "")
    for row in evidence_rows
    if re.fullmatch(r"REF-[0-9]+", row.get("Row ID", ""))
}

has_unavailable_evidence = any(
    "research-unavailable" in " ".join(row.values()).lower()
    for row in evidence_rows
)

if evidence_rows and not evidence_ids and not has_unavailable_evidence:
    issues.append(
        f"{source_map}: no reference evidence rows found; add REF-* rows or a "
        "research-unavailable row with fallback sources"
    )

for row in evidence_rows:
    label = row_label(row)
    if "Row ID" in row and row["Row ID"].strip() and not re.fullmatch(r"REF-[0-9]+", row["Row ID"].strip()):
        issues.append(f"{source_map}: evidence row {label} Row ID must use REF-* format")
    for column in EVIDENCE_REQUIRED:
        if column in row and not row[column].strip():
            issues.append(f"{source_map}: evidence row {label} has empty '{column}'")
    if PLACEHOLDER_RE.search(" ".join(row.values())):
        issues.append(f"{source_map}: evidence row {label} still contains placeholder text")

for row in map_rows:
    label = row_label(row)
    if "Row ID" in row and row["Row ID"].strip() and not re.fullmatch(r"MAP-[0-9]+", row["Row ID"].strip()):
        issues.append(f"{source_map}: map row {label} Row ID must use MAP-* format")
    for column in MAP_REQUIRED:
        if column in row and not row[column].strip():
            issues.append(f"{source_map}: map row {label} has empty '{column}'")
    for column in [
        "Observed Pattern",
        "Product Decision",
        "Components Affected",
        "Tokens Affected",
        "Responsive Notes",
        "Accessibility Notes",
    ]:
        value = row.get(column, "").strip()
        if value and MEANINGLESS_RE.fullmatch(value):
            issues.append(f"{source_map}: map row {label} has non-specific '{column}' value")

    category = row.get("Reference Category", "").strip()
    if GENERIC_CATEGORY_RE.fullmatch(category):
        issues.append(f"{source_map}: map row {label} uses generic reference category '{category}'")

    evidence_refs = re.findall(r"REF-[0-9]+", row.get("Evidence Row", ""))
    if not evidence_refs:
        issues.append(f"{source_map}: map row {label} does not cite an evidence REF-* row")
    else:
        missing_refs = sorted({ref for ref in evidence_refs if ref not in evidence_ids})
        if missing_refs:
            issues.append(
                f"{source_map}: map row {label} cites missing evidence row(s): "
                + ", ".join(missing_refs)
            )

    states = row.get("States Affected", "").lower()
    missing_states = [state for state in REQUIRED_STATES if not re.search(rf"\b{state}\b", states)]
    if missing_states:
        issues.append(
            f"{source_map}: map row {label} missing required state(s): "
            + ", ".join(missing_states)
        )

    boundary = row.get("Non-copy Boundary", "").lower()
    if boundary and not re.search(r"do not copy|non-copy|not copy|pattern inspiration|original", boundary):
        issues.append(
            f"{source_map}: map row {label} non-copy boundary must explicitly forbid copying"
        )

    if PLACEHOLDER_RE.search(" ".join(row.values())):
        issues.append(f"{source_map}: map row {label} still contains placeholder text")

if issues:
    for issue in issues:
        print(f"❌ {issue}")
    sys.exit(1)

print(f"✅ UI reference source map valid: {source_map}")
PY
