#!/usr/bin/env bash
# validate-baseline-task-coverage.sh — deterministic C5 baseline checks.
#
# Baseline task-shape rules live in prompts/orchestrators/
# baseline-task-shapes.md. This validator promotes the most mechanical
# parts of those rules into a pre-executor gate: when a plan clearly
# scopes in a baseline topic, the corresponding task/remediation files
# must contain the required implementation and verification markers.
#
# Usage:
#   bash scripts/validate-baseline-task-coverage.sh [target-dir]
#
# Exit codes:
#   0  detected baseline topics are covered
#   1  baseline coverage gaps found
#   2  preconditions missing

set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"
REPORT="$TARGET_DIR/baseline-task-coverage.md"

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ target directory does not exist: $TARGET_DIR" >&2
  echo "usage: bash scripts/validate-baseline-task-coverage.sh [target-dir]" >&2
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

PLAN_RE = re.compile(r"^(features|tasks|remediation)-[a-z0-9][a-z0-9-]*\.md$", re.I)

TOPICS = [
    {
        "id": "app-store-release-prep",
        "label": "App Store Release Prep",
        "detect": [
            r"\bapp[- ]store release prep\b",
            r"\bapp store connect\b",
            r"\bplay console\b",
            r"\bprivacy nutrition\b",
            r"\bdata safety\b",
            r"\bfastlane\b",
            r"\bsnapfile\b",
            r"\bscreenshot capture\b",
            r"\bstore metadata\b",
        ],
        "required": [
            ("store listing copy", r"\b(listing copy|subtitle|description|keywords|promotional text|support url)\b"),
            ("privacy labels/data safety", r"\b(privacy nutrition|data safety|permission manifest|data categor(?:y|ies)|tracking claim)\b"),
            ("screenshot tooling or capture matrix", r"\b(fastlane|snapfile|screenshot matrix|screenshot capture|screenshots/.+\.(png|jpg|jpeg|webp))\b"),
            ("signing/distribution", r"\b(signing|certificate|provisioning|keystore|testflight|internal track|distribution)\b"),
            ("metadata upload", r"\b(metadata upload|app store connect|play console)\b"),
        ],
    },
    {
        "id": "localization-rtl",
        "label": "Localization & RTL",
        "detect": [
            r"\blocali[sz]ation\b",
            r"\bi18n\b",
            r"\btranslation file\b",
            r"\btranslations?\b",
            r"\brtl\b",
            r"\bLocalizable(?:\.xcstrings|\.strings)?\b",
            r"\bAndroid string resources\b",
        ],
        "required": [
            ("i18n framework/resource system", r"\b(i18next|react-intl|formatjs|Localizable(?:\.xcstrings|\.strings)?|strings\.xml|android string resources|i18n framework)\b"),
            ("locale source or seeded locale", r"\b(locale list|supported locale|MY_PROJECT\.md|en-US|en_US|current locale|translation file)\b"),
            ("RTL verification", r"\b(rtl|right-to-left|arabic|hebrew|layout assertion|screenshot diff)\b"),
            ("hard-coded English check", r"\b(no hard[- ]coded English|hard[- ]coded English strings?|user-facing source files)\b"),
        ],
    },
    {
        "id": "theming-whitelabel",
        "label": "Theming & Whitelabel",
        "detect": [
            r"\btheming\b",
            r"\bwhite[- ]?label\b",
            r"\bdesign[- ]token",
            r"\bdark[- ]mode\b",
            r"\bdesign-system review artifact\b",
            r"docs/design-system/review/index\.html",
            r"\btheme primitives?\b",
        ],
        "required": [
            ("design tokens", r"\b(design[- ]token|token list|primary|secondary|surface|onSurface|neutral)\b"),
            ("static design review artifact", r"docs/design-system/review/index\.html|design-system review artifact"),
            ("dark mode", r"\b(dark[- ]mode|OS preference|prefers-color-scheme|system appearance)\b"),
            ("visual regression", r"\b(visual[- ]regression|screenshot diff|percy|chromatic|light \+ dark|light and dark)\b"),
            ("whitelabel swap", r"\b(white[- ]?label|second brand|brand swap|tokens from (env|config)|without code changes)\b"),
        ],
    },
    {
        "id": "accessibility",
        "label": "Accessibility",
        "detect": [
            r"\baccessibility\b",
            r"\ba11y\b",
            r"\bwcag\b",
            r"\bscreen[- ]reader\b",
            r"\bkeyboard navigation\b",
            r"\btouch[- ]target\b",
            r"\bcolor contrast\b",
        ],
        "required": [
            ("automated a11y linter/audit", r"\b(axe-core|lighthouse-a11y|accessibility-scanner|XCTest accessibility|a11y linter|automated a11y)\b"),
            ("keyboard or touch-target audit", r"\b(keyboard navigation|touch[- ]target|44(?:×|x)44|48(?:×|x)48)\b"),
            ("screen-reader labels", r"\b(screen[- ]reader|accessibility label|aria-label|contentDescription|VoiceOver|TalkBack)\b"),
            ("WCAG contrast", r"\b(WCAG|4\.5:1|3:1|color contrast|contrast audit)\b"),
        ],
    },
    {
        "id": "onboarding-consent",
        "label": "Onboarding & consent",
        "detect": [
            r"\bonboarding\b",
            r"\bfirst[- ]run\b",
            r"\bconsent capture\b",
            r"\bpermission education\b",
            r"\bprivacy intro\b",
            r"\bpermission flow\b",
        ],
        "required": [
            ("first-run/onboarding education", r"\b(first[- ]run|onboarding|core workflow)\b"),
            ("consent or permission rationale", r"\b(consent|permission education|permission needs?|sensitive OS capabilities|privacy-sensitive)\b"),
            ("completion persistence test", r"\b(not shown again|completion|completed|UI test|UITest|Playwright|Espresso|XCUITest)\b"),
        ],
    },
    {
        "id": "account-identity",
        "label": "Account identity",
        "detect": [
            r"\bauth(?:entication)?\b",
            r"\baccount identity\b",
            r"\bsign[- ]?up\b",
            r"\bsign[- ]?in\b",
            r"\blogin\b",
            r"\boauth\b",
            r"\bsso\b",
            r"\bbiometric\b",
            r"\bpassword reset\b",
            r"\bsession refresh\b",
            r"\bsign[- ]?out\b",
        ],
        "required": [
            ("sign-up/sign-in flows", r"\b(sign[- ]?up|register)\b[\s\S]{0,200}\b(sign[- ]?in|login)\b|\b(sign[- ]?in|login)\b[\s\S]{0,200}\b(sign[- ]?up|register)\b"),
            ("password reset", r"\b(password reset|forgot password)\b"),
            ("session refresh/sign-out", r"\b(session refresh|refresh token|session renewal)\b[\s\S]{0,200}\b(sign[- ]?out|logout)\b|\b(sign[- ]?out|logout)\b[\s\S]{0,200}\b(session refresh|refresh token|session renewal)\b"),
            ("auth integration tests", r"\b(integration test|happy path|failure path|invalid credentials|rate limited|account locked)\b"),
        ],
    },
    {
        "id": "admin-rbac",
        "label": "Admin & RBAC",
        "detect": [
            r"\brbac\b",
            r"\brole[- ]based\b",
            r"\brole management\b",
            r"\bprotected endpoint\b",
            r"\bauthori[sz]ation check\b",
            r"\buser/role\b",
            r"\brole transitions?\b",
            r"\baudit log\b",
        ],
        "required": [
            ("role enum/list", r"\b(role enum|concrete role list|roles?: .*(admin|owner|member|viewer))\b"),
            ("authorization on protected endpoints", r"\b(protected endpoint|authori[sz]ation check|policy check|guard)\b"),
            ("admin user/role UI", r"\b(admin UI|admin screen|user/role management|role management screen)\b"),
            ("audit log for role changes", r"\b(audit log|role transition)\b"),
        ],
    },
    {
        "id": "observability",
        "label": "Observability",
        "detect": [
            r"\bobservability\b",
            r"\bstructured logging\b",
            r"\berror tracking\b",
            r"\bmetrics\b",
            r"\bmonitoring\b",
            r"\balert routing\b",
            r"\bdiagnostics screen\b",
            r"\bcrash reporting\b",
            r"\bperformance profiling\b",
        ],
        "required": [
            ("structured logging", r"\b(structured logging|pino|winston|structlog|os_log|Timber|log level)\b"),
            ("error/crash tracking", r"\b(error tracking|Sentry|Rollbar|Honeybadger|Bugsnag|crash reporting|Android Vitals|Xcode Organizer)\b"),
            ("metrics or diagnostics", r"\b(metrics|Prometheus|CloudWatch|Datadog|diagnostics screen|storage metrics|app health)\b"),
            ("alerts or profiling", r"\b(alert routing|PagerDuty|Slack|email threshold|performance profiling|Instruments|Android Profiler)\b"),
        ],
    },
    {
        "id": "testing-qa",
        "label": "Testing & QA",
        "detect": [
            r"\btesting\s*&\s*qa\b",
            r"\bunit test setup\b",
            r"\bintegration test setup\b",
            r"\bUI test setup\b",
            r"\bE2E smoke\b",
            r"\bproperty[- ]based test\b",
            r"\bcoverage threshold\b",
        ],
        "required": [
            ("unit runner and threshold", r"\b(vitest|jest|pytest|XCTest|JUnit)\b[\s\S]{0,160}\b(coverage threshold|coverage)\b"),
            ("integration strategy", r"\b(integration test|testcontainers|in-memory postgres|mswjs|test double|fixture database)\b"),
            ("UI test runner", r"\b(Playwright|Espresso|XCUITest|Cypress|UI test)\b"),
            ("E2E smoke journey", r"\b(E2E smoke|full user journey|end-to-end smoke)\b"),
            ("property-based invariant", r"\b(property[- ]based|fast-check|hypothesis|critical domain invariant)\b"),
        ],
    },
    {
        "id": "cicd-release",
        "label": "CI/CD & Release",
        "detect": [
            r"\bci/cd\b",
            r"\bcicd\b",
            r"\bpipeline definition\b",
            r"\bGitHub Actions\b",
            r"\bGitLab CI\b",
            r"\bCircleCI\b",
            r"\bdeployment pipeline\b",
            r"\bpromotion task\b",
        ],
        "required": [
            ("pipeline provider", r"\b(GitHub Actions|GitLab CI|CircleCI|workflow|pipeline)\b"),
            ("lint/unit/integration/UI/build/deploy stages", r"\b(lint[\s\S]{0,240}unit[\s\S]{0,240}integration[\s\S]{0,240}(UI|ui|e2e)[\s\S]{0,240}build[\s\S]{0,240}(deploy|publish))\b"),
            ("environment promotion gates", r"\b(dev[\s\S]{0,120}staging[\s\S]{0,120}prod|promotion gate|gate requirements?)\b"),
            ("artifact publication target", r"\b(container registry|npm publish|App Store Connect|Play Console|built arte?fact|artifact publication)\b"),
        ],
    },
    {
        "id": "infrastructure-as-code",
        "label": "Infrastructure as Code",
        "detect": [
            r"\binfrastructure as code\b",
            r"\bIaC\b",
            r"\bterraform\b",
            r"\bpulumi\b",
            r"\bcloudformation\b",
            r"\bsecret management\b",
            r"\bdns\s*\+\s*tls\b",
        ],
        "required": [
            ("environment modules", r"\b(dev[\s\S]{0,160}staging[\s\S]{0,160}prod|workspace/var file|environment module)\b"),
            ("data-store provisioning", r"\b(Postgres|Redis|S3|blob|queue|data store|database)\b"),
            ("secret management", r"\b(AWS Secrets Manager|Doppler|Vault|secret management|environment-file strategy)\b"),
            ("DNS and TLS", r"\b(DNS|TLS|certificate)\b"),
        ],
    },
    {
        "id": "settings-debug-dev-ux",
        "label": "Settings, debug menu & dev UX",
        "detect": [
            r"\bsettings screen\b",
            r"\bdebug menu\b",
            r"\bdev UX\b",
            r"\bone-command setup\b",
            r"\bdev-setup\b",
            r"\bAPI endpoint switcher\b",
            r"\blocal debug actions?\b",
        ],
        "required": [
            ("user-facing settings", r"\b(settings screen|theme picker|locale picker|notification settings|account management)\b"),
            ("debug-only menu", r"\b(debug menu|DEBUG|dev builds?|feature flag|mock data|forced crash)\b"),
            ("one-command setup", r"\b(one-command setup|dev-setup|setup script|scripts/dev-setup\.sh|bootstrap)\b"),
        ],
    },
    {
        "id": "privacy-pii-compliance",
        "label": "Privacy, PII & compliance",
        "detect": [
            r"\bPII classification\b",
            r"\bprivacy compliance\b",
            r"\bGDPR\b",
            r"\bCCPA\b",
            r"\bdata export\b",
            r"\bdata deletion\b",
            r"\bage gate\b",
            r"\bcookie consent\b",
            r"\btracking consent\b",
        ],
        "required": [
            ("consent capture", r"\b(consent capture|cookie consent|tracking consent|first run consent)\b"),
            ("data export", r"\b(data export|right to know|GDPR Article 20|CCPA right to know|export.*JSON)\b"),
            ("data deletion", r"\b(data deletion|right to delete|GDPR Article 17|delete cascade|local stores?)\b"),
            ("PII classification and retention", r"\b(PII classification|retention period|sensitive|public)\b"),
        ],
    },
]


