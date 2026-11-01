# Workflow and references

Start at [the entry point](orchestrators/ai-agent-entry-point.md). Read [the model guide](../docs/model.md) when creating or changing `run.json`. Do not load this folder wholesale.

For substantial planning and review, read sources and decisions and consumer proof. Use state and operations when relevant to state, access or operations, and visual proof for a visual journey:

| Question | Reference |
| --- | --- |
| Which source is authoritative, what can be defaulted, and what needs an owner? | [Sources and decisions](references/sources-and-decisions.md) |
| Who owns state, access, operations and recovery? | [State and operations](references/state-and-operations.md) |
| Does the actual visual journey meet its intent? | [Visual proof](references/visual-proof.md) |
| Can the real consumer use it, and do checks detect failure? | [Consumer proof](references/consumer-proof.md) |

These guides supply questions and mechanisms, not features or mandatory document outputs. [Evidence and review](../docs/evidence-and-review.md) explains the boundary between retained observations, judgments and verified provenance. [Upgrade guidance](../docs/upgrading.md) covers historical runs. [Retirement decisions](../docs/retirement.md) identifies the preserved baseline and removed surface.
