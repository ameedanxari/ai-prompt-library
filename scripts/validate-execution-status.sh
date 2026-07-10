#!/usr/bin/env bash
# Validate canonical task-unit execution records against handoff artifacts.
#
# Usage: bash scripts/validate-execution-status.sh [plan-dir]
# Exit 0: records and handoff agree (terminal state may be blocked/partial)
# Exit 1: contradictory or missing evidence
# Exit 2: prerequisites are missing or malformed

set -uo pipefail

PLAN_DIR="${1:-prompts/outputs/current}"
LOG="$PLAN_DIR/execution-log.md"
CONTRACT="$PLAN_DIR/task-contract.json"
GRAPH="$PLAN_DIR/task-graph.json"
REPORT="$PLAN_DIR/execution-status-report.json"

if [ ! -d "$PLAN_DIR" ]; then
  echo "execution status: plan directory not found: $PLAN_DIR" >&2
  exit 2
fi
for required_file in "$LOG" "$CONTRACT" "$GRAPH"; do
  if [ ! -f "$required_file" ]; then
    echo "execution status: required input not found: $required_file" >&2
    exit 2
  fi
done
if ! command -v python3 >/dev/null 2>&1; then
  echo "execution status: python3 is required" >&2
  exit 2
fi

temporary_report="$(mktemp "$REPORT.tmp.XXXXXX")" || exit 2
validation_status=0
python3 - "$PLAN_DIR" "$temporary_report" <<'PY' || validation_status=$?
import json
import os
import re
import sys

plan_dir, report_path = sys.argv[1:3]

def load_json(name):
    path = os.path.join(plan_dir, name)
    try:
        with open(path, encoding="utf-8") as handle:
            return json.load(handle)
    except Exception as exc:
        raise ValueError(f"cannot read {name}: {exc}") from exc

def parse_inline_list(raw):
    value = (raw or "").strip()
    if not value or value in {"[]", "null"}:
        return []
    if value.startswith("[") and value.endswith("]"):
        value = value[1:-1]
    return [item.strip().strip('"\'') for item in value.split(",") if item.strip()]

def parse_envelope(text):
    match = re.match(r"\A---\s*\n(.*?)\n---", text, re.S)
    if not match:
        raise ValueError("execution-log.md has no YAML envelope")
    fields = {}
    for line in match.group(1).splitlines():
        field = re.match(r"^([A-Za-z0-9_]+):\s*(.*)$", line)
        if field:
            fields[field.group(1)] = field.group(2).strip()
    return fields

def task_prompt(task_id):
    return task_id.split("#", 1)[0]

def envelope_mentions(entries, task_id):
    prompt = task_prompt(task_id)
    slug = re.sub(r"^(tasks|remediation)-", "", prompt).removesuffix(".md")
    local = task_id.split("#", 1)[1] if "#" in task_id else ""
    aliases = {
        task_id,
        prompt,
        f"{prompt}:{local}",
        f"{slug}:{local}",
        f"{slug}.{local}",
    }
    return any(entry in aliases for entry in entries)

SATISFIES = {
    "static": {"static", "compile", "unit", "integration", "ui-fixture", "device", "manual-review", "external"},
    "compile": {"compile", "unit", "integration", "ui-fixture", "device"},
    "unit": {"unit", "integration", "ui-fixture", "device"},
    "integration": {"integration", "ui-fixture", "device"},
    "ui-fixture": {"ui-fixture", "device"},
    "device": {"device"},
    "manual-review": {"manual-review"},
    "external": {"external"},
}
CRITICAL_RISKS = {
    "primary-flow", "security", "privacy", "destructive-action",
    "persistence", "integration", "data-integrity",
}

issues = []
def add_issue(code, message, task_id=None):
    issue = {"code": code, "message": message}
    if task_id:
        issue["task_id"] = task_id
    issues.append(issue)

try:
    with open(os.path.join(plan_dir, "execution-log.md"), encoding="utf-8") as handle:
        log_text = handle.read()
    contract = load_json("task-contract.json")
    graph = load_json("task-graph.json")
    envelope = parse_envelope(log_text)