def md_escape(value):
    return str(value).replace("|", r"\|").replace("\n", " ")


def split_row(raw):
    trimmed = raw.strip()
    if trimmed.startswith("|"):
        trimmed = trimmed[1:]
    if trimmed.endswith("|"):
        trimmed = trimmed[:-1]
    cells = []
    current = []
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


def slugify(raw):
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


def read_optional(filename):
    path = os.path.join(target_dir, filename)
    if not os.path.exists(path):
        return ""
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def topic_patterns(topic):
    aliases = [
        topic["label"],
        topic["label"].replace("&", "and"),
        topic["id"].replace("-", " "),
    ]
    patterns = [re.escape(alias).replace(r"\ ", r"[-\s]+") for alias in aliases]
    patterns.extend(topic["detect"])
    return [re.compile(pattern, re.I) for pattern in patterns]


def topic_ids_in_text(raw):
    hits = []
    for topic in TOPICS:
        if any(pattern.search(raw) for pattern in topic_patterns(topic)):
            hits.append(topic["id"])
    return hits


def parse_epic_scope():
    text = read_optional("epics.md")
    scoped = {}
    if not text:
        return scoped

    current_section = ""
    current_heading = None
    current_lines = []

    def flush():
        if not current_heading:
            return
        block = "\n".join([current_heading, *current_lines])
        is_baseline = (
            re.search(r"\*\*Category:\*\*\s*baseline\b", block, re.I)
            or current_section == "baseline epics"
        )
        if not is_baseline:
            return
        for topic_id in topic_ids_in_text(block):
            scoped.setdefault(topic_id, []).append(f"epics.md:{current_heading.strip()}")

    for line in text.splitlines():
        if line.startswith("## "):
            flush()
            current_heading = None
            current_lines = []
            current_section = re.sub(r"[^a-z0-9]+", " ", line.replace("##", "", 1).lower()).strip()
            continue
        if line.startswith("### "):
            flush()
            current_heading = line.replace("###", "", 1).strip()
            current_lines = []
            continue
        if current_heading is not None:
            current_lines.append(line)
    flush()
    return scoped


