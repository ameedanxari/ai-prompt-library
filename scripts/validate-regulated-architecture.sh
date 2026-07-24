#!/usr/bin/env bash
# Validate regulated/cloud architecture planning quality.
#
# This gate is intentionally conditional: ordinary app plans do not need
# a source ledger or regulated controls matrix. When the planning context
# names high-risk domains, cloud-provider architecture, sensitive data,
# audit evidence, zero-data-loss claims, or high-risk AI automation, the
# architecture must become source-backed and provider/jurisdiction
# specific.
set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "info: no output directory at $TARGET_DIR - regulated architecture gate skipped"
  exit 0
fi

shopt -s nullglob
context_files=(
  "$TARGET_DIR/project-context.md"
  "$TARGET_DIR/product-vision.md"
  "$TARGET_DIR/brief-keywords.md"
  "$TARGET_DIR/epics.md"
  "$TARGET_DIR"/features-*.md
  "$TARGET_DIR/audit-report.md"
  "$TARGET_DIR/gap-list.md"
  "$TARGET_DIR/external-accounts.md"
  "$TARGET_DIR/architecture.md"
)

combined="$(mktemp)"
trap 'rm -f "$combined"' EXIT

for f in "${context_files[@]}"; do
  [ -f "$f" ] || continue
  {
    echo
    echo "### FILE: $f"
    cat "$f"
  } >> "$combined"
done

if [ ! -s "$combined" ]; then
  echo "info: no planning context files found - regulated architecture gate skipped"
  exit 0
fi

ARCH="$TARGET_DIR/architecture.md"
SOURCE_LEDGER="$TARGET_DIR/source-ledger.md"
fail=0

has() {
  grep -Eiq "$1" "$combined"
}

arch_has() {
  [ -f "$ARCH" ] && grep -Eiq "$1" "$ARCH"
}

count_arch_terms() {
  local count=0
  local pat
  for pat in "$@"; do
    if arch_has "$pat"; then
      count=$((count + 1))
    fi
  done
  echo "$count"
}

require_arch_file() {
  local reason="$1"
  if [ ! -f "$ARCH" ]; then
    echo "FAIL regulated architecture: missing architecture.md ($reason)"
    fail=1
    return 1
  fi
  return 0
}

require_arch_term() {
  local label="$1"
  local pattern="$2"
  if ! arch_has "$pattern"; then
    echo "FAIL regulated architecture: architecture.md missing $label"
    fail=1
  fi
}

research_signal=0
if has '(Google Cloud|GCP|Cloud Run|Cloud SQL|Spanner|Pub/Sub|VPC Service Controls|VPC-SC|Cloud KMS|CMEK|Cloud Armor|Security Command Center|medical|healthcare|patient|clinic|pharmac(y|ies|ist)|prescription|controlled drug|cannabis|CBPM|clinical safety|NHS|DTAC|DSPT|CQC|GPhC|MHRA|DCB0129|DCB0160|UK GDPR|data breach|zero data loss|data loss cannot happen|sensitive data|production grade|production-grade|millions of users|concurrent users|current best practice|latest best practice)'; then
  research_signal=1
fi

if [ "$research_signal" -eq 1 ]; then
  if [ ! -s "$SOURCE_LEDGER" ]; then
    echo "FAIL regulated architecture: research-triggered plan requires source-ledger.md"
    echo "  Create prompts/outputs/current/source-ledger.md with local/official sources before making regulated, cloud, security, or current-best-practice claims."
    fail=1
  elif ! grep -Eiq '(SRC-[0-9]+|https?://|official-docs|local-spec|Retrieved|inspected|Facts extracted)' "$SOURCE_LEDGER"; then
    echo "FAIL regulated architecture: source-ledger.md does not look like a usable source ledger"
    echo "  Include source rows with IDs, source type, retrieval/inspection time, extracted facts, and decisions influenced."
    fail=1
  fi
  require_arch_file "research-triggered plan needs a source-backed architecture blueprint" >/dev/null || true
fi

gcp_architecture_signal=0
if has '(GCP|Cloud Run|Cloud SQL|Spanner|Pub/Sub|VPC Service Controls|VPC-SC|Cloud KMS|CMEK|Cloud Armor|Security Command Center|BigQuery|Cloud Storage)' \
  || has 'Google Cloud.{0,80}(hosting|deployment|deploy(ed|ment)?|landing zone|workload|infrastructure|primary region)|(hosting|deployment|deploy(ed|ment)?|landing zone|workload|infrastructure|primary region).{0,80}Google Cloud'; then
  gcp_architecture_signal=1
fi

