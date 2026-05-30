#!/usr/bin/env bash
#
# scaffold-screenshot-captures.sh — generate the full screenshot task
# matrix that baseline-task-shapes.md requires for app-store prep.
#
# Weak models consistently fail at expanding the locale × device matrix
# for app-store screenshots. They either emit one "generate screenshots"
# catch-all, or a handful of tooling tasks that iterate internally, or
# they split the axes into separate files. The rule is: one CAPTURE task
# per locale × per device class, each writing one concrete PNG to a
# specific path. Tooling tasks (Snapfile, UITest harness) live alongside
# them in the same file.
#
# This script generates that file with concrete default test identifiers
# and reviewable localized-copy checks for each frame.
#
# Usage:
#   bash scripts/scaffold-screenshot-captures.sh \
#        --target prompts/outputs/current \
#        --platform ios \
#        [--app-name StorageCleaner] \
#        [--locales en-US] \
#        [--devices iphone-6.7-inch,iphone-6.5-inch,iphone-5.5-inch] \
#        [--frames dashboard,privacy-permission,smart-groups,swipe-review,cleanup-results] \
#        [--feature-slug screenshots-ios] \
#        [--single-frame-ok "reason"] \
#        [--force]
#
# Exit codes:
#   0  scaffold written
#   1  usage / arg error
#   2  output file exists and --force not set

set -euo pipefail

usage() {
  cat <<'EOF'
scaffold-screenshot-captures.sh — generate the app-store screenshot task matrix

required:
  --target DIR          output directory (typically prompts/outputs/current)
  --platform P          ios | android

optional:
  --app-name NAME       app name used in signatures and paths  (default: App)
  --locales LIST        comma-separated BCP-47 tags
                        (default: current shell locale, falling back to
                        en-US; pass the locale list inferred from
                        MY_PROJECT.md or reference material)
  --devices LIST        comma-separated device identifiers
                        (default for ios: iphone-6.7-inch,iphone-6.5-inch,iphone-5.5-inch)
                        (default for android: pixel_7,pixel_tablet_7in,pixel_tablet_10in)
  --frames LIST         comma-separated frame slugs
                        (default: dashboard,privacy-permission,smart-groups,swipe-review,cleanup-results)
                        Use multiple store-flow scenarios by default; single-frame
                        matrices require --single-frame-ok with a reason.
  --feature-slug SLUG   output filename slug; file is tasks-<slug>.md
                        (default: screenshots-<platform>)
  --single-frame-ok R   allow a one-frame matrix and record the reason
  --force               overwrite output file if it exists
EOF
}

TARGET=""
PLATFORM=""
APP_NAME="App"
DEFAULT_LOCALE=$(locale 2>/dev/null | awk -F= '/^LANG=/{ gsub(/"/, "", $2); sub(/\..*$/, "", $2); gsub(/_/, "-", $2); print $2; exit }')
if [ -z "$DEFAULT_LOCALE" ] || [ "$DEFAULT_LOCALE" = "C" ] || [ "$DEFAULT_LOCALE" = "POSIX" ]; then
  DEFAULT_LOCALE="en-US"
fi
LOCALES="${DEFAULT_LOCALE:-en-US}"
DEVICES=""
FRAMES="dashboard,privacy-permission,smart-groups,swipe-review,cleanup-results"
FEATURE_SLUG=""
SINGLE_FRAME_OK=""
FORCE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --target)         TARGET="${2:-}"; shift 2 ;;
    --platform)       PLATFORM="${2:-}"; shift 2 ;;
    --app-name)       APP_NAME="${2:-}"; shift 2 ;;
    --locales)        LOCALES="${2:-}"; shift 2 ;;
    --devices)        DEVICES="${2:-}"; shift 2 ;;
    --frames)         FRAMES="${2:-}"; shift 2 ;;
    --feature-slug)   FEATURE_SLUG="${2:-}"; shift 2 ;;
    --single-frame-ok) SINGLE_FRAME_OK="${2:-}"; shift 2 ;;
    --force)          FORCE=1; shift ;;
    -h|--help)        usage; exit 0 ;;
    *) echo "❌ unknown argument: $1" >&2; usage >&2; exit 1 ;;
  esac
done

if [ -z "$TARGET" ] || [ -z "$PLATFORM" ]; then
  echo "❌ --target and --platform are required" >&2
  usage >&2
  exit 1
fi

if [ ! -d "$TARGET" ]; then
  echo "❌ target directory does not exist: $TARGET" >&2
  exit 1
