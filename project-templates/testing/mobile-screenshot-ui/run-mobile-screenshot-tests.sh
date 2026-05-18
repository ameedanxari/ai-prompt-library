#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
run-mobile-screenshot-tests.sh

Captures native mobile UI screenshots through platform UI tests.

required for iOS:
  --ios-project PATH      Xcode project or workspace path
  --ios-scheme NAME      app scheme to test

required for Android:
  --android-project DIR   Gradle project directory
  --android-test-class FQCN

optional:
  --ios                  run only iOS
  --android              run only Android
  --artifacts DIR        artifact root (default: artifacts/mobile-screenshots)
  --ios-test-target NAME UI test target name used in -only-testing
  --ios-devices LIST     comma-separated simulator names
  --android-avds LIST    comma-separated AVD names or candidates
  --android-locales LIST comma-separated locale tags (default: en)
  --timeout SECONDS      per Android Gradle test timeout (default: 900)
  --help                 show this help
EOF
}

RUN_IOS=true
RUN_ANDROID=true
ARTIFACTS_DIR="artifacts/mobile-screenshots"
IOS_PROJECT=""
IOS_SCHEME=""
IOS_TEST_TARGET=""
IOS_DEVICES="iPhone 16 Pro Max,iPad Pro 13-inch (M4)"
ANDROID_PROJECT=""
ANDROID_TEST_CLASS=""
ANDROID_AVDS="MobileScreenshots_Phone,Pixel_8,MobileScreenshots_Tablet,Pixel_Tablet"
ANDROID_LOCALES="en"
ANDROID_TIMEOUT_SECONDS=900

while [ $# -gt 0 ]; do
  case "$1" in
    --ios) RUN_ANDROID=false; shift ;;
    --android) RUN_IOS=false; shift ;;
    --artifacts) ARTIFACTS_DIR="${2:-}"; shift 2 ;;
    --ios-project) IOS_PROJECT="${2:-}"; shift 2 ;;
    --ios-scheme) IOS_SCHEME="${2:-}"; shift 2 ;;
    --ios-test-target) IOS_TEST_TARGET="${2:-}"; shift 2 ;;
    --ios-devices) IOS_DEVICES="${2:-}"; shift 2 ;;
    --android-project) ANDROID_PROJECT="${2:-}"; shift 2 ;;
    --android-test-class) ANDROID_TEST_CLASS="${2:-}"; shift 2 ;;
    --android-avds) ANDROID_AVDS="${2:-}"; shift 2 ;;
    --android-locales) ANDROID_LOCALES="${2:-}"; shift 2 ;;
    --timeout) ANDROID_TIMEOUT_SECONDS="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown argument: $1" >&2; usage >&2; exit 1 ;;
  esac
done

LOCK_DIR="${TMPDIR:-/tmp}/mobile_screenshot_tests.lock"
FAILED=()
PASSED=0

to_lines() {
  tr ',' '\n' | awk 'NF > 0 { gsub(/^[[:space:]]+|[[:space:]]+$/, ""); print }'
}

fail_soft() {
  FAILED+=("$1")
  echo "SOFT FAILURE: $1" >&2
}

require_arg() {
  local value="$1"
  local name="$2"
  if [ -z "$value" ]; then
    echo "missing required argument: $name" >&2
    usage >&2
    exit 1
  fi
}

prepare_artifacts() {
  rm -rf "$ARTIFACTS_DIR"
  mkdir -p "$ARTIFACTS_DIR/ios" "$ARTIFACTS_DIR/android" "$ARTIFACTS_DIR/debug"
}

cleanup_ios() {
  if command -v xcrun >/dev/null 2>&1; then
    xcrun simctl shutdown all >/dev/null 2>&1 || true
    killall Simulator >/dev/null 2>&1 || true
  fi
}

resolve_android_sdk() {
  if [ -z "${ANDROID_HOME:-}" ] && [ -z "${ANDROID_SDK_ROOT:-}" ]; then
    for candidate in "$HOME/Library/Android/sdk" "$HOME/Android/Sdk" "/opt/homebrew/share/android-sdk" "/usr/local/share/android-sdk"; do
      if [ -d "$candidate" ]; then
        export ANDROID_HOME="$candidate"
        export ANDROID_SDK_ROOT="$candidate"
        break
      fi
    done
  fi

  if [ -n "${ANDROID_HOME:-}" ]; then
    export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
  fi
}

