# Native coordinator integration

The package ships `ai-prompt-host` (or `node .ai-prompts/dist/host-cli.js`) and a [native coordinator workflow](../prompts/orchestrators/native-coordinator.md). A native parent with actual user context, command tools and distinct subagent results can operate it without writing an adapter. This is a **trusted coordinator attestation** system. It does not authenticate callers, sign platform identities, run a model service, isolate the filesystem or make an invented observer real. If those native capabilities are unavailable, use an already trusted external integration or retain the missing-host blocker.

The producer authors the product and run. The parent owns host profiles, captures and registration; a distinct reviewer returns actual judgments. Native subagent instructions do not create an OS permission boundary. Use available sandbox controls independently, never assume different folders establish isolation. For Codex, [official subagent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents) describes delegation and inherited permissions. The workflow requests delegation through the managed project instructions, subject to higher-priority policy and actual tool availability.

## Setup once per actual instruction and producer context

The parent retains the exact user request as a source in the project, then writes the profile **outside the producer project**. Use absolute real paths (resolve platform aliases such as macOS `/var` first). Do not scrape private session/authentication stores or purchase API capacity. Profile fields are explicit:

```json
{
  "schemaVersion": 1,
  "coordinator": { "id": "actual-parent", "contextId": "actual-parent-context" },
  "implementer": { "id": "actual-producer", "contextId": "actual-producer-context" },
  "instruction": {
    "source": { "path": "USER-REQUEST.md", "sha256": "actual-file-sha256" },
    "quote": "Actual retained user instruction",
    "reference": "actual-message-or-native-goal-reference",
    "issuedAt": "actual-observed-instruction-time",
    "execution": "plan-only"
  },
  "provenance": {
    "text": "What the parent actually observed; identify host-local labels when native IDs are unavailable",
    "reference": "retained-native-instruction-observation"
  }
}
```

The example is a field guide, not a usable receipt. Use `reversible` only when the actual instruction authorizes implementation; preserve explicit planning stops and reserved checkpoints. A parent-generated correlation ID is a local correlation label, not a platform-authenticated identity. Record the actual spawn/result association separately. Ordinary defaults concern implementation choices, not consent, account access or owner-reserved decisions.

```bash
node .ai-prompts/dist/host-cli.js init --directory /absolute/external/host --project-root /absolute/project --profile /absolute/external/profile.json
node /absolute/external/host/runtime/host-cli.js authorize --directory /absolute/external/host --run prompts/outputs/runs/example/run.json
```

`init` creates a profile-bound verifier and empty receipts; it grants nothing. `authorize` compares the actual run instruction, source bytes, producer identity and execution policy to the captured profile. It neither verifies original product completeness nor grants a live action. A plan-only profile cannot authorize reversible implementation. Do not edit a profile to invent changed authority; retain a new actual instruction/context in a new host directory when needed.

Use the returned `cli` path for post-init host commands. API and CLI writes check their executing runtime against the retained manifest and reject version drift with an actionable pinned-command path. Use the returned `adapter.mjs` path as the public workflow CLI's explicit `--host`. Initialization retains a copy of the built JavaScript runtime under the external host, with a pinned manifest. The adapter checks its bytes and file inventory before import; later edits to the producer package do not silently change that verifier. Preserve the retained runtime and raw captures. An intentional runtime upgrade uses a separately reviewed integration and preserves earlier history. The parent can retain paths and the captured instruction in `HOST-ENVIRONMENT.json`; this file supplies transport, not acceptance.

## Actual review and observation registration

Generate the public `review` packet. For a repair, include `--previous` pointing to the retained same-run revision. Its source-to-criterion mappings and changed records are navigation; the reviewer must still read original clauses, target semantics and raw behavior. Unmapped sources and staging/supporting criteria are questions to investigate, never automatic approval or rejection.

After receiving a real reviewer result, the parent retains the reviewer's exact JSON envelope (`{"kind":"judgment","value":...}`) in the host's `captures/` directory and writes a capture. Keep the actual native spawn/result association alongside it; the JSON alone cannot establish origin:

```json
{
  "kind": "judgment",
  "value": { "...": "actual complete judgment from the distinct reviewer" },
  "origin": {
    "id": "actual-reviewer-id",
    "contextId": "actual-reviewer-context",
    "reference": "same-actual-reference-as-judgment",
    "observedAt": "same-observation-time-as-judgment"
  },
  "artifact": { "path": "captures/raw-review.json", "sha256": "actual-raw-response-sha256" }
}
```

The parent checks who actually returned it, what they inspected and its exact current binding. Matching identity fields alone cannot establish provenance. Never rewrite a stale fingerprint or manufacture a review under another name. The helper compares the retained JSON envelope with the submitted judgment and verifies shape, exact origin agreement, prerequisite readiness and current binding; the parent supplies the truth of the native observation.

For `evidence`, retain the actual command/consumer output, preserving failures. The captured raw bytes must equal the project's bound evidence artifact. `grant`, `resource` and `checkpoint` captures require the actual coordinator observation and their current binding; missing account access and owner replies remain pending. Do not register availability from a declaration alone. All non-authorization records require retained nonempty raw evidence.

```bash
node /absolute/external/host/runtime/host-cli.js register --directory /absolute/external/host --run prompts/outputs/runs/example/run.json --capture /absolute/external/host/captures/review.json
node .ai-prompts/dist/cli.js record prompts/outputs/runs/example/run.json --project-root . --host /absolute/external/host/adapter.mjs --from prompts/outputs/runs/example/review-envelope.json --expect-revision 1
node .ai-prompts/dist/cli.js validate prompts/outputs/runs/example/run.json --project-root . --host /absolute/external/host/adapter.mjs --boundary work-executable --id W1
```

Host registration does not alter canonical state; `record` appends the exact evidence/judgment through the existing revision check. Record rejected judgments too. Corrected evidence and judgments get new actual IDs and observations; do not replace a conflicting record. Grants and resources retain their canonical IDs across genuinely changed bindings, storing a distinct immutable attestation for each binding; stale versions cannot verify a current binding. Registration is idempotent for identical records, and same-ID conflicting processes cannot both publish. Configuration pins, checksums, confinement and immutable publication detect corruption and accidental drift; a hostile process with the same filesystem privileges can still alter the trust system.

If a capture is missing, stale, mismatched or corrupt, diagnose the concrete record and obtain the actual missing observation. Do not grant readiness to unblock the script. Preserve damaged evidence for investigation. A new host may be initialized from retained genuine observations only with explicit provenance; it is not a way to erase dissent.

For a new run, configure an independent `implementation` review duty. The host captures a separate reviewer envelope for `--purpose implementation --ids W1` against its current binding. Scope and implementation can be reviewed in one session but require separately bound judgments. Detail review precedes the executable check; a host must not register a producer assertion as an independent review. Historical runs with the field absent have no configured detail review.