fi

case "$PLATFORM" in
  ios)
    : "${DEVICES:=iphone-6.7-inch,iphone-6.5-inch,iphone-5.5-inch}"
    snap_config_name="Snapfile"
    snap_subcommand="snapshot"
    snap_verify="bundle exec fastlane snapshot --verify_only"
    ;;
  android)
    : "${DEVICES:=pixel_7,pixel_tablet_7in,pixel_tablet_10in}"
    snap_config_name="Screengrabfile"
    snap_subcommand="screengrab"
    snap_verify="bundle exec fastlane screengrab --verify_only"
    ;;
  *)
    echo "❌ --platform must be 'ios' or 'android' (got: $PLATFORM)" >&2
    exit 1
    ;;
esac

FEATURE_SLUG="${FEATURE_SLUG:-screenshots-${PLATFORM}}"
OUTPUT_FILE="$TARGET/tasks-${FEATURE_SLUG}.md"

if [ -f "$OUTPUT_FILE" ] && [ $FORCE -eq 0 ]; then
  echo "❌ $OUTPUT_FILE already exists — pass --force to overwrite" >&2
  exit 2
fi

# Split CSV into arrays by setting IFS temporarily.
to_lines() { tr ',' '\n' | awk 'NF > 0 { gsub(/^[[:space:]]+|[[:space:]]+$/, ""); print }'; }
LOCALE_COUNT=$(echo "$LOCALES" | to_lines | wc -l | tr -d ' ')
DEVICE_COUNT=$(echo "$DEVICES" | to_lines | wc -l | tr -d ' ')
FRAME_COUNT=$(echo "$FRAMES"  | to_lines | wc -l | tr -d ' ')
TOTAL_CAPTURES=$(( LOCALE_COUNT * DEVICE_COUNT * FRAME_COUNT ))

if [ "$FRAME_COUNT" -lt 2 ] && [ -z "$SINGLE_FRAME_OK" ]; then
  echo "❌ screenshot matrices must include at least two store-flow frames" >&2
  echo "   Default frames: dashboard,privacy-permission,smart-groups,swipe-review,cleanup-results" >&2
  echo "   If this is intentionally a single-frame reference artifact, pass:" >&2
  echo "     --single-frame-ok \"<why one frame is sufficient>\"" >&2
  exit 1
fi

# Ruby-style list for the Snapfile precise-change block.
ruby_list() {
  echo "$1" | to_lines | awk 'BEGIN { first = 1 } { if (!first) printf ", "; printf ":%s", $0; first = 0 } END { print "" }'
}
DEVICES_RUBY=$(ruby_list "$DEVICES")
LOCALES_RUBY=$(ruby_list "$LOCALES")

identifier_slug() {
  printf "%s" "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/_/g; s/^_+//; s/_+$//'
}

