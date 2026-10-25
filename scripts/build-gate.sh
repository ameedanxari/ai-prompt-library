#!/usr/bin/env bash
# build-gate.sh — after-each-task compile check for the executor.
#
# The executor runs per-task tests, but a passing test on a new file
# does not mean the whole project still builds. Field tests have seen
# executors ship syntax errors, duplicate top-level declarations, and
# broken imports because no whole-project compile was ever run between
# tasks. This script is the gate: "did the project still build after
# your change?"
#
# It auto-detects buildable stacks and uses a cheap compile check per task.
# Usable/milestone/release boundaries additionally require a production build.
# Unit tests remain the task's responsibility.
#
# Usage:
#   bash .ai-prompts/scripts/build-gate.sh [project-root] [--boundary task|usable|milestone|release] [--build-command COMMAND]
# Task checks may use cheap compilation. Usable/milestone/release boundaries
# additionally require the declared production build; typecheck is not a build.
#
# Exit codes:
#   0  every required compile/build check passed
#   1  a compile/build check failed or a detected stack lacks required tools
#   2  invalid invocation or no buildable stack detected

set -uo pipefail

ROOT="."
BOUNDARY="task"
BUILD_COMMAND=""
root_seen=0
while [ $# -gt 0 ]; do
  case "$1" in
    --boundary)
      [ $# -ge 2 ] || { echo 'build-gate: --boundary needs a value' >&2; exit 2; }
      BOUNDARY="$2"; shift 2 ;;
    --build-command)
      if [ $# -lt 2 ] || [ -z "$2" ]; then echo 'build-gate: --build-command needs a nonempty command' >&2; exit 2; fi
      BUILD_COMMAND="$2"; shift 2 ;;
    -*) echo "build-gate: unknown option $1" >&2; exit 2 ;;
    *)
      [ "$root_seen" -eq 0 ] || { echo 'build-gate: too many roots' >&2; exit 2; }
      ROOT="$1"; root_seen=1; shift ;;
  esac
done
case "$BOUNDARY" in
  task|usable|milestone|release) ;;
  *) echo "build-gate: invalid boundary $BOUNDARY" >&2; exit 2 ;;
esac
ROOT="$(cd "$ROOT" && pwd)" || exit 2

printf "=== build-gate: %s (%s boundary) ===\n" "$ROOT" "$BOUNDARY"

failures=()
checks_run=0
skipped=()

# ---------------------------------------------------------------------
# Android — Gradle / Kotlin
# ---------------------------------------------------------------------
# Detect via gradlew (preferred) or a settings.gradle* at the Android
# root. We look at both project-root and `android/` subdir layouts.
check_android() {
  local target
  for candidate in "$ROOT" "$ROOT/android"; do
    if [ -x "$candidate/gradlew" ]; then
      target="$candidate"
      break
    fi
  done
  [ -z "${target:-}" ] && return 0

  checks_run=$((checks_run + 1))
  local gradle_task=":app:compileDebugKotlin"
  [ "$BOUNDARY" = task ] || [ -n "$BUILD_COMMAND" ] || gradle_task=":app:assembleRelease"
  printf "\n[android] %s in %s\n" "$gradle_task" "$target"
  printf -- "--------------------------------------------\n"
  # Ordinary tasks use the cheap compile target. Boundaries package the
  # release variant, unless the project supplied an explicit build command.
  (
    cd "$target" || exit 2
    ./gradlew --no-daemon --console=plain "$gradle_task" 2>&1 | tail -40
    exit "${PIPESTATUS[0]}"
  )
  local rc=$?
  if [ $rc -ne 0 ]; then
    failures+=("android: ./gradlew $gradle_task exited $rc")
  else
    printf "[android] OK\n"
  fi
}