except ValueError as exc:
    with open(report_path, "w", encoding="utf-8") as handle:
        json.dump({"status": "prerequisite-error", "issues": [{"code": "malformed-input", "message": str(exc)}]}, handle, indent=2)
        handle.write("\n")
    print(f"execution status: {exc}", file=sys.stderr)
    sys.exit(2)

blocked_entries = parse_inline_list(envelope.get("blocked_tasks"))
failed_entries = parse_inline_list(envelope.get("failed_tasks"))
deferred_entries = parse_inline_list(envelope.get("deferred_tasks"))
next_task_raw = envelope.get("next_task", "null").strip().strip('"\'')
next_task = None if next_task_raw in {"", "null"} else next_task_raw

journal_sections = []
section_pattern = re.compile(
    r"^###\s+`([^`]+)`[^\n]*?[—-]\s*(done|blocked|failed|deferred)\s*$\n(.*?)(?=^###\s+|^##\s+|\Z)",
    re.M | re.S | re.I,
)
for match in section_pattern.finditer(log_text):
    journal_sections.append({
        "prompt": match.group(1),
        "status": match.group(2).lower(),
        "body": match.group(3),
    })

records = []
for raw_record in re.findall(r"```execution-status-record\s*\n(.*?)```", log_text, re.S):
    try:
        parsed = json.loads(raw_record)
        records.extend(parsed if isinstance(parsed, list) else [parsed])
    except Exception as exc:
        add_issue("malformed-canonical-record", f"cannot parse execution-status-record: {exc}")

records_by_id = {}
for record in records:
    task_id = record.get("taskId") if isinstance(record, dict) else None
    if not task_id:
        add_issue("missing-task-id", "canonical record has no taskId")
        continue
    if task_id in records_by_id:
        add_issue("duplicate-canonical-record", "multiple canonical records exist", task_id)
    records_by_id[task_id] = record

units = contract.get("units", [])
units_by_id = {unit.get("canonicalId"): unit for unit in units if unit.get("canonicalId")}
for task_id, unit in units_by_id.items():
    record = records_by_id.get(task_id)
    if record is None:
        add_issue("missing-canonical-record", "task-contract unit has no execution record", task_id)
        continue

    status = record.get("status")
    required_level = unit.get("evidenceLevel") or record.get("requiredEvidenceLevel")
    declared_level = record.get("requiredEvidenceLevel")
    if required_level and declared_level != required_level:
        add_issue(
            "evidence-level-disagreement",
            f"record requires {declared_level!r}, task contract requires {required_level!r}",
            task_id,
        )

    if status in {"blocked", "failed", "deferred"}:
        envelope_entries = {
            "blocked": blocked_entries,
            "failed": failed_entries,
            "deferred": deferred_entries,
        }[status]
        if not envelope_mentions(envelope_entries, task_id):
            add_issue(
                "record-envelope-status-disagreement",
                f"record status {status} is absent from the matching envelope list",
                task_id,
            )
        continue
    if status != "done":
        add_issue("nonterminal-task-status", f"task status is {status!r}", task_id)
        continue

    evidence = record.get("testEvidence") or []
    if not evidence:
        add_issue("missing-test-evidence", "done task has no test evidence", task_id)
    if any(item.get("outcome") != "pass" for item in evidence):
        add_issue("done-with-failing-test", "done task contains failed or errored test evidence", task_id)

    passing_levels = {
        item.get("level") for item in evidence if item.get("outcome") == "pass"
    }
    if required_level and not any(
        level in SATISFIES.get(required_level, set()) for level in passing_levels
    ):
        add_issue(
            "missing-required-evidence",
            f"required {required_level} evidence is not satisfied by {sorted(level for level in passing_levels if level)}",
            task_id,
        )

    acceptance = record.get("acceptance") or []
    evidence_ids = {item.get("id") for item in evidence if item.get("id")}
    if not acceptance:
        add_issue("missing-acceptance-records", "done task has no acceptance records", task_id)
    for item in acceptance:
        if not item.get("met"):
            add_issue("unmet-acceptance", f"acceptance {item.get('id', '<unknown>')} is unmet", task_id)
        elif not item.get("evidenceIds"):
            add_issue("acceptance-without-evidence", f"acceptance {item.get('id', '<unknown>')} has no evidence links", task_id)
        elif any(evidence_id not in evidence_ids for evidence_id in item.get("evidenceIds", [])):
            add_issue("acceptance-evidence-not-found", f"acceptance {item.get('id', '<unknown>')} links unknown evidence", task_id)

    build = record.get("buildEvidence")
    if not build:
        add_issue("missing-build-evidence", "done task has no build evidence", task_id)
    elif build.get("outcome") != "pass" or build.get("current") is not True:
        add_issue("stale-or-failing-build", "build evidence is not current and passing", task_id)

    risk_text = " ".join([
        str(unit.get("title", "")),
        str(unit.get("preciseChange", "")),
        " ".join(record.get("risks") or []),
    ]).lower()
    behavioral = re.search(
        r"\b(integration|delet(?:e|es|ed|ion)|security|privacy|persist(?:ence|ent|s|ed)?|data[ -]integrity|destructive)\b",
        risk_text,
    )
    implementation_artifact = unit.get("artifactKind") in {"runtime-source", "test-source", "config"}
    if implementation_artifact and behavioral and passing_levels and passing_levels <= {"static"}:
        add_issue(
            "static-only-behavioral-closure",
            "behavior-heavy work cannot close with static evidence alone",
            task_id,
        )
    if not evidence and CRITICAL_RISKS.intersection(record.get("risks") or []):
        add_issue("tier-zero-evidence-missing", "critical task has no evidence record", task_id)

