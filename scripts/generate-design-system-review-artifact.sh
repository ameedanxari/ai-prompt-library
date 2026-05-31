#!/usr/bin/env bash
# generate-design-system-review-artifact.sh — create a static HTML
# design-system review page from ui-reference-source-map.md.
#
# Usage:
#   bash scripts/generate-design-system-review-artifact.sh [source-map] [output-html]
#
# Defaults:
#   source-map  prompts/outputs/current/ui-reference-source-map.md
#   output-html docs/design-system/review/index.html
#
# The generated page is self-contained and is validated before exit.

set -uo pipefail

SOURCE_MAP="${1:-prompts/outputs/current/ui-reference-source-map.md}"
OUTPUT_HTML="${2:-docs/design-system/review/index.html}"

resolve_script_dir() {
  local source="${BASH_SOURCE[0]}"
  while [ -L "$source" ]; do
    local dir
    dir="$(cd -P "$(dirname "$source")" && pwd)"
    local target
    target="$(readlink "$source")"
    case "$target" in
      /*) source="$target" ;;
      *) source="$dir/$target" ;;
    esac
  done
  cd -P "$(dirname "$source")" && pwd
}
SCRIPT_DIR="$(resolve_script_dir)"

if [ ! -f "$SOURCE_MAP" ]; then
  echo "❌ UI reference source map not found: $SOURCE_MAP" >&2
  exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found — required for review artifact generation" >&2
  exit 2
fi

bash "$SCRIPT_DIR/validate-ui-reference-source-map.sh" "$SOURCE_MAP" || exit $?

mkdir -p "$(dirname "$OUTPUT_HTML")"

python3 - "$SOURCE_MAP" "$OUTPUT_HTML" <<'PY'
import html
import re
import sys
from pathlib import Path

source_map = Path(sys.argv[1])
output_html = Path(sys.argv[2])
text = source_map.read_text(encoding="utf-8")
lines = text.splitlines()

REQUIRED_STATES = ["default", "loading", "empty", "error", "disabled", "success"]


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


def table_for_section(section_name: str) -> tuple[list[str], list[dict[str, str]]]:
    wanted = normalise_heading(section_name)
    current = ""
    table_lines: list[str] = []

    for line in lines:
        if line.startswith("## "):
            current = normalise_heading(line.replace("##", "", 1))
            continue
        if current == wanted and line.strip().startswith("|"):
            table_lines.append(line)

    if len(table_lines) < 2:
        return [], []

    header = split_row(table_lines[0])
    rows: list[dict[str, str]] = []
    for raw in table_lines[2:]:
        cells = split_row(raw)
        if not any(cells):
            continue
        padded = cells + [""] * max(0, len(header) - len(cells))
        rows.append(dict(zip(header, padded)))
    return header, rows


def section_lines(section_name: str) -> list[str]:
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


def product_direction() -> dict[str, str]:
    result = {
        "Existing style authority": "no explicit existing style authority recorded",
        "Design intent": "project-specific product interface direction from the source map",
        "Primary surfaces": "web, mobile, tablet, desktop",
        "Non-copy rule": "references are pattern inspiration only; do not copy brand assets or proprietary layouts",
    }
    for raw in section_lines("Product Design Direction"):
        match = re.match(r"\s*[-*]\s+\*\*([^:*]+):\*\*\s*(.*)", raw)
        if match:
            result[match.group(1).strip()] = match.group(2).strip()
    return result


def split_tokens(raw: str) -> list[str]:
    parts = re.split(r",|;", raw)
    values = [part.strip() for part in parts if part.strip()]
    return values or ["review item"]


def linkify(value: str, fallback_label: str | None = None) -> str:
    label = html.escape(fallback_label or value)
    target = value.strip()
    if re.match(r"https?://", target):
        return f'<a href="{html.escape(target)}">{label}</a>'
    if "/" in target or re.search(r"\.[a-z0-9]{2,5}$", target, re.IGNORECASE):
        return f'<a href="{html.escape(target)}">{label}</a>'
    return html.escape(value)


_, evidence_rows = table_for_section("Reference Evidence")
_, map_rows = table_for_section("Reference Map")
direction = product_direction()

components = sorted({
    item
    for row in map_rows
    for item in split_tokens(row.get("Components Affected", ""))
    if item.lower() not in {"n/a", "none"}
})
tokens = sorted({
    item
    for row in map_rows
    for item in split_tokens(row.get("Tokens Affected", ""))
    if item.lower() not in {"n/a", "none"}
})
accessibility_notes = [row.get("Accessibility Notes", "") for row in map_rows if row.get("Accessibility Notes")]
responsive_notes = [row.get("Responsive Notes", "") for row in map_rows if row.get("Responsive Notes")]

if not components:
    components = ["button", "card", "list", "form control", "modal", "toast"]
if not tokens:
    tokens = ["color", "typography", "spacing", "radius", "elevation", "motion"]

evidence_html = []
for row in evidence_rows:
    product_or_file = row.get("Product / File", "")
    availability = row.get("URL / Path / Availability", "")
    reference_cell = linkify(product_or_file)
    if re.match(r"https?://", availability) or "/" in availability:
        availability_cell = linkify(availability)
    else:
        availability_cell = html.escape(availability)
    evidence_html.append(
        "<tr>"
        f"<td>{html.escape(row.get('Row ID', ''))}</td>"
        f"<td>{html.escape(row.get('Source Type', ''))}</td>"
        f"<td>{reference_cell}</td>"
        f"<td>{html.escape(row.get('Flow / Screen', ''))}</td>"
        f"<td>{availability_cell}</td>"
        f"<td>{html.escape(row.get('Inspected At', ''))}</td>"
        f"<td>{html.escape(row.get('Evidence Quality', ''))}</td>"
        "<td>Do not copy; use as pattern inspiration only.</td>"
        f"<td>{html.escape(next((m.get('Product Decision', '') for m in map_rows if row.get('Row ID', '') in m.get('Evidence Row', '')), 'Use as supporting design evidence.'))}</td>"
        "</tr>"
    )

map_cards = []
for row in map_rows:
    map_cards.append(
        "<article class=\"map-card\">"
        f"<h3>{html.escape(row.get('Row ID', 'MAP'))} · {html.escape(row.get('Reference Category', 'Reference decision'))}</h3>"
        f"<p><strong>Evidence Row:</strong> {html.escape(row.get('Evidence Row', ''))}</p>"
        f"<p><strong>Observed Pattern:</strong> {html.escape(row.get('Observed Pattern', ''))}</p>"
        f"<p><strong>Product Decision:</strong> {html.escape(row.get('Product Decision', ''))}</p>"
        f"<p><strong>Non-copy Boundary:</strong> {html.escape(row.get('Non-copy Boundary', 'Do not copy; pattern inspiration only.'))}</p>"
        "</article>"
    )

component_cards = []
for component in components:
    component_cards.append(
        "<article class=\"component-card\">"
        f"<h3>{html.escape(component.title())}</h3>"
        "<p>Variants: primary, secondary, subtle, danger, disabled, compact, and comfortable.</p>"
        "<p>States covered: default, loading, empty, error, disabled, success.</p>"
        "</article>"
    )

token_items = "".join(f"<li>{html.escape(token)}</li>" for token in tokens)
component_items = "\n".join(component_cards)
map_items = "\n".join(map_cards)
evidence_rows_html = "\n".join(evidence_html)
responsive_items = "".join(f"<li>{html.escape(note)}</li>" for note in responsive_notes) or "<li>Mobile, tablet, desktop, and large desktop layouts must be reviewed.</li>"
accessibility_items = "".join(f"<li>{html.escape(note)}</li>" for note in accessibility_notes) or "<li>Contrast, focus, touch target, reduced motion, and screen reader behavior require review.</li>"

document = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Design System Review</title>
  <style>
    :root {{
      color-scheme: light;
      --surface: #f7f8fa;
      --panel: #ffffff;
      --text: #1c2430;
      --muted: #5d6978;
      --accent: #145c9e;
      --border: #d8dee8;
      --success: #147849;
      --error: #b42318;
      --warning: #b54708;
      --radius: 8px;
      --shadow: 0 1px 2px rgba(16, 24, 40, .08);
    }}
    body {{
      margin: 0;
      background: var(--surface);
      color: var(--text);
      font: 15px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }}
    main {{
      max-width: 1120px;
      margin: 0 auto;
      padding: 32px 20px 56px;
    }}
    section {{
      margin: 0 0 28px;
      padding: 20px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }}
    h1, h2, h3 {{
      margin: 0 0 12px;
      line-height: 1.2;
    }}
    h1 {{ font-size: 30px; }}
    h2 {{ font-size: 21px; }}
    h3 {{ font-size: 16px; }}
    table {{
      width: 100%;
      border-collapse: collapse;
      overflow-wrap: anywhere;
    }}
    th, td {{
      padding: 10px;
      border: 1px solid var(--border);
      text-align: left;
      vertical-align: top;
    }}
    th {{ background: #eef3f8; }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }}
    .chip-list {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 0;
      list-style: none;
    }}
    .chip-list li {{
      padding: 6px 10px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: #f7fbff;
    }}
    .swatch-row {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
    }}
    .swatch {{
      min-height: 64px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 10px;
      background: linear-gradient(135deg, var(--accent), #4c7a57);
      color: white;
    }}
    .state {{
      border-left: 4px solid var(--accent);
      padding: 10px;
      background: #fbfcfe;
    }}
    .state.error {{ border-left-color: var(--error); }}
    .state.success {{ border-left-color: var(--success); }}
    .state.loading {{ border-left-color: var(--warning); }}
    .viewport {{
      min-height: 84px;
      border: 1px dashed var(--border);
      border-radius: var(--radius);
      padding: 10px;
      background: #fbfcfe;
    }}
    a {{ color: var(--accent); }}
    @media (max-width: 640px) {{
      main {{ padding: 20px 12px 40px; }}
      h1 {{ font-size: 24px; }}
      section {{ padding: 16px; }}
    }}
  </style>
</head>
<body>
<main>
  <h1>Design System Review</h1>

  <section>
    <h2>Design Direction Summary</h2>
    <p><strong>Product surface:</strong> {html.escape(direction.get('Primary surfaces', 'web, mobile, tablet, desktop'))}.</p>
    <p><strong>Density:</strong> review compact, comfortable, and data-dense moments against the reference map.</p>
    <p><strong>Navigation model:</strong> derive navigation from component and flow evidence; confirm sidebar, tab, stack, and modal behavior before screen work.</p>
    <p><strong>Style authority:</strong> {html.escape(direction.get('Existing style authority', 'no explicit existing style authority recorded'))}.</p>
    <p><strong>Redesign status:</strong> no redesign or rebrand is approved unless a task explicitly records that approval.</p>
    <p><strong>Design intent:</strong> {html.escape(direction.get('Design intent', 'project-specific product interface direction from the source map'))}.</p>
    <p><strong>Non-copy rule:</strong> {html.escape(direction.get('Non-copy rule', 'references are pattern inspiration only; do not copy brand assets or proprietary layouts'))}.</p>
  </section>

  <section>
    <h2>Reference Evidence Panel</h2>
    <table>
      <thead>
        <tr>
          <th>Row ID</th>
          <th>Source Type</th>
          <th>Product / File</th>
          <th>Flow / Screen</th>
          <th>URL / Path / Availability</th>
          <th>Inspected At</th>
          <th>Evidence Quality</th>
          <th>Non-copy Boundary</th>
          <th>Design Decision</th>
        </tr>
      </thead>
      <tbody>
        {evidence_rows_html}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Reference Map Decisions</h2>
    <div class="grid">
      {map_items}
    </div>
  </section>

  <section>
    <h2>Token Swatches</h2>
    <p>Color, typography, spacing, radius, elevation, motion, semantic aliases, and platform mapping for web, iOS, and Android are reviewed here.</p>
    <div class="swatch-row">
      <div class="swatch">Color / semantic token</div>
      <div class="swatch">Typography / font scale</div>
      <div class="swatch">Spacing / radius / elevation</div>
      <div class="swatch">Motion / animation / reduced motion</div>
    </div>
    <ul class="chip-list">{token_items}</ul>
  </section>

  <section>
    <h2>Component Gallery</h2>
    <p>Component catalog and component library coverage for foundation primitives and composed screen elements.</p>
    <div class="grid">
      {component_items}
    </div>
  </section>

  <section>
    <h2>State Matrix</h2>
    <div class="grid">
      <div class="state">Default: baseline content and controls are visible.</div>
      <div class="state loading">Loading: progress indicator and skeleton rules are visible.</div>
      <div class="state">Empty: empty state copy, action, and layout are visible.</div>
      <div class="state error">Error: error copy, recovery action, and alert semantics are visible.</div>
      <div class="state">Disabled: disabled controls preserve contrast and explain unavailable actions.</div>
      <div class="state success">Success: completion, confirmation, and next action are visible.</div>
    </div>
  </section>

  <section>
    <h2>Responsive Previews</h2>
    <div class="grid">
      <div class="viewport"><strong>Mobile</strong><br>Phone viewport or native compact layout.</div>
      <div class="viewport"><strong>Tablet</strong><br>Tablet or iPad split layout.</div>
      <div class="viewport"><strong>Desktop</strong><br>Desktop primary workspace.</div>
      <div class="viewport"><strong>Large desktop</strong><br>Wide desktop / large screen density review.</div>
    </div>
    <ul>{responsive_items}</ul>
  </section>

  <section>
    <h2>Accessibility Notes</h2>
    <p>Contrast, focus order, touch target sizing, reduced motion, and screen reader labels must be reviewed before dependent screen work proceeds.</p>
    <ul>{accessibility_items}</ul>
  </section>

  <section>
    <h2>Feedback Checklist</h2>
    <ul>
      <li>Visual direction approval: confirm the design direction before screen-level implementation.</li>
      <li>Reference alignment: verify each REF row is represented without copying proprietary assets.</li>
      <li>Missing states: call out any default, loading, empty, error, disabled, or success state gap.</li>
      <li>Accessibility concerns: record contrast, focus, touch target, reduced motion, or screen reader concerns.</li>
      <li>Approval or blocking feedback: mark approved, approved with changes, or blocked.</li>
    </ul>
  </section>
</main>
</body>
</html>
"""

output_html.write_text(document, encoding="utf-8")
print(f"generated design-system review artifact: {output_html}")
PY

bash "$SCRIPT_DIR/validate-design-system-review-artifact.sh" "$OUTPUT_HTML" "$SOURCE_MAP" || exit $?