# ---------------------------------------------------------------------
# iOS — xcodebuild
# ---------------------------------------------------------------------
# Detect via a .xcodeproj at project root or under ios/. We parse
# xcodebuild -list for the first scheme and run a build (no test, no
# install) for the iOS simulator SDK. xcodebuild is slow (~30–120 s)
# but is the only reliable way to catch duplicate-output errors, the
# pattern that broke the StorageCleaner field test.
check_ios() {
  local target
  for candidate in "$ROOT" "$ROOT/ios"; do
    if compgen -G "$candidate/*.xcodeproj" > /dev/null 2>&1 \
       || compgen -G "$candidate/*.xcworkspace" > /dev/null 2>&1; then
      target="$candidate"
      break
    fi
  done
  [ -z "${target:-}" ] && return 0

  if ! command -v xcodebuild >/dev/null 2>&1; then
    failures+=("ios: xcodebuild not in PATH"); return 0
  fi
  checks_run=$((checks_run + 1))
  printf "\n[ios] xcodebuild build in %s\n" "$target"
  printf -- "--------------------------------------------\n"
  # Discover the first scheme. Prefer workspace if present.
  local xcarg=()
  local ws proj
  ws=$(find "$target" -maxdepth 1 -name "*.xcworkspace" -print -quit)
  proj=$(find "$target" -maxdepth 1 -name "*.xcodeproj" -print -quit)
  if [ -n "$ws" ]; then
    xcarg=(-workspace "$ws")
  elif [ -n "$proj" ]; then
    xcarg=(-project "$proj")
  else
    skipped+=("ios: no workspace or project under $target")
    return 0
  fi

  local scheme
  scheme=$(xcodebuild "${xcarg[@]}" -list 2>/dev/null \
    | awk '/Schemes:/{f=1; next} f && NF {print; exit}' \
    | sed -E 's/^[[:space:]]+//;s/[[:space:]]+$//')
  if [ -z "$scheme" ]; then
    failures+=("ios: no scheme in $target")
    return 0
  fi

  # build-for-testing would be ideal but it can require signing; plain
  # `build` against the simulator SDK is the cheapest universal check.
  local configuration="Debug"
  [ "$BOUNDARY" = task ] || [ -n "$BUILD_COMMAND" ] || configuration="Release"
  xcodebuild "${xcarg[@]}" \
    -scheme "$scheme" \
    -sdk iphonesimulator \
    -configuration "$configuration" \
    -quiet \
    build 2>&1 | tail -40
  local rc=${PIPESTATUS[0]}
  if [ "$rc" -ne 0 ]; then
    failures+=("ios: xcodebuild -scheme $scheme build exited $rc")
  else
    printf "[ios] OK\n"
  fi
}

# ---------------------------------------------------------------------
# Node / TypeScript
# ---------------------------------------------------------------------
# A task uses typecheck when available, otherwise build, otherwise tsc.
# Boundary checks run BOTH the typecheck and production build when declared.
# Never let either command hide a failure in the other.
run_node_command() {
  local label="$1"
  shift
  checks_run=$((checks_run + 1))
  printf "\n[node] %s in %s\n" "$label" "$ROOT"
  (
    cd "$ROOT" || exit 2
    "$@" 2>&1 | tail -40
    exit "${PIPESTATUS[0]}"
  )
  local rc=$?
  if [ "$rc" -ne 0 ]; then
    failures+=("node: $label exited $rc")
  else
    printf "[node] OK\n"
  fi
}

