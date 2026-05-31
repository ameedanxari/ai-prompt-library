#!/usr/bin/env bash
# validate-user-review-checkpoints.sh — detect missing user-review gates.
#
# Design-system foundation work is only useful if dependent screen work
# cannot race past the review artifact. This validator turns that
# planning rule into a deterministic pre-executor check:
#   - review artifact tasks must include reference evidence and a
#     visual-review feedback handoff;
#   - downstream UI/screen tasks must depend on the review task when a
#     review artifact is present.
#
# Usage:
#   bash scripts/validate-user-review-checkpoints.sh [target-dir]
#
# Exit codes:
#   0  checkpoints are valid
#   1  blocking checkpoint issues found
#   2  preconditions missing

set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"
REPORT="$TARGET_DIR/user-review-checkpoints.md"

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ target directory does not exist: $TARGET_DIR" >&2
  echo "usage: bash scripts/validate-user-review-checkpoints.sh [target-dir]" >&2
  exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found" >&2
  exit 2
fi

python3 - "$TARGET_DIR" "$REPORT" <<'PY'
import datetime
import json
import os
import re
import sys

target_dir, report_path = sys.argv[1], sys.argv[2]

PLAN_RE = re.compile(r"^(tasks|remediation)-[a-z0-9][a-z0-9-]*\.md$")
HEADING_RE = re.compile(r"^##\s+([TR][0-9]+)(?:\s*[\u00b7.-]\s*)?(.*)$")
FIELD_RE = re.compile(r"^\s*[-*]?\s*\*\*([^:*]+):\*\*\s*(.*)$")
DEP_FILE_RE = re.compile(r"\b(?:tasks|remediation)-[a-z0-9][a-z0-9-]*\.md\b", re.I)
LOCAL_TASK_RE = re.compile(r"\b[TR][0-9]+\b")
ARTIFACT_RE = re.compile(r"docs/design-system/review/index\.html|design-system review artifact|static html review artifact", re.I)
FOUNDATION_RE = re.compile(
    r"design[- ]system|design tokens?|theme primitives?|component system|component catalog|component librar|reusable component",
    re.I,
)
REFERENCE_RE = re.compile(
    r"\bREF-[0-9]{3,}\b|reference evidence|mobbin|figma|product reference|platform reference|url\s*/\s*path\s*/\s*availability|ui-reference-source-map|source map",
    re.I,
)
FEEDBACK_RE = re.compile(
    r"user review|visual-review feedback|visual review feedback|review checkpoint|feedback checkpoint|ask\b.*\bfeedback|provide feedback",
    re.I,
)
UI_DEPENDENT_RE = re.compile(
    r"\bscreen\b|\bdashboard\b|\bpage\b|\bview\b|\bfrontend\b|\bweb app\b|\bmobile app\b|\blayout\b|\bchart\b|\bgraph\b",
    re.I,
)
NON_DEPENDENT_RE = re.compile(r"screenshot|app-store|store submission|review artifact", re.I)
PHASES_AFTER_FOUNDATION = {"mvp", "expand", "polish"}


def strip_inline_comment(raw):
    return re.sub(r"\s+#.*$", "", raw).strip()


def split_pipe(raw):
    return [part.strip() for part in re.split(r"\s*\|\s*", raw) if part.strip()]


def extract_paths(raw):
    trimmed = strip_inline_comment(raw)
    if not trimmed or trimmed.lower() in {"none", "n/a", "tbd", "\u2014"}:
        return []

    backticks = [match.strip() for match in re.findall(r"`([^`]+)`", trimmed)]
    if backticks:
        values = []
        for token in backticks:
            values.extend(split_pipe(token))
        return list(dict.fromkeys(values))

    return list(dict.fromkeys(part for part in split_pipe(trimmed) if not re.search(r"\s", part)))


def split_sections(lines):
    sections = []
    current = None
    top_level = []
    top_level_line = 1

    for index, line in enumerate(lines, start=1):
        heading = HEADING_RE.match(line)
        if heading:
            if current:
                sections.append(current)
            current = {
                "id": heading.group(1),
                "title": (heading.group(2) or heading.group(1)).strip(),
                "line": index,
                "lines": [line],
            }
            continue

        if current:
            current["lines"].append(line)
        else:
            if not top_level and line.strip():
                top_level_line = index
            top_level.append(line)

    if current:
        sections.append(current)

    if any(FIELD_RE.match(line) for line in top_level):
        sections.insert(0, {
            "id": "TASK",
            "title": "Top-level task",
            "line": top_level_line,
            "lines": top_level,
        })

    return sections


def parse_unit(filename, section):
    body = "\n".join(section["lines"])
    unit = {
        "file": filename,
        "id": section["id"],
        "canonical_id": f"{filename}#{section['id']}",
        "title": section["title"],
        "line": section["line"],
        "body": body,
        "file_paths": [],
        "depends_on_raw": "",
        "depends_on_files": [],
        "depends_on_local_ids": [],
        "phase": "",
    }

    for line in section["lines"]:
        field = FIELD_RE.match(line)
        if not field:
            continue
        name = re.sub(r"\s+", " ", field.group(1).strip().lower())
        value = field.group(2).strip()

        if name == "file":
            unit["file_paths"].extend(extract_paths(value))
        elif name == "depends on":
            unit["depends_on_raw"] = f"{unit['depends_on_raw']}; {value}".strip("; ")
            unit["depends_on_files"].extend(DEP_FILE_RE.findall(value))
            unit["depends_on_local_ids"].extend(LOCAL_TASK_RE.findall(value))
        elif name == "phase":
            unit["phase"] = re.sub(r"[.\u3002]$", "", value).strip().lower()

    unit["file_paths"] = sorted(set(unit["file_paths"]))
    unit["depends_on_files"] = sorted(set(dep.lower() for dep in unit["depends_on_files"]))
    unit["depends_on_local_ids"] = sorted(set(unit["depends_on_local_ids"]))
    return unit