write_tooling() {
  cat <<TOOLING

## T1 · Fastlane config for ${PLATFORM} screenshot capture
- **Closes user story:** As the app, I need a fastlane config that declares the full screenshot matrix, so that every locale × device combination captures consistent frames.
- **Change type:** create-new
- **File:** \`fastlane/${snap_config_name}\`
- **Signature:** fastlane ${snap_subcommand} configuration
- **Precise change:** Declare \`devices [${DEVICES_RUBY}]\`, \`languages [${LOCALES_RUBY}]\`, \`output_directory './fastlane/screenshots'\`, \`scheme '${APP_NAME}UITests'\`. Do NOT hard-code a single test target here — each capture task passes \`--only_testing\` to scope to one frame.
- **Acceptance:**
  - \`${snap_verify}\` exits 0.
  - The config declares exactly ${DEVICE_COUNT} entries in \`devices\`.
  - The config declares exactly ${LOCALE_COUNT} entries in \`languages\`.
- **Test:** \`${snap_verify}\`
- **Estimated LOC:** +20
- **Depends on:** none

## T2 · Screenshot verification helper
- **Closes user story:** As the developer, I need a one-command verifier for a captured screenshot, so that each capture task has a named, runnable test.
- **Change type:** create-new
- **File:** \`tools/app-store/verify-screenshot.sh\`
- **Signature:** bash helper — \`verify-screenshot.sh <png-path>\`
- **Precise change:** Implement a bash script that accepts a PNG path argument, checks the file exists, verifies dimensions against a platform-specific size table (iPhone 6.7: 1290×2796; iPhone 6.5: 1242×2688; iPhone 5.5: 1242×2208; Pixel 7: 1080×2400; pixel_tablet_7in: 1200×1920; pixel_tablet_10in: 1600×2560), and asserts a baseline visual-diff against \`baselines/<locale>/<device>/<frame>.png\` using ImageMagick \`compare -metric AE\` with a tolerance of 0.5%.
- **Acceptance:**
  - \`tools/app-store/verify-screenshot.sh path/to/a.png\` exits 0 for a matching baseline.
  - It exits non-zero when dimensions or visual content differ.
  - It prints which check failed on non-zero exit (missing file / wrong dimensions / diff > tolerance).
- **Test:** \`bats tools/app-store/verify-screenshot.bats\`
- **Estimated LOC:** +60
- **Depends on:** none

TOOLING
}

write_capture() {
  local num="$1" locale="$2" device="$3" frame="$4"
  local locale_id device_id frame_id test_class test_method
  locale_id=$(identifier_slug "$locale")
  device_id=$(identifier_slug "$device")
  frame_id=$(identifier_slug "$frame")
  test_class="ScreenshotCaptureUITests"
  test_method="test_${locale_id}_${device_id}_${frame_id}"
  cat <<CAPTURE

## T${num} · Screenshot — ${locale} / ${device} / ${frame}
- **Closes user story:** As the app, I need a ${locale} ${device} ${frame} screenshot, so that the ${locale} app-store listing shows localised content on the ${device} form factor.
- **Change type:** create-new
- **File:** \`fastlane/screenshots/${locale}/${device}/${num}_${frame}.png\`
- **Signature:** PNG asset captured from ${test_class}.${test_method} in the ${locale} language snapshot
- **Precise change:** Run \`bundle exec fastlane ${snap_subcommand} --devices ${device} --languages ${locale} --only_testing ${APP_NAME}UITests/${test_class}/${test_method}\`. Fastlane writes the PNG to the File path above after the UI test renders the ${frame} screen in ${locale}.
- **Acceptance:**
  - File exists at \`fastlane/screenshots/${locale}/${device}/${num}_${frame}.png\`.
  - PNG dimensions match the ${device} form factor (see the size table in \`tools/app-store/verify-screenshot.sh\`).
  - OCR of the image contains ${locale}-localised copy for the ${frame} screen, including the ${APP_NAME} app name and the ${frame} screen title from the localised resource bundle.
- **Test:** \`tools/app-store/verify-screenshot.sh fastlane/screenshots/${locale}/${device}/${num}_${frame}.png\`
- **Estimated LOC:** +0
- **Depends on:** T1 (${snap_config_name} declares devices and languages), T2 (verify-screenshot.sh is the named Test)

CAPTURE
}

# Emit the file.
{
  echo "# Tasks — Screenshots (${PLATFORM})"
  echo ""
  echo "_Scaffolded by \`scripts/scaffold-screenshot-captures.sh\` on $(date -u +"%Y-%m-%dT%H:%M:%SZ")._"
  echo ""
  echo "_${TOTAL_CAPTURES} capture tasks + 2 tooling tasks = $(( TOTAL_CAPTURES + 2 )) total._"
  echo ""
  echo "_Review the generated test identifiers against the app's UITest naming before running the revise gate._"
  echo ""
  if [ -n "$SINGLE_FRAME_OK" ]; then
    echo "_Single-frame-ok: ${SINGLE_FRAME_OK}_"
    echo ""
  fi

  write_tooling

  num=3
  # Use nested loops via heredoc/process substitution to keep semantics portable.
  while IFS= read -r locale; do
    while IFS= read -r device; do
      while IFS= read -r frame; do
        write_capture "$num" "$locale" "$device" "$frame"
        num=$((num + 1))
      done < <(echo "$FRAMES" | to_lines)
    done < <(echo "$DEVICES" | to_lines)
  done < <(echo "$LOCALES" | to_lines)
} > "$OUTPUT_FILE"

cat <<SUMMARY
✅ scaffolded $OUTPUT_FILE
   platform: $PLATFORM
   app name: $APP_NAME
   locales ($LOCALE_COUNT): $LOCALES
   devices ($DEVICE_COUNT): $DEVICES
   frames  ($FRAME_COUNT): $FRAMES
   total tasks: $((TOTAL_CAPTURES + 2)) (2 tooling + $TOTAL_CAPTURES captures)

next steps:
  1. Open $OUTPUT_FILE and align generated UITest identifiers with the app if needed.
  2. Re-run: bash scripts/revise.sh $TARGET
SUMMARY
