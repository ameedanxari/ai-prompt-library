# Consumer outputs

New runs belong at project-relative `prompts/outputs/runs/<run-id>/run.json`, outside the installed `.ai-prompts` library and dependency directories. This library folder is documentation, not the destination for new consumer state. Keep referenced sources/evidence inside the declared project root. A new chat reuses a selected run; it does not reset product state or regenerate a backlog.

Existing checkpoints and manifests are historical consumer records, including older library-relative output locations. Inspect them read-only with the legacy inspection command; continue old tools only from their compatible pinned library version. Never silently migrate, overwrite or delete them. Generated summaries are views; change canonical run facts rather than edit a report into readiness.