def parse_brief_keyword_scope():
    text = read_optional("brief-keywords.md")
    covered = {}
    excluded = {}
    if not text:
        return covered, excluded

    table_lines = [line for line in text.splitlines() if line.strip().startswith("|")]
    if len(table_lines) < 3:
        return covered, excluded
    header = split_row(table_lines[0])
    normalised_header = [re.sub(r"[^a-z0-9]+", " ", cell.lower()).strip() for cell in header]

    def index_for(*needles):
        for index, name in enumerate(normalised_header):
            if any(needle in name for needle in needles):
                return index
        return -1

    keyword_index = index_for("keyword", "phrase")
    status_index = index_for("status")
    reason_index = index_for("covered by", "reason")
    if min(keyword_index, status_index, reason_index) < 0:
        return covered, excluded

    for raw in table_lines[2:]:
        if re.fullmatch(r"\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?", raw.strip()):
            continue
        cells = split_row(raw)
        padded = cells + [""] * max(0, len(header) - len(cells))
        keyword = padded[keyword_index].strip()
        status = padded[status_index].strip().lower()
        reason = padded[reason_index].strip()
        if not keyword and not reason:
            continue
        row_text = f"{keyword}\n{reason}"
        source = f"brief-keywords.md:{keyword or reason}"
        if "out-of-scope" in status or "out of scope" in status:
            for topic_id in topic_ids_in_text(row_text):
                excluded.setdefault(topic_id, []).append(source)
        elif "covered" in status:
            for topic_id in topic_ids_in_text(reason):
                covered.setdefault(topic_id, []).append(source)
    return covered, excluded


