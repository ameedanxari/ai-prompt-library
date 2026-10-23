# Release Plan

Load when release obligations affect the active slice or full-release evaluation is requested. The authoritative complete obligation set comes from original source requirement documents and the outcome manifest, never from an implementer-selected empty/subset gate file.

Write concise `release-plan.md` inside the selected run with intended package/deployment/candidate, actors/consumers, provider/configuration, current obligations, evidence/review requirements, operation/support ownership, recovery/rollback and unresolved owner inputs. Detail only active-slice actions; keep later release scope concise. Controlled/fake providers leave real-integration obligations open.

At release validate one consistent candidate on actual targets: useful entry-to-value/recovery, applicable identity/roles, security/privacy/safety, data/migration, accessibility/performance, real integrations, deployment/monitoring, backup/restore and packaging/distribution. Combine surface profiles in mixed systems. Use `bash .ai-prompts/scripts/validate-delivery.sh <run-directory> --stage release` and semantic review of raw evidence; passing task statuses/builds alone cannot prove readiness.

Keep plan-ready, proof-accepted, slice-accepted and release-ready separate. Required unproved outcomes prevent release-ready claims. Exclusions retain owner authority and remain exclusions, not successes. Required owner/reviewer acceptance needs trusted provenance bound to candidate/scope/artifact digests. An accepted-risk row cannot waive hard duties or prove missing behavior.

Release checks do not authorize publishing, charges, infrastructure applies, destructive drills or paid services. Obtain required authority and continue independent local work meanwhile. Legacy `release-gates.json`/validators remain explicit legacy projections and cannot bypass the outcome contract.