journal_by_prompt = {section["prompt"]: section for section in journal_sections}
for section in journal_sections:
    body = section["body"]
    prompt = section["prompt"]
    status = section["status"]
    test_results = re.findall(r"\*\*Test result:\*\*\s*([^\n]+)", body, re.I)
    if status == "done" and any(not result.strip().lower().startswith("pass") for result in test_results):
        add_issue("journal-done-with-failing-test", "journal marks done while Test result is not pass", prompt)
    if status == "done" and re.search(r"^\s*[-*]\s*(?:❌|\[ \])", body, re.M):
        add_issue("journal-unmet-acceptance", "journal marks done with unmet acceptance", prompt)
    if status in {"blocked", "failed", "deferred"}:
        envelope_entries = {
            "blocked": blocked_entries,
            "failed": failed_entries,
            "deferred": deferred_entries,
        }[status]
        prompt_records = [record for task_id, record in records_by_id.items() if task_prompt(task_id) == prompt]
        envelope_has_prompt = any(envelope_mentions(envelope_entries, record.get("taskId", "")) for record in prompt_records)
        envelope_has_prompt = envelope_has_prompt or prompt in envelope_entries
        if not envelope_has_prompt:
            add_issue(
                "journal-envelope-status-disagreement",
                f"{status} journal entry is absent from the matching envelope list",
                prompt,
            )

prompt_statuses = {}
for task_id, record in records_by_id.items():
    prompt_statuses.setdefault(task_prompt(task_id), []).append(record.get("status"))
for prompt, statuses in prompt_statuses.items():
    section = journal_by_prompt.get(prompt)
    if section is None:
        add_issue("missing-journal-entry", "task-unit records have no prompt journal entry", prompt)
        continue
    if "blocked" in statuses:
        expected_status = "blocked"
    elif "failed" in statuses:
        expected_status = "failed"
    elif "deferred" in statuses or any(status not in {"done"} for status in statuses):
        expected_status = "deferred"
    else:
        expected_status = "done"
    if section["status"] != expected_status:
        add_issue(
            "journal-record-status-disagreement",
            f"journal status {section['status']} disagrees with derived {expected_status}",
            prompt,
        )