def load_plan_files():
    files = []
    for filename in sorted(name for name in os.listdir(target_dir) if PLAN_RE.match(name)):
        path = os.path.join(target_dir, filename)
        with open(path, encoding="utf-8") as handle:
            files.append({"name": filename, "text": handle.read()})
    return files


plan_files = load_plan_files()
now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

if not plan_files:
    with open(report_path, "w", encoding="utf-8") as report:
        report.write("---\n")
        report.write(f"generated_at: {now}\n")
        report.write("generated_by: scripts/validate-baseline-task-coverage.sh\n")
        report.write(f"target_dir: {target_dir}\n")
        report.write("detected_topic_count: 0\n")
        report.write("issue_count: 1\n")
        report.write("status: precondition-failed\n")
        report.write("---\n\n")
        report.write("# Baseline Task Coverage\n\n")
        report.write("❌ baseline_task_coverage: precondition failed\n\n")
        report.write("No `features-*.md`, `tasks-*.md`, or `remediation-*.md` files were found.\n")
    print(f"❌ baseline-task coverage: no plan files found — wrote {report_path}")
    sys.exit(2)

aggregate_text = "\n\n".join(f"# {item['name']}\n{item['text']}" for item in plan_files)
epic_scope = parse_epic_scope()
brief_covered_scope, brief_excluded_scope = parse_brief_keyword_scope()
results = []
excluded_results = []
issues = []

