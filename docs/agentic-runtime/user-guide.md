# Agentic Engineering Runtime – User Guide

## Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation

```bash
git clone <repository-url>
cd DPROMPT
npm install
```

### Your First Pipeline Run

```typescript
import { AgenticRuntime } from './src/agentic-runtime';

const runtime = new AgenticRuntime();
const result = await runtime.run('Build a REST API for a todo app with authentication');

console.log(`Stage: ${result.stage}`);
console.log(`Confidence: ${result.confidence?.overallScore}`);
console.log(`Plan steps: ${result.plan?.steps.length}`);
```

## Concepts

### Skills vs Prompts
The runtime treats **skills** as first-class engineering capabilities. Unlike raw prompts, skills have:
- Formal input/output schemas
- Dependency declarations
- Quality metrics
- Test definitions

### The Pipeline
Every prompt flows through these stages:
1. **Intent Parsing** – Understanding what you want
2. **Requirement Extraction** – Formalising the requirements
3. **Planning** – Decomposing into ordered, atomic tasks
4. **Execution** – Running each task with monitoring
5. **Critique** – Multi-perspective quality review
6. **Repair** – Automatic fix-and-retry for failures
7. **Validation** – Confidence scoring and gate checks

### Session Resumption
The runtime persists all state to disk. You can:
- Stop mid-execution and resume later
- Switch between models or IDEs
- Break work across days or weeks

```typescript
import { StateManager } from './src/coordination/state-manager';

const state = new StateManager('.state/my-project.json');
await state.recover(); // Loads previous state
```

## Best Practices

1. **Start with clear intent** – The more specific your prompt, the better the plan
2. **Review the plan before execution** – Check the generated steps make sense
3. **Monitor confidence scores** – Scores below 75 should trigger investigation
4. **Use hybrid mode during migration** – Gradually roll features to the new system
5. **Always run with quality gates** – Never bypass security or regression checks

## Troubleshooting

### Pipeline stuck at "executing"
Check the execution monitor for anomalies. The repair loop may be cycling.

### Low confidence score
Review the breakdown: `result.confidence.factors` lists specific concerns.

### Critic disagreement
The consensus engine logs disagreements. Check `ConsensusEngine.resolve()` output.

### State recovery failure
Ensure `.state/` directory has write permissions. Check `StateManager.recover()` return value.
