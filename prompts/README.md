# `prompts/` — library content

| Subdirectory | Purpose |
|---|---|
| `AGENTS.md` | **Read this first.** Authoritative instructions for any AI agent. |
| `orchestrators/` | The 4 active orchestrators. See `AGENTS.md` for the flow. |
| `modules/` | 266 domain templates. The engine loads one at a time. |
| `steering/` | 3 IDE steering files (Cursor/Kiro/Windsurf/VSCode). |
| `templates/` | Older template artifacts, used by some internal tests. |
| `outputs/` | Where the engine writes. Generated outputs go under `outputs/current/`. |
| `stages/` | **Deprecated** 10-stage waterfall. Retained only so old tests pass. Do not read. |
| `working_copy/` | Optional user-supplied designs / mockups / specs. Loaded by `external-input-handler.md`. |

Everything an agent needs to know about the flow is in `AGENTS.md`. Do not
auto-load anything else in this tree beyond what that file lists.