if [ "$gcp_architecture_signal" -eq 1 ]; then
  if require_arch_file "Google Cloud architecture requested"; then
    gcp_terms=$(count_arch_terms \
      'Cloud Run|GKE|Google Kubernetes Engine|App Engine' \
      'Cloud SQL|Spanner|Firestore|AlloyDB' \
      'Pub/Sub' \
      'Cloud Storage' \
      'BigQuery' \
      'Cloud Armor' \
      'VPC Service Controls|VPC-SC|Private Service Connect|private service' \
      'Cloud KMS|CMEK|KMS' \
      'Secret Manager' \
      'Security Command Center|SCC' \
      'Cloud Logging|Cloud Monitoring|Cloud Trace')
    if [ "$gcp_terms" -lt 6 ]; then
      echo "FAIL regulated architecture: Google Cloud plan is too generic ($gcp_terms/6 GCP-specific control groups found)"
      echo "  Expected GCP-native services such as Cloud Run/GKE, Cloud SQL/Spanner, Pub/Sub, Cloud Storage, BigQuery, Cloud Armor, VPC-SC, KMS/CMEK, Secret Manager, SCC, and Cloud Logging/Monitoring."
      fail=1
    fi
    if has '(UK|United Kingdom|NHS|clinic|pharmac(y|ies)|prescription|cannabis|controlled drug|CBPM)' \
      && ! arch_has '(europe-west2|London|United Kingdom|UK data residency|data residency)'; then
      echo "FAIL regulated architecture: UK Google Cloud plan must state region/data-residency posture"
      fail=1
    fi
  fi
fi

uk_health_signal=0
if has '(UK|United Kingdom|NHS|DTAC|DSPT|CQC|GPhC|MHRA|DCB0129|DCB0160|UK GDPR|cannabis|CBPM|controlled drug)' \
  && has '(health|medical|patient|clinic|pharmac(y|ies|ist)|prescription|clinical|drug)'; then
  uk_health_signal=1
fi

if [ "$uk_health_signal" -eq 1 ]; then
  if require_arch_file "UK healthcare / controlled-drug context detected"; then
    uk_terms=$(count_arch_terms \
      'UK GDPR|Data Protection Act|DPA 2018|ICO|DPIA|RoPA|DSAR' \
      'NHS|DSPT|DTAC|NHS Login|NHS number' \
      'DCB0129|DCB0160|clinical safety|clinical safety case|Clinical Safety Officer|CSO' \
      'CQC' \
      'GPhC|pharmacy regulator|pharmacist verification' \
      'MHRA|SaMD|medical device' \
      'Home Office|controlled drug|CD Register|FP10CD|Schedule 2|Schedule 3')
    if [ "$uk_terms" -lt 3 ]; then
      echo "FAIL regulated architecture: UK healthcare plan lacks UK-specific regulatory/control coverage ($uk_terms/3 terms found)"
      fail=1
    fi
    if arch_has 'HIPAA' && [ "$uk_terms" -lt 2 ]; then
      echo "FAIL regulated architecture: UK healthcare plan appears HIPAA-only"
      fail=1
    fi
  fi
fi

if has '(medical cannabis|cannabis|CBPM|controlled drug|Schedule[[:space:]]*[23]|CD Register|FP10CD)'; then
  if require_arch_file "controlled-drug / medical cannabis context detected"; then
    cd_terms=$(count_arch_terms \
      'CD Register|controlled drug register' \
      'FP10CD|private prescription|prescription form' \
      'Schedule[[:space:]]*[23]|Schedule 2|Schedule 3' \
      'pharmacist verification|Responsible Pharmacist|pharmacy verification' \
      'repeat supply|repeat prescription|dispensing interval|quantity limit' \
      'GPhC|Home Office|CQC' \
      'prescriber approval|clinical review|human approval')
    if [ "$cd_terms" -lt 3 ]; then
      echo "FAIL regulated architecture: controlled-drug workflow lacks prescription/dispensing/register controls ($cd_terms/3 terms found)"
      fail=1
    fi
  fi
fi