check_node() {
  [ -f "$ROOT/package.json" ] || return 0
  if ! command -v node >/dev/null 2>&1; then
    failures+=("node: node not in PATH"); return 0
  fi
  local scripts
  scripts=$(node -e '
    const fs = require("node:fs");
    const p = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const scripts = p.scripts || {};
    for (const name of ["typecheck", "build"]) {
      if (typeof scripts[name] === "string" && scripts[name].trim()) console.log(name);
    }
  ' "$ROOT/package.json") || { failures+=("node: invalid package.json"); return 0; }
  local has_typecheck=0 has_build=0
  [[ "$scripts" != *typecheck* ]] || has_typecheck=1
  [[ "$scripts" != *build* ]] || has_build=1
  if [ "$has_typecheck" -eq 1 ] || [ "$has_build" -eq 1 ]; then
    if ! command -v npm >/dev/null 2>&1; then
      failures+=("node: npm not in PATH"); return 0
    fi
    if [ "$has_typecheck" -eq 1 ]; then
      run_node_command "npm run typecheck" npm run typecheck --silent
    fi
    if [ "$has_build" -eq 1 ] && [ -z "$BUILD_COMMAND" ] && { [ "$BOUNDARY" != task ] || [ "$has_typecheck" -eq 0 ]; }; then
      run_node_command "npm run build" npm run build --silent
    fi
  elif [ -f "$ROOT/tsconfig.json" ]; then
    if command -v npx >/dev/null 2>&1; then
      run_node_command "tsc --noEmit" npx --no-install tsc --noEmit
    else
      failures+=("node: npx not in PATH")
    fi
  fi
  if [ "$BOUNDARY" != task ] && [ "$has_build" -eq 0 ] && [ -z "$BUILD_COMMAND" ]; then
    failures+=("node: $BOUNDARY boundary requires a declared production build script")
  fi
}

# ---------------------------------------------------------------------
# Python — compileall (no imports, pure syntax)
# ---------------------------------------------------------------------
check_python() {
  if [ ! -f "$ROOT/pyproject.toml" ] \
     && [ ! -f "$ROOT/requirements.txt" ] \
     && [ ! -f "$ROOT/setup.py" ]; then
    return 0
  fi
  if ! command -v python3 >/dev/null 2>&1; then
    failures+=("python: python3 not in PATH")
    return 0
  fi

  if [ "$BOUNDARY" != task ] && [ -z "$BUILD_COMMAND" ]; then
    failures+=("python: $BOUNDARY boundary needs --build-command for the project production build; compileall is syntax only")
  fi
  # Skip venv / site-packages / build dirs. compileall -q reports only
  # errors; exit 1 on failures.
  checks_run=$((checks_run + 1))
  printf "\n[python] py_compile sweep in %s\n" "$ROOT"
  printf -- "--------------------------------------------\n"
  (
    cd "$ROOT" || exit 2
    python3 -m compileall -q -f \
      -x '(\.venv|venv|\.tox|\.git|node_modules|build|dist|__pycache__)' \
      . 2>&1 | tail -40
    exit "${PIPESTATUS[0]}"
  )
  local rc=$?
  if [ $rc -ne 0 ]; then
    failures+=("python: compileall exited $rc")
  else
    printf "[python] OK\n"
  fi
}

# ---------------------------------------------------------------------
# Go — go build
# ---------------------------------------------------------------------
check_go() {
  [ -f "$ROOT/go.mod" ] || return 0
  if ! command -v go >/dev/null 2>&1; then
    failures+=("go: go not in PATH")
    return 0
  fi
  checks_run=$((checks_run + 1))
  printf "\n[go] go build ./... in %s\n" "$ROOT"
  printf -- "--------------------------------------------\n"
  (
    cd "$ROOT" || exit 2
    go build ./... 2>&1 | tail -40
    exit "${PIPESTATUS[0]}"
  )
  local rc=$?
  if [ $rc -ne 0 ]; then
    failures+=("go: go build ./... exited $rc")
  else
    printf "[go] OK\n"
  fi
}

check_android
check_ios
check_node
check_python
check_go

# Explicit project command supports packaging/deployment builds that stack
# inference cannot know. Pass it verbatim to the shell in the project cwd;
# never interpolate paths or other script inputs into its source.
if [ -n "$BUILD_COMMAND" ]; then
  checks_run=$((checks_run + 1))
  printf "\n[production] explicit build command in %s\n" "$ROOT"
  (
    cd "$ROOT" || exit 2
    bash -c "$BUILD_COMMAND" 2>&1 | tail -40
    exit "${PIPESTATUS[0]}"
  )
  rc=$?
  [ "$rc" -eq 0 ] || failures+=("production: explicit build command exited $rc")
fi

printf "\n=== build-gate: done ===\n"
if [ $checks_run -eq 0 ] && [ ${#failures[@]} -eq 0 ]; then
  printf "⚠️  no buildable stack detected under %s\n" "$ROOT"
  printf "Expected one of: gradlew, *.xcodeproj/*.xcworkspace, package.json,\n"
  printf "pyproject.toml, requirements.txt, go.mod.\n"
  if [ ${#skipped[@]} -gt 0 ]; then
    printf "\nSkipped: %s\n" "${skipped[*]}"
  fi
  exit 2
fi

printf "Ran %d check(s).\n" "$checks_run"
if [ ${#skipped[@]} -gt 0 ]; then
  printf "Skipped: %s\n" "${skipped[*]}"
fi

if [ ${#failures[@]} -eq 0 ]; then
  printf "✅ build-gate: pass — every detected stack compiled cleanly.\n"
  exit 0
fi

printf "❌ build-gate: fail\n"
for f in "${failures[@]}"; do
  printf "  - %s\n" "$f"
done
printf "\n"
printf "The task that triggered this gate must NOT be marked done.\n"
printf "Fix the build before moving on. Rollback options:\n"
printf "  1. Undo the last change and log the task as 'failed' with the\n"
printf "     specific compile error.\n"
printf "  2. Fix the compile error in the same task, then re-run this gate.\n"
printf "  3. If the error comes from a file declared by the plan but\n"
printf "     colliding with one already on disk, consult path-ledger.md —\n"
printf "     the canonical path is the one the ledger records.\n"
exit 1