cleanup_android() {
  resolve_android_sdk
  if command -v adb >/dev/null 2>&1; then
    adb devices 2>/dev/null | awk '/^emulator-/{print $1}' | while read -r serial; do
      [ -n "$serial" ] && adb -s "$serial" emu kill >/dev/null 2>&1 || true
    done
  fi
  pkill -f "emulator @" >/dev/null 2>&1 || true
  pkill -f "qemu-system" >/dev/null 2>&1 || true
}

capture_debug_bundle() {
  local reason="$1"
  local debug_dir="$ARTIFACTS_DIR/debug"
  mkdir -p "$debug_dir"
  printf '%s\n' "$reason" > "$debug_dir/failure-reason.txt"

  if command -v xcrun >/dev/null 2>&1; then
    local booted
    booted="$(xcrun simctl list devices booted -j 2>/dev/null | sed -n 's/.*"udid" : "\([^"]*\)".*/\1/p' | head -1 || true)"
    if [ -n "$booted" ]; then
      xcrun simctl io "$booted" screenshot "$debug_dir/ios-last-screen.png" >/dev/null 2>&1 || true
    fi
  fi

  if command -v adb >/dev/null 2>&1; then
    local serial
    serial="$(adb devices 2>/dev/null | awk '/^emulator-[0-9]+[[:space:]]+device$/{print $1; exit}')"
    if [ -n "$serial" ]; then
      adb -s "$serial" exec-out screencap -p > "$debug_dir/android-last-screen.png" 2>/dev/null || true
      adb -s "$serial" logcat -d > "$debug_dir/android-logcat.txt" 2>/dev/null || true
    fi
  fi
}

pick_ios_destination() {
  local requested="$1"
  local available="$2"
  if printf '%s\n' "$available" | grep -q "name:$requested"; then
    printf '%s\n' "$requested"
    return
  fi
  printf '%s\n' "$requested"
}

run_ios_screenshots() {
  require_arg "$IOS_PROJECT" "--ios-project"
  require_arg "$IOS_SCHEME" "--ios-scheme"

  if ! command -v xcodebuild >/dev/null 2>&1; then
    fail_soft "xcodebuild not found"
    return
  fi

  local only_testing=""
  if [ -n "$IOS_TEST_TARGET" ]; then
    only_testing="-only-testing:${IOS_TEST_TARGET}/StoreScreenshotUITests"
  fi

  local available
  available="$(xcodebuild -project "$IOS_PROJECT" -scheme "$IOS_SCHEME" -showdestinations 2>/dev/null || true)"

  while IFS= read -r requested_device; do
    [ -z "$requested_device" ] && continue
    local device
    device="$(pick_ios_destination "$requested_device" "$available")"
    local safe_device="${device// /_}"
    local result_bundle="$ARTIFACTS_DIR/debug/ios-${safe_device}.xcresult"
    rm -rf "$result_bundle"

    if SCREENSHOT_OUTPUT_DIR="$PWD/$ARTIFACTS_DIR" SCREENSHOT_DEVICE="$device" xcodebuild test \
      -project "$IOS_PROJECT" \
      -scheme "$IOS_SCHEME" \
      -destination "platform=iOS Simulator,name=$device" \
      $only_testing \
      -parallel-testing-enabled NO \
      -resultBundlePath "$result_bundle" \
      2>&1 | tee "$ARTIFACTS_DIR/debug/ios-${safe_device}.log"; then
      PASSED=$((PASSED + 1))
    else
      fail_soft "iOS screenshot tests failed for $device"
      capture_debug_bundle "iOS screenshot tests failed for $device"
    fi
  done < <(printf '%s' "$IOS_DEVICES" | to_lines)
}

ensure_android_single_target() {
  local connected
  connected="$(adb devices 2>/dev/null | awk 'NR > 1 && $2 == "device" { print $1 }')"
  local count
  count="$(printf '%s\n' "$connected" | awk 'NF { c++ } END { print c + 0 }')"
  if [ "$count" -gt 1 ]; then
    printf 'multiple Android devices connected:\n%s\n' "$connected" >&2
    return 1
  fi
}

launch_android_avd() {
  local avd="$1"
  adb emu kill >/dev/null 2>&1 || true
  emulator @"$avd" -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect -no-snapshot > "$ARTIFACTS_DIR/debug/emulator-${avd}.log" 2>&1 &
  local waited=0
  while [ "$waited" -lt 480 ]; do
    local serial
    serial="$(adb devices 2>/dev/null | awk '/^emulator-[0-9]+[[:space:]]+device$/{print $1; exit}')"
    if [ -n "$serial" ]; then
      local booted
      booted="$(adb -s "$serial" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')"
      if [ "$booted" = "1" ]; then
        export ANDROID_SERIAL="$serial"
        return 0
      fi
    fi
    sleep 5
    waited=$((waited + 5))
  done
  return 1
}

run_with_timeout() {
  local seconds="$1"
  shift
  "$@" &
  local pid=$!
  local elapsed=0
  while kill -0 "$pid" >/dev/null 2>&1; do
    if [ "$elapsed" -ge "$seconds" ]; then
      kill -TERM "$pid" >/dev/null 2>&1 || true
      sleep 5
      kill -KILL "$pid" >/dev/null 2>&1 || true
      wait "$pid" >/dev/null 2>&1 || true
      return 124
    fi
    sleep 5
    elapsed=$((elapsed + 5))
  done
  wait "$pid"
}

run_android_screenshots() {
  require_arg "$ANDROID_PROJECT" "--android-project"
  require_arg "$ANDROID_TEST_CLASS" "--android-test-class"
  resolve_android_sdk

  if ! command -v adb >/dev/null 2>&1 || ! command -v emulator >/dev/null 2>&1; then
    fail_soft "Android SDK tools not found"
    return
  fi

  local selected_avd=""
  while IFS= read -r candidate; do
    [ -z "$candidate" ] && continue
    if emulator -list-avds 2>/dev/null | grep -qx "$candidate"; then
      selected_avd="$candidate"
      break
    fi
  done < <(printf '%s' "$ANDROID_AVDS" | to_lines)

  if [ -z "$selected_avd" ]; then
    fail_soft "no configured Android AVD was found"
    return
  fi

  if ! launch_android_avd "$selected_avd"; then
    fail_soft "Android emulator did not boot: $selected_avd"
    capture_debug_bundle "Android emulator did not boot: $selected_avd"
    return
  fi

  if ! ensure_android_single_target; then
    fail_soft "Android device isolation failed"
    return
  fi

  while IFS= read -r locale; do
    [ -z "$locale" ] && continue
    local log="$ARTIFACTS_DIR/debug/android-${locale}.log"
    if run_with_timeout "$ANDROID_TIMEOUT_SECONDS" env \
      ANDROID_SERIAL="$ANDROID_SERIAL" \
      SCREENSHOT_OUTPUT_DIR="$PWD/$ARTIFACTS_DIR" \
      SCREENSHOT_DEVICE="$selected_avd" \
      "$ANDROID_PROJECT/gradlew" -p "$ANDROID_PROJECT" :app:connectedDebugAndroidTest \
      "-Pandroid.testInstrumentationRunnerArguments.class=$ANDROID_TEST_CLASS" \
      "-Pandroid.testInstrumentationRunnerArguments.locale=$locale" \
      2>&1 | tee "$log"; then
      PASSED=$((PASSED + 1))
    else
      fail_soft "Android screenshot tests failed for locale $locale"
      capture_debug_bundle "Android screenshot tests failed for locale $locale"
    fi
  done < <(printf '%s' "$ANDROID_LOCALES" | to_lines)
}

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "another screenshot run is active: $LOCK_DIR" >&2
  exit 1
fi

trap 'cleanup_ios; cleanup_android; rm -rf "$LOCK_DIR"' EXIT

prepare_artifacts
[ "$RUN_IOS" = true ] && cleanup_ios
[ "$RUN_ANDROID" = true ] && cleanup_android
[ "$RUN_IOS" = true ] && run_ios_screenshots
[ "$RUN_ANDROID" = true ] && run_android_screenshots

{
  echo "Mobile screenshot summary"
  echo "completed_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "passed_sets=$PASSED"
  echo "failed_sets=${#FAILED[@]}"
  for failure in "${FAILED[@]}"; do
    echo "failure=$failure"
  done
} | tee "$ARTIFACTS_DIR/summary.txt"

if [ "${#FAILED[@]}" -gt 0 ]; then
  exit 1
fi
