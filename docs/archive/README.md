# Archived documentation

Files under this directory describe **earlier versions** of the
library and do not reflect v1.0 architecture. They are preserved for
historical reference and to help anyone debugging a consumer project
that was set up under an older layout.

**Do not follow these docs for a new project.** Use
[`../../QUICK_START.md`](../../QUICK_START.md) and
[`../../README.md`](../../README.md) instead.

## Subdirectories

### `v2-waterfall/`

Documentation for the deprecated 10-stage waterfall pipeline. The
waterfall files under `prompts/stages/**` still exist so legacy tests
pass, but they are no longer auto-loaded by any orchestrator.

Files:

- `migration-guide.md` — migration notes for moving to the v2
  waterfall. Obsolete under v1.0 drill-down engine.
- `quick-start-guides.md` — v2-era quick starts. Superseded by the
  single prompt in `QUICK_START.md`.
- `template-reference.md` — v2 template catalog. Superseded by
  `prompts/orchestrators/module-selection-index.md`.
- `best-practices.md` — v2 template-composition guidance.
- `commerce-app-guide.md`, `fintech-app-guide.md`,
  `healthcare-app-guide.md`, `social-app-guide.md` — v2 domain
  playbooks.
- `troubleshooting-guide.md` — references `NEXT_ACTION.md`,
  `PROJECT_STATE.md`, and stage prerequisites that do not exist in
  v1.0.

### `legacy-integration/`

Documentation for integration / self-stabilization machinery that was
simplified or removed for v1.0.

Files:

- `AUDIT_CENTRALIZATION_SUMMARY.md` — refers to `lib.sh` audit
  dispatcher; no longer present.
- `COVE_INTEGRATION.md`, `COVE_INTEGRATION_REVIEW.md`,
  `COVE_INTEGRATION_SUMMARY.md` — Chain-of-Verification
  orchestrator; removed.
- `SELF_STABILIZATION_ARCHITECTURE.md` — per-request
  self-stabilization flow; replaced by
  `scripts/bootstrap-project-integration.sh` +
  `scripts/reset-integration.sh`.
- `TOOL_INTEGRATION_GUIDE.md` — companion to self-stabilization;
  obsolete for the same reason.

## Can these be deleted?

Yes, safely — nothing in the active codebase, tests, scripts, or
orchestrators references them. They live here for people who might
otherwise be surprised that their old bookmark no longer resolves.
