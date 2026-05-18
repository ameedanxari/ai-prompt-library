#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
check-mobile-localization.sh

Validates localization key parity before native screenshot capture.

optional:
  --ios-resources DIR       directory containing en.lproj/Localizable.strings
  --android-res DIR         Android res directory containing values/strings.xml
  --base-ios LOCALE         iOS base locale directory prefix (default: en)
  --base-android QUALIFIER  Android base values qualifier (default: values)
  --locales LIST            comma-separated locales to check (default: ar,ur)
EOF
}

IOS_RESOURCES_DIR=""
ANDROID_RES_DIR=""
BASE_IOS="en"
BASE_ANDROID="values"
LOCALES="ar,ur"

while [ $# -gt 0 ]; do
  case "$1" in
    --ios-resources) IOS_RESOURCES_DIR="${2:-}"; shift 2 ;;
    --android-res) ANDROID_RES_DIR="${2:-}"; shift 2 ;;
    --base-ios) BASE_IOS="${2:-}"; shift 2 ;;
    --base-android) BASE_ANDROID="${2:-}"; shift 2 ;;
    --locales) LOCALES="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown argument: $1" >&2; usage >&2; exit 1 ;;
  esac
done

to_lines() {
  tr ',' '\n' | awk 'NF > 0 { gsub(/^[[:space:]]+|[[:space:]]+$/, ""); print }'
}

extract_ios_keys() {
  local file="$1"
  sed -n '/^[[:space:]]*$/d; /^[[:space:]]*\/\//d; /^[[:space:]]*"[^"]*"[[:space:]]*=/ { s/^[[:space:]]*"\([^"]*\)".*/\1/; p; }' "$file" | sort -u
}

extract_android_keys() {
  local file="$1"
  sed -n 's/.*<string[[:space:]][^>]*name="\([^"]*\)".*/\1/p' "$file" | sort -u
}

android_values_dir_for_locale() {
  local locale="$1"
  if [[ "$locale" == *-* ]]; then
    local language="${locale%%-*}"
    local region="${locale#*-}"
    printf 'values-%s-r%s\n' "$language" "$region"
  else
    printf 'values-%s\n' "$locale"
  fi
}

check_ios() {
  [ -z "$IOS_RESOURCES_DIR" ] && return 0

  local base_file="$IOS_RESOURCES_DIR/${BASE_IOS}.lproj/Localizable.strings"
  if [ ! -f "$base_file" ]; then
    echo "iOS base localization file missing: $base_file" >&2
    return 1
  fi

  local base_keys
  base_keys="$(extract_ios_keys "$base_file")"
  local failed=0

  while IFS= read -r locale; do
    [ -z "$locale" ] && continue
    local locale_file="$IOS_RESOURCES_DIR/${locale}.lproj/Localizable.strings"
    if [ ! -f "$locale_file" ]; then
      echo "iOS locale file missing: $locale_file" >&2
      failed=1
      continue
    fi

    local locale_keys missing extra
    locale_keys="$(extract_ios_keys "$locale_file")"
    missing="$(comm -23 <(printf '%s\n' "$base_keys") <(printf '%s\n' "$locale_keys"))"
    extra="$(comm -13 <(printf '%s\n' "$base_keys") <(printf '%s\n' "$locale_keys"))"

    if [ -n "$missing" ]; then
      echo "iOS $locale missing keys:" >&2
      printf '%s\n' "$missing" | sed 's/^/  - /' >&2
      failed=1
    fi
    if [ -n "$extra" ]; then
      echo "iOS $locale extra keys:" >&2
      printf '%s\n' "$extra" | sed 's/^/  - /' >&2
    fi
  done < <(printf '%s' "$LOCALES" | to_lines)

  return "$failed"
}

check_android() {
  [ -z "$ANDROID_RES_DIR" ] && return 0

  local base_file="$ANDROID_RES_DIR/$BASE_ANDROID/strings.xml"
  if [ ! -f "$base_file" ]; then
    echo "Android base localization file missing: $base_file" >&2
    return 1
  fi

  local base_keys
  base_keys="$(extract_android_keys "$base_file")"
  local failed=0

  while IFS= read -r locale; do
    [ -z "$locale" ] && continue
    local values_dir
    values_dir="$(android_values_dir_for_locale "$locale")"
    local locale_file="$ANDROID_RES_DIR/$values_dir/strings.xml"
    if [ ! -f "$locale_file" ]; then
      echo "Android locale file missing: $locale_file" >&2
      failed=1
      continue
    fi

    local locale_keys missing
    locale_keys="$(extract_android_keys "$locale_file")"
    missing="$(comm -23 <(printf '%s\n' "$base_keys") <(printf '%s\n' "$locale_keys"))"
    if [ -n "$missing" ]; then
      echo "Android $locale missing keys:" >&2
      printf '%s\n' "$missing" | sed 's/^/  - /' >&2
      failed=1
    fi
  done < <(printf '%s' "$LOCALES" | to_lines)

  return "$failed"
}

ios_failed=0
android_failed=0
check_ios || ios_failed=1
check_android || android_failed=1

if [ "$ios_failed" -eq 1 ] || [ "$android_failed" -eq 1 ]; then
  echo "localization check failed" >&2
  exit 1
fi

echo "localization check passed"