for topic in TOPICS:
    detect_patterns = topic_patterns(topic)
    required_patterns = [(label, re.compile(pattern, re.I)) for label, pattern in topic["required"]]
    matched_files = [
        item["name"]
        for item in plan_files
        if any(pattern.search(f"{item['name']}\n{item['text']}") for pattern in detect_patterns)
    ]
    scope_sources = []
    scope_sources.extend(epic_scope.get(topic["id"], []))
    scope_sources.extend(brief_covered_scope.get(topic["id"], []))
    excluded_sources = brief_excluded_scope.get(topic["id"], [])

    if excluded_sources and not scope_sources:
        excluded_results.append({
            "id": topic["id"],
            "label": topic["label"],
            "excludedSources": excluded_sources,
            "incidentalMatchedFiles": matched_files,
            "status": "excluded",
        })
        continue

    if not matched_files and not scope_sources:
        continue

    missing = [label for label, pattern in required_patterns if not pattern.search(aggregate_text)]
    result = {
        "id": topic["id"],
        "label": topic["label"],
        "matchedFiles": matched_files,
        "scopeSources": scope_sources,
        "requiredCount": len(required_patterns),
        "missing": missing,
        "status": "fail" if missing else "pass",
    }
    results.append(result)
    for label in missing:
        issues.append({
            "code": "missing-baseline-coverage",
            "topic": topic["id"],
            "topicLabel": topic["label"],
            "requirement": label,
            "matchedFiles": matched_files,
            "scopeSources": scope_sources,
            "message": f"{topic['label']} is in scope but missing required coverage: {label}",
        })

