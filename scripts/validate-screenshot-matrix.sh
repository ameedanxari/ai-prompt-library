#!/usr/bin/env bash
# validate-screenshot-matrix.sh — validate app-store screenshot task matrices.
#
# Usage:
#   bash scripts/validate-screenshot-matrix.sh [target-dir-or-task-file]
#
# Exit codes:
#   0  every discovered screenshot matrix is valid
#   1  a matrix exists but violates the contract
#   2  preconditions missing

set -uo pipefail

TARGET="${1:-prompts/outputs/current}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found — required for screenshot matrix validation" >&2
  exit 2
fi

if [ -d "$TARGET" ]; then
  FILES=()
  while IFS= read -r file; do
    FILES+=("$file")
  done < <(find "$TARGET" -maxdepth 1 -type f \( -name "tasks-*screenshots*.md" -o -name "remediation-*screenshots*.md" \) | sort)
  if [ "${#FILES[@]}" -eq 0 ]; then
    echo "❌ no screenshot task matrix files found in: $TARGET" >&2
    exit 2
  fi
elif [ -f "$TARGET" ]; then
  FILES=("$TARGET")
else
  echo "❌ screenshot matrix target not found: $TARGET" >&2
  exit 2
fi

python3 - "${FILES[@]}" <<'PY'
import re
import sys
from pathlib import Path

TASK_HEADING_RE = re.compile(r"^##\s+T(?P<num>\d+)\s+[·.-]\s+(?P<title>.+?)\s*$")
FIELD_RE = re.compile(r"^-\s+\*\*(?P<name>[^*]+):\*\*\s*(?P<value>.+?)\s*$")
SCREENSHOT_PATH_RE = re.compile(
    r"^fastlane/screenshots/(?P<locale>[^/\s,]+)/(?P<device>[^/\s,]+)/(?P<asset>(?P<num>\d+)_(?P<frame>[^/]+)\.png)$"
)
VERIFY_RE = re.compile(r"tools/app-store/verify-screenshot\.sh\s+(fastlane/screenshots/[^\s`]+\.png)")


def parse_tasks(path: Path) -> list[dict[str, object]]:
    tasks: list[dict[str, object]] = []
    current: dict[str, object] | None = None

    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        heading = TASK_HEADING_RE.match(line)
        if heading:
            current = {
                "num": int(heading.group("num")),
                "title": heading.group("title"),
                "line": line_no,
                "fields": {},
                "body": [],
            }
            tasks.append(current)
            continue

        if current is None:
            continue
        body = current["body"]
        assert isinstance(body, list)
        body.append(line)

        field = FIELD_RE.match(line)
        if field:
            fields = current["fields"]
            assert isinstance(fields, dict)
            fields[field.group("name").strip().lower()] = field.group("value").strip()

    return tasks


def clean_code(value: object) -> str:
    raw = str(value or "").strip()
    if raw.startswith("`") and raw.endswith("`"):
        raw = raw[1:-1]
    return raw.strip()


def validate_file(path: Path) -> list[str]:
    issues: list[str] = []
    text = path.read_text(encoding="utf-8")
    tasks = parse_tasks(path)
    if not tasks:
        return [f"{path}: no task headings found"]

    tooling_files = {
        clean_code(task["fields"].get("file"))  # type: ignore[index, union-attr]
        for task in tasks
        if isinstance(task.get("fields"), dict)
    }
    if not ({"fastlane/Snapfile", "fastlane/Screengrabfile"} & tooling_files):
        issues.append(f"{path}: missing Fastlane screenshot config task")
    if "tools/app-store/verify-screenshot.sh" not in tooling_files:
        issues.append(f"{path}: missing screenshot verification helper task")

    capture_rows: list[dict[str, object]] = []
    seen_paths: set[str] = set()

    for task in tasks:
        fields = task.get("fields")
        if not isinstance(fields, dict):
            continue

        file_path = clean_code(fields.get("file"))
        match = SCREENSHOT_PATH_RE.fullmatch(file_path)
        if not match:
            continue

        title = str(task.get("title", ""))
        test = clean_code(fields.get("test"))
        verify = VERIFY_RE.search(test)
        expected_path = file_path

        if file_path in seen_paths:
            issues.append(f"{path}: duplicate screenshot path {file_path}")
        seen_paths.add(file_path)

        if int(match.group("num")) != task["num"]:
            issues.append(
                f"{path}: task T{task['num']} file {file_path} must start with its task number"
            )

        expected_title = f"{match.group('locale')} / {match.group('device')} / {match.group('frame')}"
        if expected_title not in title:
            issues.append(
                f"{path}: task T{task['num']} heading must name locale/device/frame '{expected_title}'"
            )

        if not verify:
            issues.append(f"{path}: task T{task['num']} Test must run tools/app-store/verify-screenshot.sh")
        elif verify.group(1) != expected_path:
            issues.append(
                f"{path}: task T{task['num']} Test verifies {verify.group(1)}, expected {expected_path}"
            )

        body_lines = task.get("body", [])
        acceptance = " ".join(line.strip() for line in body_lines) if isinstance(body_lines, list) else ""
        if "OCR" not in acceptance and "localised" not in acceptance and "localized" not in acceptance:
            issues.append(
                f"{path}: task T{task['num']} must include OCR/localised-copy acceptance"
            )

        capture_rows.append(
            {
                "task": task["num"],
                "locale": match.group("locale"),
                "device": match.group("device"),
                "frame": match.group("frame"),
                "path": file_path,
            }
        )

    if not capture_rows:
        issues.append(f"{path}: no concrete fastlane/screenshots/<locale>/<device>/<n>_<frame>.png capture tasks found")
        return issues

    locales = sorted({str(row["locale"]) for row in capture_rows})
    devices = sorted({str(row["device"]) for row in capture_rows})
    frames = sorted({str(row["frame"]) for row in capture_rows})
    expected_count = len(locales) * len(devices) * len(frames)

    if len(frames) < 2 and "Single-frame-ok:" not in text:
        issues.append(f"{path}: screenshot matrix covers only one frame/scenario")

    actual_combos = {
        (str(row["locale"]), str(row["device"]), str(row["frame"]))
        for row in capture_rows
    }
    expected_combos = {
        (locale, device, frame)
        for locale in locales
        for device in devices
        for frame in frames
    }
    missing = sorted(expected_combos - actual_combos)
    if missing:
        preview = ", ".join("/".join(combo) for combo in missing[:10])
        suffix = "" if len(missing) <= 10 else f" (+{len(missing) - 10} more)"
        issues.append(f"{path}: screenshot matrix missing locale/device/frame combinations: {preview}{suffix}")

    if len(capture_rows) != expected_count:
        issues.append(
            f"{path}: screenshot matrix has {len(capture_rows)} capture task(s), expected "
            f"{expected_count} from {len(locales)} locale(s) × {len(devices)} device(s) × {len(frames)} frame(s)"
        )

    return issues


all_issues: list[str] = []
for filename in sys.argv[1:]:
    all_issues.extend(validate_file(Path(filename)))

if all_issues:
    for issue in all_issues:
        print(f"❌ {issue}")
    sys.exit(1)

print(f"✅ screenshot matrix valid ({len(sys.argv) - 1} file(s))")
PY
