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
# It auto-detects every buildable stack in the project root and runs
# the cheapest compile-only check for each. Unit tests are NOT run
# here — that is the task's own responsibility; this gate is a faster
# check that targets "does the code compile" only.
#
# Usage:
#   bash scripts/build-gate.sh [project-root]
#
# Exit codes:
#   0  every detected stack compiled cleanly
#   1  at least one stack failed to compile
#   2  no buildable stack detected (likely misconfigured) OR a required
#      tool is missing from PATH

set -uo pipefail

ROOT="${1:-.}"
ROOT="$(cd "$ROOT" && pwd)"

printf "=== build-gate: %s ===\n" "$ROOT"

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
  printf "\n[android] compileDebugKotlin in %s\n" "$target"
  printf -- "--------------------------------------------\n"
  # compileDebugKotlin is the cheapest "does Kotlin compile" task that
  # also exercises the manifest merger and resource processing enough
  # to catch most breakage. We do NOT run :app:assembleDebug — that
  # pulls in packaging and signing which are slower and noisier.
  (
    cd "$target" || exit 2
    ./gradlew --no-daemon --console=plain :app:compileDebugKotlin 2>&1 | tail -40
    exit "${PIPESTATUS[0]}"
  )
  local rc=$?
  if [ $rc -ne 0 ]; then
    failures+=("android: ./gradlew :app:compileDebugKotlin exited $rc")
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
  if ! command -v xcodebuild >/dev/null 2>&1; then
    # macOS-only — skip on Linux CI, etc.
    return 0
  fi
  local target
  for candidate in "$ROOT" "$ROOT/ios"; do
    if compgen -G "$candidate/*.xcodeproj" > /dev/null 2>&1 \
       || compgen -G "$candidate/*.xcworkspace" > /dev/null 2>&1; then
      target="$candidate"
      break
    fi
  done
  [ -z "${target:-}" ] && return 0

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
    skipped+=("ios: no scheme in $target")
    return 0
  fi

  # build-for-testing would be ideal but it can require signing; plain
  # `build` against the simulator SDK is the cheapest universal check.
  xcodebuild "${xcarg[@]}" \
    -scheme "$scheme" \
    -sdk iphonesimulator \
    -configuration Debug \
    -quiet \
    build 2>&1 | tail -40
  local rc=${PIPESTATUS[0]}
  if [ $rc -ne 0 ]; then
    failures+=("ios: xcodebuild -scheme $scheme build exited $rc")
  else
    printf "[ios] OK\n"
  fi
}

# ---------------------------------------------------------------------
# Node / TypeScript
# ---------------------------------------------------------------------
# Detect via package.json at project root. The project's own declared
# scripts are the source of truth — `npm run typecheck` first, then
# `npm run build`. We only fall back to `tsc --noEmit` when neither
# script is declared AND tsconfig.json exists, because bare tsc against
# a project that normally runs via esbuild/vitest tends to surface
# preexisting noise rather than regressions. We do NOT run `npm test`
# — tests are the executor's per-task concern.
check_node() {
  [ -f "$ROOT/package.json" ] || return 0
  command -v node >/dev/null 2>&1 || { skipped+=("node: node not in PATH"); return 0; }

  local cmd=""
  local label=""
  if node -e "process.exit(!(require('$ROOT/package.json').scripts||{}).typecheck ? 1 : 0)" 2>/dev/null; then
    cmd="npm run typecheck --silent"
    label="npm run typecheck"
  elif node -e "process.exit(!(require('$ROOT/package.json').scripts||{}).build ? 1 : 0)" 2>/dev/null; then
    cmd="npm run build --silent"
    label="npm run build"
  elif [ -f "$ROOT/tsconfig.json" ] && command -v npx >/dev/null 2>&1; then
    cmd="npx --no-install tsc --noEmit"
    label="tsc --noEmit"
  else
    # Nothing to check — a JS-only project with no build step is a
    # legitimate shape.
    return 0
  fi

  checks_run=$((checks_run + 1))
  printf "\n[node] %s in %s\n" "$label" "$ROOT"
  printf -- "--------------------------------------------\n"
  (
    cd "$ROOT" || exit 2
    # shellcheck disable=SC2086
    eval $cmd 2>&1 | tail -40
    exit "${PIPESTATUS[0]}"
  )
  local rc=$?
  if [ $rc -ne 0 ]; then
    failures+=("node: $label exited $rc")
  else
    printf "[node] OK\n"
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
    skipped+=("python: python3 not in PATH")
    return 0
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
    skipped+=("go: go not in PATH")
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

printf "\n=== build-gate: done ===\n"
if [ $checks_run -eq 0 ]; then
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
