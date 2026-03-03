## Purpose

Demonstrates an architecture decision example used in COVE examples for documenting trade-offs.

## Implementation Patterns

### Pattern 1: Decision Summary
Summarize the decision, alternatives, and rationale.

### Pattern 2: Risk Assessment
List risks and mitigation strategies.

## Examples

```markdown
Example: Choosing between Tauri and Electron - pros, cons, performance, distribution
```


## Detailed Example
Consider choosing between Tauri and Electron for a cross-platform desktop
app. Tauri offers smaller bundle sizes and Rust backends but has fewer
plugins; Electron provides rich ecosystem and easier Node.js integration but
larger binaries. Using COVE, draft the pros and cons and verify with
questions such as: "Does Tauri support my required native API?" and
"Are there licensing implications?" After verification, the final decision
may lean toward Tauri for performance-critical applications or Electron for
heavy use of Node modules.

```markdown
# Decision: Use Tauri
- Smaller footprint
- Rust excels at performance
- Must implement some native features manually
```