for envelope_name, entries in [
    ("blocked_tasks", blocked_entries),
    ("failed_tasks", failed_entries),
    ("deferred_tasks", deferred_entries),
]:
    for entry in entries:
        represented = any(envelope_mentions([entry], task_id) for task_id in records_by_id)
        represented = represented or entry in journal_by_prompt
        if not represented:
            add_issue(
                "orphan-envelope-status",
                f"{envelope_name} entry has no canonical record or journal entry: {entry}",
            )

for node in graph.get("nodes", []):
    prompt = node.get("id")
    statuses = prompt_statuses.get(prompt, [])
    if not statuses or any(status != "done" for status in statuses):
        continue
    for dependency in node.get("dependencies", []):
        dependency_statuses = prompt_statuses.get(dependency, [])
        if not dependency_statuses or any(status != "done" for status in dependency_statuses):
            add_issue(
                "dependency-status-disagreement",
                f"done prompt depends on non-done or unrecorded {dependency}",
                prompt,
            )

production_passed = False
release_ready_claim = False
completion_state = None
envelope_report_path = os.path.join(plan_dir, "envelope-report.md")
if os.path.isfile(envelope_report_path):
    envelope_report = open(envelope_report_path, encoding="utf-8").read()
    production_passed = bool(re.search(r"^\s*production_verification:\s*pass\s*$", envelope_report, re.M))
    release_ready_claim = bool(re.search(r"^release_ready:\s*true\s*$", envelope_report, re.M))

completion_path = os.path.join(plan_dir, "completion-report.json")
if os.path.isfile(completion_path):
    try:
        completion = load_json("completion-report.json")
        completion_state = completion.get("state")
    except ValueError as exc:
        add_issue("malformed-completion-report", str(exc))

release_gate_value = None
for release_name in ["release-readiness-report.json", "release-report.json"]:
    release_path = os.path.join(plan_dir, release_name)
    if os.path.isfile(release_path):
        try:
            release_gate_value = bool(load_json(release_name).get("release_ready"))
        except ValueError as exc:
            add_issue("malformed-release-report", str(exc))
        break

if completion_state in {"verified_production", "release_ready"} and not production_passed:
    add_issue("completion-production-disagreement", f"completion state {completion_state} lacks production verification")
if completion_state == "release_ready" and release_gate_value is not True:
    add_issue("completion-release-disagreement", "completion claims release_ready without passing release gates")
if release_ready_claim and release_gate_value is not True:
    add_issue("envelope-release-disagreement", "envelope claims release_ready without passing release gates")

unresolved = any(record.get("status") in {"blocked", "failed"} for record in records_by_id.values())
if unresolved:
    terminal_state = "blocked"
elif issues or next_task is not None or not production_passed:
    terminal_state = "partial"
else:
    terminal_state = "verified_production"

report = {
    "generated_by": "scripts/validate-execution-status.sh",
    "terminal_state": terminal_state,
    "valid": not issues,
    "next_task": next_task,
    "record_count": len(records_by_id),
    "contract_unit_count": len(units_by_id),
    "production_verification_passed": production_passed,
    "release_gate_passed": release_gate_value,
    "issues": sorted(issues, key=lambda issue: (issue["code"], issue.get("task_id", ""), issue["message"])),
}
with open(report_path, "w", encoding="utf-8") as handle:
    json.dump(report, handle, indent=2, sort_keys=True)
    handle.write("\n")

if issues:
    print(f"execution status: {len(issues)} blocking inconsistency(s)")
    for issue in report["issues"]:
        location = f" [{issue['task_id']}]" if issue.get("task_id") else ""
        print(f"  - {issue['code']}{location}: {issue['message']}")
    sys.exit(1)

print(f"execution status: valid ({len(records_by_id)} records, terminal_state={terminal_state})")
PY

if [ -s "$temporary_report" ]; then
  mv -f "$temporary_report" "$REPORT"
else
  rm -f "$temporary_report"
fi

if [ "$validation_status" -eq 0 ]; then
  echo "✅ execution status gate: pass — wrote $REPORT"
elif [ "$validation_status" -eq 1 ]; then
  echo "❌ execution status gate: fail — wrote $REPORT" >&2
else
  echo "❌ execution status gate: prerequisite error — wrote $REPORT" >&2
fi
exit "$validation_status"
