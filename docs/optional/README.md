# Optional Safeguard Docs

These files are **not auto-loaded** by orchestrators or entry points. Load them
only when the user explicitly requests safeguard / change-impact / commit-policy
guidance.

| File | When to load |
|---|---|
| `PREVENTION_CHECKLIST.md` | User asks about destructive-change prevention |
| `COMMIT_GUIDELINES.md` | User asks about commit policy or pre-commit hooks |
| `SAFEGUARDS.md` | User asks for safeguard system overview / troubleshooting |

Rule: do not read these during session startup, setup, routing, or pipeline
execution. Reading them costs ~500 lines of context that is irrelevant to most
user requests.