if has '(portal|portals)' && has '(patient|clinic|pharmac(y|ies))'; then
  if require_arch_file "multi-portal architecture detected"; then
    require_arch_term "bounded contexts or state/write ownership" '(bounded context|state ownership|write owner|system of record|source of truth|canonical owner)'
    bad_portal_lines=$(awk '
      {
        l = tolower($0)
        if ((l ~ /(patient |clinic |pharmacy )?portals? (is|are|as|=).*(source of truth|system of record|write owner)/ ||
             l ~ /portals? owns? .*(state|record|data|prescription|patient)/ ||
             l ~ /(source of truth|system of record|write owner).*portals?/) &&
            l !~ /(not|never|must not|does not|do not|only a ui|ui surface|not a boundary)/) {
          print NR ":" $0
        }
      }
    ' "$ARCH" 2>/dev/null || true)
    if [ -n "$bad_portal_lines" ]; then
      echo "FAIL regulated architecture: portal appears to be modelled as state/source-of-truth boundary"
      echo "$bad_portal_lines" | sed 's/^/  /'
      fail=1
    fi
  fi
fi

if has '(audit trail|audit trails|audit evidence|WORM|tamper|chain of custody|breach)'; then
  if require_arch_file "audit/evidence context detected"; then
    require_arch_term "immutable or locked audit/evidence retention" '(immutable|WORM|locked retention|retention lock|append-only|object lock|locked bucket|locked log)'
    require_arch_term "tamper-evident integrity verification" '(hash|hash chain|sequence|integrity verification|tamper-evident|checksum|Merkle)'
    require_arch_term "evidence export / chain of custody / fail-closed audit behavior" '(fail-closed|fail closed|evidence export|chain of custody|legal anchor|audit anchor|verification job)'
    bad_bq_anchor=$(awk '
      {
        l = tolower($0)
        if (l ~ /bigquery/ && l ~ /(legal|audit|evidence).*anchor/ &&
            l !~ /(not|never|query|export|analytics|not .*anchor)/) {
          print NR ":" $0
        }
      }
    ' "$ARCH" 2>/dev/null || true)
    if [ -n "$bad_bq_anchor" ]; then
      echo "FAIL regulated architecture: BigQuery is presented as the legal/audit evidence anchor"
      echo "  Use immutable/locked Cloud Storage or locked logging as the anchor; BigQuery can query/export evidence."
      echo "$bad_bq_anchor" | sed 's/^/  /'
      fail=1
    fi
  fi
fi

if has '(Pub/Sub|pub-sub|message queue|event bus|event-driven|eventing)'; then
  if require_arch_file "eventing context detected"; then
    bad_queue_authority=$(awk '
      {
        l = tolower($0)
        if (l ~ /(pub\/sub|pub-sub|queue|event bus)/ && l ~ /(source of truth|system of record|durable authority|legal authority)/ &&
            l !~ /(not|never|must not|transport|not .*source|not .*authority)/) {
          print NR ":" $0
        }
      }
    ' "$ARCH" 2>/dev/null || true)
    if [ -n "$bad_queue_authority" ]; then
      echo "FAIL regulated architecture: queue/Pub/Sub appears to be the source of truth"
      echo "$bad_queue_authority" | sed 's/^/  /'
      fail=1
    fi
    require_arch_term "transactional outbox or inbox boundary" '(transactional outbox|outbox|inbox)'
    require_arch_term "idempotency, replay, DLQ, or ordering semantics" '(idempotent|idempotency|replay|dead-letter|DLQ|ordering key|ordered delivery|poison message)'
  fi
fi

if has '(zero data loss|data loss cannot happen|no data loss|RPO[[:space:]]*0|RPO=0)'; then
  if require_arch_file "zero-data-loss claim detected"; then
    require_arch_term "Tier 0 workflow scope" '(Tier 0|tier-zero|critical workflow|commit boundary)'
    require_arch_term "RPO/RTO or restore target" '(RPO|RTO|restore|PITR|point-in-time|backup drill|restore drill)'
    require_arch_term "outage/data-loss caveat" '(caveat|regional outage|region failure|trade-off|cannot guarantee|bounded by|commit boundary|synchronous commit)'
  fi
fi

if has '(AI|LLM|model automation|automated decision|DecisionTrace)' \
  && has '(clinical|medical|patient|prescrib|dispens|diagnos|triage|controlled drug|pharmacy)'; then
  if require_arch_file "high-risk AI healthcare workflow detected"; then
    require_arch_term "human approval or review gate for high-risk AI" '(human approval|human review|clinician approval|pharmacist approval|prescriber approval|manual review|human-in-the-loop)'
    require_arch_term "AI traceability / DecisionTrace / evidence capture" '(DecisionTrace|traceability|model trace|AI evidence|prompt log|decision evidence|rationale log)'
    require_arch_term "AI final-authority boundary or kill switch" '(kill switch|cannot finali[sz]e|must not finali[sz]e|not allowed to finali[sz]e|human final authority|AI final authority is forbidden)'
  fi
fi

if [ "$fail" -eq 0 ]; then
  echo "OK regulated architecture quality gate passed"
  exit 0
else
  echo ""
  echo "regulated architecture issues detected - regenerate architecture.md/source-ledger.md via the planning engine"
  exit 1
fi
