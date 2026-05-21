# Harness-Recovery Catalogs

When a per-task test or build-gate fails, the executor invokes
`scripts/diagnose-harness.sh`. That dispatcher routes to one of the
per-stack diagnose scripts in `scripts/diagnose-harness-<stack>.sh`,
which scan known crash-artifact locations and match what they find
against a catalog in this directory.

Each catalog file (`ios.yaml`, `android.yaml`, `web.yaml`,
`flutter.yaml`, `bash.yaml`) lists known crash signatures with three
fields:

| Field | Purpose |
|---|---|
| `signatures` | One or more regex patterns matched against stderr / parsed test artifacts. |
| `evidence_paths` | Where to look on disk for the structured artifact (xcresult, junit XML, logcat, etc.). |
| `classification` | One of `harness_crash`, `code_crash_known`, `code_crash_unknown`. Dictates which exit code the diagnose script returns. |
| `remediation` | Either a `recipe` (sequence of shell commands the script runs itself) or a `code_fix` (structured patch description the executor's AI step applies in the next loop iteration). |

The companion `<stack>.md` file is the human-readable reference
the planning engine pulls in during Step 3 when generating
test-related tasks, so the resulting task prompts already know
which crash classes the catalog covers.

## Adding a new catalog entry

Hit a crash that isn't in the catalog?

1. Run `bash scripts/diagnose-harness.sh ...` and inspect the
   resulting `harness-diagnosis.json`. The `confidence: low` and
   `classification: code_crash_unknown` combination is the signal.
2. Open the relevant `<stack>.yaml`.
3. Add an entry with a tight regex (test it against the captured
   stderr so it doesn't match unrelated failures) and a deterministic
   recipe or code-fix recipe.
4. Add a test fixture under `tests/fixtures/harness/<stack>/<id>/`
   containing the captured stderr and the expected JSON output.

## Hard rules

1. **No LLM-only classification.** Every entry must be matchable
   by deterministic regex / parsed-artifact lookup. If a class
   only has soft signals, leave it out — the catalog is for cases
   the script can identify with confidence.
2. **One retry per signature per task.** The dispatcher enforces
   this globally; the catalog cannot opt out. If a recipe doesn't
   work the first time, the executor blocks the task — it does not
   loop.
3. **Code-fix recipes describe a patch, do not apply one.** The
   conservative path: the script writes the structured `code_fix`
   into the JSON, the executor's AI step applies it with full task
   context, the patch is committed under the task's commit.