status = "fail" if issues else "pass"

with open(report_path, "w", encoding="utf-8") as report:
    report.write("---\n")
    report.write(f"generated_at: {now}\n")
    report.write("generated_by: scripts/validate-baseline-task-coverage.sh\n")
    report.write(f"target_dir: {target_dir}\n")
    report.write(f"detected_topic_count: {len(results)}\n")
    report.write(f"scoped_topic_count: {sum(1 for result in results if result['scopeSources'])}\n")
    report.write(f"excluded_topic_count: {len(excluded_results)}\n")
    report.write(f"issue_count: {len(issues)}\n")
    report.write(f"status: {status}\n")
    report.write("---\n\n")
    report.write("# Baseline Task Coverage\n\n")
    report.write(f"_Generated by `scripts/validate-baseline-task-coverage.sh` on {now}._\n\n")
    if issues:
        report.write("❌ baseline_task_coverage: fail\n\n")
        report.write("| Topic | Requirement | Files |\n")
        report.write("|---|---|---|\n")
        for issue in issues:
            files = ", ".join(f"`{name}`" for name in issue["matchedFiles"]) or "n/a"
            sources = ", ".join(f"`{source}`" for source in issue["scopeSources"]) or "n/a"
            report.write(f"| {md_escape(issue['topicLabel'])} | {md_escape(issue['requirement'])} | files: {files}; scope: {sources} |\n")
        report.write("\n")
    else:
        report.write("✅ baseline_task_coverage: pass\n\n")

    report.write("## Topic Summary\n\n")
    if results:
        report.write("| Topic | Status | Scope Sources | Matched Files | Missing Requirements |\n")
        report.write("|---|---|---|---|---|\n")
        for result in results:
            sources = ", ".join(f"`{source}`" for source in result["scopeSources"]) or "keyword detection"
            files = ", ".join(f"`{name}`" for name in result["matchedFiles"]) or "n/a"
            missing = ", ".join(result["missing"]) if result["missing"] else "none"
            report.write(f"| {md_escape(result['label'])} | `{result['status']}` | {md_escape(sources)} | {files} | {md_escape(missing)} |\n")
    else:
        report.write("No baseline topics were detected in plan files.\n")

    if excluded_results:
        report.write("\n## Excluded Baseline Topics\n\n")
        report.write("| Topic | Source | Incidental Matches |\n")
        report.write("|---|---|---|\n")
        for result in excluded_results:
            sources = ", ".join(f"`{source}`" for source in result["excludedSources"])
            matches = ", ".join(f"`{name}`" for name in result["incidentalMatchedFiles"]) or "none"
            report.write(f"| {md_escape(result['label'])} | {md_escape(sources)} | {matches} |\n")

    report.write("\n## Machine Summary\n\n")
    report.write("```json\n")
    report.write(json.dumps({
        "status": status,
        "detectedTopicCount": len(results),
        "scopedTopicCount": sum(1 for result in results if result["scopeSources"]),
        "excludedTopicCount": len(excluded_results),
        "issueCount": len(issues),
        "topics": results,
        "excludedTopics": excluded_results,
        "issues": issues,
    }, indent=2))
    report.write("\n```\n")

if issues:
    for issue in issues:
        files = ", ".join(issue["matchedFiles"]) or "scope-only"
        print(f"❌ {issue['topicLabel']}: missing {issue['requirement']} ({files})")
    print(f"❌ baseline-task coverage: fail — wrote {report_path}")
    sys.exit(1)

print(f"✅ baseline-task coverage: pass — wrote {report_path}")
PY