def load_units():
    units = []
    for filename in sorted(name for name in os.listdir(target_dir) if PLAN_RE.match(name)):
        with open(os.path.join(target_dir, filename), encoding="utf-8") as handle:
            lines = handle.read().splitlines()
        for section in split_sections(lines):
            units.append(parse_unit(filename, section))
    return units


def is_review_unit(unit):
    path_hit = "docs/design-system/review/index.html" in {path.lower() for path in unit["file_paths"]}
    body_hit = ARTIFACT_RE.search(unit["body"]) and FOUNDATION_RE.search(unit["body"])
    return bool(path_hit or body_hit)


def is_dependent_ui_unit(unit):
    if is_review_unit(unit):
        return False
    if NON_DEPENDENT_RE.search(unit["body"]):
        return False
    if unit["phase"] in PHASES_AFTER_FOUNDATION and UI_DEPENDENT_RE.search(unit["body"]):
        return True
    return bool(UI_DEPENDENT_RE.search(unit["title"]) and unit["phase"] in PHASES_AFTER_FOUNDATION)


def depends_on_review(unit, review_units):
    raw = unit["depends_on_raw"].lower()
    for review in review_units:
        if review["file"].lower() in unit["depends_on_files"]:
            return True
        if unit["file"] == review["file"] and review["id"] in unit["depends_on_local_ids"]:
            return True
        if review["canonical_id"].lower() in raw:
            return True
    return "docs/design-system/review/index.html" in raw


units = load_units()
review_units = [unit for unit in units if is_review_unit(unit)]
issues = []

for unit in review_units:
    if not any(path.lower() == "docs/design-system/review/index.html" for path in unit["file_paths"]) and not ARTIFACT_RE.search(unit["body"]):
        issues.append({
            "code": "missing-review-artifact",
            "file": unit["file"],
            "unit": unit["id"],
            "line": unit["line"],
            "message": "design-system foundation review task does not name docs/design-system/review/index.html",
        })
    if not REFERENCE_RE.search(unit["body"]):
        issues.append({
            "code": "missing-reference-evidence",
            "file": unit["file"],
            "unit": unit["id"],
            "line": unit["line"],
            "message": "review artifact task does not include source-map/reference evidence",
        })
    if not FEEDBACK_RE.search(unit["body"]):
        issues.append({
            "code": "missing-feedback-handoff",
            "file": unit["file"],
            "unit": unit["id"],
            "line": unit["line"],
            "message": "review artifact task does not require a user visual-review feedback checkpoint",
        })

if review_units:
    for unit in [candidate for candidate in units if is_dependent_ui_unit(candidate)]:
        if not depends_on_review(unit, review_units):
            issues.append({
                "code": "missing-review-dependency",
                "file": unit["file"],
                "unit": unit["id"],
                "line": unit["line"],
                "message": "downstream UI task does not depend on the design-system review task",
            })

now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
status = "fail" if issues else "pass"

with open(report_path, "w", encoding="utf-8") as report:
    report.write("---\n")
    report.write(f"generated_at: {now}\n")
    report.write("generated_by: scripts/validate-user-review-checkpoints.sh\n")
    report.write(f"target_dir: {target_dir}\n")
    report.write(f"review_task_count: {len(review_units)}\n")
    report.write(f"issue_count: {len(issues)}\n")
    report.write(f"status: {status}\n")
    report.write("---\n\n")
    report.write("# User Review Checkpoints\n\n")
    report.write(f"_Generated by `scripts/validate-user-review-checkpoints.sh` on {now}._\n\n")
    if issues:
        report.write("❌ user_review_checkpoints: fail\n\n")
        report.write("| Code | Task | Line | Issue |\n")
        report.write("|---|---|---:|---|\n")
        for issue in issues:
            task = f"{issue['file']}#{issue['unit']}"
            report.write(f"| `{issue['code']}` | `{task}` | {issue['line']} | {issue['message']} |\n")
        report.write("\n")
    else:
        report.write("✅ user_review_checkpoints: pass\n\n")
    report.write("## Review Tasks\n\n")
    if review_units:
        report.write("| Task | Phase | Artifact Paths |\n")
        report.write("|---|---|---|\n")
        for unit in review_units:
            paths = ", ".join(f"`{path}`" for path in unit["file_paths"]) or "n/a"
            report.write(f"| `{unit['canonical_id']}` | `{unit['phase'] or 'unspecified'}` | {paths} |\n")
    else:
        report.write("No design-system review artifact tasks were detected.\n")
    report.write("\n## Machine Summary\n\n")
    report.write("```json\n")
    report.write(json.dumps({
        "status": status,
        "reviewTaskCount": len(review_units),
        "issueCount": len(issues),
        "issues": issues,
    }, indent=2))
    report.write("\n```\n")

if issues:
    for issue in issues:
        print(f"❌ {issue['file']}#{issue['unit']}: {issue['message']}")
    print(f"❌ user-review checkpoints: fail — wrote {report_path}")
    sys.exit(1)

print(f"✅ user-review checkpoints: pass — wrote {report_path}")
PY
